// Minimal streaming PNG codec for the Landsat tiles (8-bit RGBA, non-interlaced).
//
// It has no native or WASM dependencies: zlib runs through the platform's
// DecompressionStream/CompressionStream, so the same code runs on Node (tests,
// scripts, `next dev`) and on Cloudflare Workers. Rows are decoded and encoded
// one at a time, so a 32-letter 1024px render never holds the full canvas in
// memory, which keeps it inside the Worker memory limit.

const SIGNATURE = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10);
const BYTES_PER_PIXEL = 4;
const IDAT_SIZE = 256 * 1024;
const ROWS_PER_WRITE = 16;

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}

function crc32(bytes, start, end) {
  let crc = 0xffffffff;
  for (let i = start; i < end; i += 1) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function parsePng(bytes) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  for (let i = 0; i < SIGNATURE.length; i += 1) {
    if (data[i] !== SIGNATURE[i]) throw new Error("Not a PNG file.");
  }

  let width = 0;
  let height = 0;
  const idat = [];

  for (let offset = SIGNATURE.length; offset + 8 <= data.length; ) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(...data.subarray(offset + 4, offset + 8));
    const body = data.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = view.getUint32(offset + 8);
      height = view.getUint32(offset + 12);
      const [bitDepth, colorType, , , interlace] = body.subarray(8, 13);
      if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
        throw new Error("Only 8-bit RGBA non-interlaced PNG tiles are supported.");
      }
    } else if (type === "IDAT") {
      idat.push(body);
    } else if (type === "IEND") {
      break;
    }

    offset += 12 + length;
  }

  if (!width || !height || !idat.length) throw new Error("Incomplete PNG file.");

  return { width, height, idat };
}

// Reads unfiltered RGBA rows from a PNG one at a time. The returned row is
// reused by the next call, so callers must copy it before reading again.
export class PngRowReader {
  constructor(bytes) {
    const { width, height, idat } = parsePng(bytes);
    this.width = width;
    this.height = height;
    this.stride = width * BYTES_PER_PIXEL;
    this.raw = new Uint8Array(this.stride + 1);
    this.prev = new Uint8Array(this.stride);
    this.cur = new Uint8Array(this.stride);
    this.chunk = new Uint8Array(0);
    this.offset = 0;
    this.reader = new ReadableStream({
      start(controller) {
        for (const part of idat) controller.enqueue(part);
        controller.close();
      },
    })
      .pipeThrough(new DecompressionStream("deflate"))
      .getReader();
  }

  async readRow() {
    const { raw } = this;
    let filled = 0;

    while (filled < raw.length) {
      if (this.offset >= this.chunk.length) {
        const { value, done } = await this.reader.read();
        if (done) throw new Error("PNG image data ended early.");
        this.chunk = value;
        this.offset = 0;
        continue;
      }

      const count = Math.min(raw.length - filled, this.chunk.length - this.offset);
      raw.set(this.chunk.subarray(this.offset, this.offset + count), filled);
      this.offset += count;
      filled += count;
    }

    unfilterRow(raw[0], raw.subarray(1), this.prev, this.cur);
    [this.prev, this.cur] = [this.cur, this.prev];
    return this.prev;
  }

  cancel() {
    return this.reader.cancel().catch(() => {});
  }
}

function unfilterRow(filter, src, prev, out) {
  const length = src.length;
  const bpp = BYTES_PER_PIXEL;

  switch (filter) {
    case 0:
      out.set(src);
      break;
    case 1:
      for (let i = 0; i < length; i += 1) {
        out[i] = (src[i] + (i >= bpp ? out[i - bpp] : 0)) & 0xff;
      }
      break;
    case 2:
      for (let i = 0; i < length; i += 1) out[i] = (src[i] + prev[i]) & 0xff;
      break;
    case 3:
      for (let i = 0; i < length; i += 1) {
        out[i] = (src[i] + (((i >= bpp ? out[i - bpp] : 0) + prev[i]) >> 1)) & 0xff;
      }
      break;
    case 4:
      for (let i = 0; i < length; i += 1) {
        const a = i >= bpp ? out[i - bpp] : 0;
        const c = i >= bpp ? prev[i - bpp] : 0;
        out[i] = (src[i] + paeth(a, prev[i], c)) & 0xff;
      }
      break;
    default:
      throw new Error(`Unsupported PNG filter type ${filter}.`);
  }
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

// Paeth-filters `row` (RGBA) against `prev` into `out[0..stride]`, where
// out[0] is the filter type byte.
function paethFilterRow(row, prev, out) {
  const bpp = BYTES_PER_PIXEL;
  out[0] = 4;
  for (let i = 0; i < row.length; i += 1) {
    const a = i >= bpp ? row[i - bpp] : 0;
    const c = i >= bpp ? prev[i - bpp] : 0;
    out[i + 1] = (row[i] - paeth(a, prev[i], c)) & 0xff;
  }
}

function pngChunk(type, data) {
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i += 1) chunk[4 + i] = type.charCodeAt(i);
  chunk.set(data, 8);
  view.setUint32(8 + data.length, crc32(chunk, 4, 8 + data.length));
  return chunk;
}

// Encodes an RGBA image as a PNG byte stream. `fillRow(y, row)` writes row `y`
// into the zeroed-or-previous `row` buffer (width * 4 bytes). Output is
// deterministic: rows are always Paeth-filtered and IDAT chunks have a fixed size.
export function encodePngStream({ width, height, fillRow, onCancel }) {
  const stride = width * BYTES_PER_PIXEL;
  const compressor = new CompressionStream("deflate");
  const compressed = compressor.readable.getReader();

  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width);
  ihdrView.setUint32(4, height);
  ihdr.set([8, 6, 0, 0, 0], 8);

  const produce = async () => {
    const writer = compressor.writable.getWriter();
    try {
      let row = new Uint8Array(stride);
      let prev = new Uint8Array(stride);

      for (let y = 0; y < height; ) {
        const rows = Math.min(ROWS_PER_WRITE, height - y);
        const batch = new Uint8Array(rows * (stride + 1));
        for (let r = 0; r < rows; r += 1, y += 1) {
          await fillRow(y, row);
          paethFilterRow(row, prev, batch.subarray(r * (stride + 1), (r + 1) * (stride + 1)));
          [prev, row] = [row, prev];
        }
        await writer.write(batch);
      }

      await writer.close();
    } catch (error) {
      await writer.abort(error).catch(() => {});
    }
  };

  let started = false;
  const pending = new Uint8Array(IDAT_SIZE);
  let pendingLength = 0;

  return new ReadableStream({
    start(controller) {
      const header = new Uint8Array(SIGNATURE.length + 25);
      header.set(SIGNATURE, 0);
      header.set(pngChunk("IHDR", ihdr), SIGNATURE.length);
      controller.enqueue(header);
    },
    async pull(controller) {
      if (!started) {
        started = true;
        produce();
      }

      for (;;) {
        const { value, done } = await compressed.read();

        if (done) {
          if (pendingLength) controller.enqueue(pngChunk("IDAT", pending.subarray(0, pendingLength)));
          controller.enqueue(pngChunk("IEND", new Uint8Array(0)));
          controller.close();
          return;
        }

        let emitted = false;
        for (let offset = 0; offset < value.length; ) {
          const count = Math.min(IDAT_SIZE - pendingLength, value.length - offset);
          pending.set(value.subarray(offset, offset + count), pendingLength);
          pendingLength += count;
          offset += count;

          if (pendingLength === IDAT_SIZE) {
            controller.enqueue(pngChunk("IDAT", pending));
            pendingLength = 0;
            emitted = true;
          }
        }

        if (emitted) return;
      }
    },
    async cancel(reason) {
      await compressed.cancel(reason).catch(() => {});
      await onCancel?.();
    },
  });
}

export async function streamToBytes(stream) {
  const parts = [];
  let length = 0;
  for await (const part of stream) {
    parts.push(part);
    length += part.length;
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return bytes;
}

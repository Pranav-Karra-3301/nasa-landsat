"use client";

import { useMemo, useState } from "react";

const MAX_LETTERS = 32;
const DEFAULT_TILE = 512;

/** Shown & copied URLs always use production so links work anywhere. */
const PUBLIC_SITE_HOST = "landsat.pranavkarra.me";
const PUBLIC_SITE_ORIGIN = `https://${PUBLIC_SITE_HOST}`;

function normalizeText(input) {
  return String(input ?? "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, MAX_LETTERS);
}

function buildPathAndQuery(normalized, format, { size, gap, seed }) {
  const params = new URLSearchParams();
  if (size !== DEFAULT_TILE) params.set("size", String(size));
  if (gap !== 0) params.set("gap", String(gap));
  if (seed && seed !== "default") params.set("seed", seed);

  const search = params.toString();
  const suffix = search ? `?${search}` : "";
  return `/v1/name/${encodeURIComponent(normalized)}.${format}${suffix}`;
}

export function PlaygroundClient() {
  const [text, setText] = useState("LANDSAT");
  const [size, setSize] = useState(DEFAULT_TILE);
  const [gap, setGap] = useState(0);
  const [seed, setSeed] = useState("default");
  const [urlKind, setUrlKind] = useState("png");
  const [copied, setCopied] = useState(false);

  const normalized = useMemo(() => normalizeText(text), [text]);
  const options = useMemo(() => ({ size, gap, seed }), [size, gap, seed]);

  const relativePng = normalized
    ? buildPathAndQuery(normalized, "png", options)
    : "";
  const relativeJson = normalized
    ? buildPathAndQuery(normalized, "json", options)
    : "";

  const pngUrl = normalized ? `${PUBLIC_SITE_ORIGIN}${relativePng}` : "";
  const jsonUrl = normalized ? `${PUBLIC_SITE_ORIGIN}${relativeJson}` : "";

  const activeUrl = urlKind === "png" ? pngUrl : jsonUrl;

  async function copyUrl() {
    if (!activeUrl) return;
    await navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="playground">
      <p className="playground-intro">
        Tune options below—the big preview updates as you type. Copied URLs use
        the public API at <strong className="playground-strong">{PUBLIC_SITE_HOST}</strong>{" "}
        so they work from any app or page.
      </p>

      <figure
        aria-label="Live Landsat lettering preview"
        className="playground-stage hero-preview"
      >
        <div className="playground-stage-chrome">
          <span className="playground-stage-title">Live preview</span>
        </div>
        <div className="playground-stage-canvas">
          {normalized ? (
            <img
              alt={`Landsat letters spelling ${normalized}`}
              className="hero-preview-img hero-preview-img--visible playground-stage-img"
              decoding="async"
              fetchPriority="high"
              loading="eager"
              src={relativePng}
            />
          ) : (
            <div
              aria-hidden="true"
              className="playground-stage-placeholder"
            >
              <p className="playground-stage-placeholder-text">
                Add a letter <span className="playground-strong">A–Z</span> to see
                your name here.
              </p>
            </div>
          )}
        </div>
      </figure>

      <section
        aria-labelledby="playground-settings-heading"
        className="playground-settings hero-preview"
      >
        <div className="playground-settings-head">
          <h2 id="playground-settings-heading" className="playground-settings-title">
            Settings &amp; link
          </h2>
          <p className="playground-settings-sub">
            Change text, sizing, spacing, seed, then copy the PNG or JSON URL.
          </p>
        </div>

        <div className="playground-settings-grid">
          <div className="playground-field playground-span-full">
            <label className="playground-label" htmlFor="playground-text">
              Text
            </label>
            <input
              autoComplete="off"
              className="playground-input playground-input-text"
              id="playground-text"
              inputMode="text"
              maxLength={64}
              onChange={(e) => setText(e.target.value)}
              spellCheck="false"
              type="text"
              value={text}
            />
            <p className="playground-hint" aria-live="polite">
              {normalized ? (
                <>
                  Renders as{" "}
                  <strong className="playground-strong">{normalized}</strong>{" "}
                  (letters A–Z, up to {MAX_LETTERS}).
                </>
              ) : (
                <>
                  Needs at least one letter{" "}
                  <span className="playground-strong">A–Z</span>. Spaces and
                  punctuation are ignored.
                </>
              )}
            </p>
          </div>

          <fieldset className="playground-fieldset">
            <legend className="playground-label">Tile size</legend>
            <div className="playground-segment playground-segment--fit" role="group">
              {[512, 1024].map((n) => (
                <button
                  aria-pressed={size === n}
                  className={`playground-segment-btn${size === n ? " playground-segment-btn--on" : ""}`}
                  key={n}
                  onClick={() => setSize(n)}
                  type="button"
                >
                  {n}px
                </button>
              ))}
            </div>
          </fieldset>

          <div className="playground-field playground-field--gap">
            <div className="playground-gap-row">
              <label className="playground-label" htmlFor="playground-gap">
                Gap between letters
              </label>
              <span className="playground-num">
                <input
                  aria-label="Gap between letters (pixels)"
                  className="playground-num-input"
                  id="playground-gap-number"
                  max={64}
                  min={0}
                  onChange={(e) => {
                    const v = Number.parseInt(e.target.value, 10);
                    if (Number.isNaN(v)) return;
                    setGap(Math.min(64, Math.max(0, v)));
                  }}
                  type="number"
                  value={gap}
                />
                <span className="playground-num-suffix">px</span>
              </span>
            </div>
            <input
              className="playground-range"
              id="playground-gap"
              max={64}
              min={0}
              onChange={(e) => setGap(Number(e.target.value))}
              type="range"
              value={gap}
            />
          </div>

          <div className="playground-field playground-span-full playground-field-tight-after">
            <label className="playground-label" htmlFor="playground-seed">
              Seed <span className="playground-optional">(optional)</span>
            </label>
            <input
              autoComplete="off"
              className="playground-input"
              id="playground-seed"
              onChange={(e) => setSeed(e.target.value || "default")}
              spellCheck="false"
              type="text"
              value={seed === "default" ? "" : seed}
              placeholder="default"
            />
            <p className="playground-hint">
              Same text + seed always picks the same letter variants.
            </p>
          </div>

          <fieldset className="playground-fieldset playground-span-full playground-field-tight-after">
            <legend className="playground-label">URL to copy</legend>
            <div className="playground-segment playground-segment--fit" role="group">
              <button
                aria-pressed={urlKind === "png"}
                className={`playground-segment-btn${urlKind === "png" ? " playground-segment-btn--on" : ""}`}
                onClick={() => setUrlKind("png")}
                type="button"
              >
                PNG image
              </button>
              <button
                aria-pressed={urlKind === "json"}
                className={`playground-segment-btn${urlKind === "json" ? " playground-segment-btn--on" : ""}`}
                onClick={() => setUrlKind("json")}
                type="button"
              >
                JSON metadata
              </button>
            </div>
          </fieldset>

          <div className="playground-url-row playground-span-full">
            <code className="playground-url" title={activeUrl}>
              {activeUrl || "—"}
            </code>
            <button
              className="copy-button playground-copy"
              disabled={!activeUrl}
              onClick={copyUrl}
              type="button"
            >
              {copied ? "Copied" : "Copy URL"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

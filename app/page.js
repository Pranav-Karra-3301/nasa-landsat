import { CodeBlock } from "./components/CodeBlock";
import { HeroImage } from "./components/HeroImage";

const githubUrl = "https://github.com/Pranav-Karra-3301/nasa-landsat";

const htmlExample = `<img
  src="https://landsat.pranavkarra.me/v1/name/PRANAV.png"
  alt="PRANAV rendered in Landsat imagery"
/>`;

const curlExample = `curl -L "https://landsat.pranavkarra.me/v1/name/PRANAV.json"`;

const fetchExample = `const res = await fetch("https://landsat.pranavkarra.me/v1/name/PRANAV.json");
const data = await res.json();

console.log(data.renderUrl);
console.log(data.letters.map((letter) => letter.sourceUrl));`;

export default function HomePage() {
  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="/">
          Landsat Alphabet API
        </a>
        <nav className="nav" aria-label="Primary">
          <a href={githubUrl}>GitHub</a>
          <a href="/openapi.json">OpenAPI</a>
          <a href="/llms.txt">llms.txt</a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">Public deterministic image API</p>
          <h1 id="page-title">Landsat Alphabet API</h1>
          <p className="lede">
            One URL in, one cached PNG out. Render text as stitched NASA/USGS
            Landsat letter imagery with deterministic variants and immutable
            cache headers.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="/v1/name/LANDSAT.png?size=512&gap=8">
              Open PNG
            </a>
            <a className="secondary-link" href="/v1/name/LANDSAT.json">
              View JSON
            </a>
          </div>
        </div>
        <HeroImage />
      </section>

      <section className="sections" aria-label="API documentation">
        <details open>
          <summary>Quick Start</summary>
          <div className="section-body">
            <p>
              Use the PNG endpoint anywhere an image URL works. The JSON endpoint
              returns the normalized text, selected letter variants, source URLs,
              and the PNG render URL.
            </p>
            <CodeBlock title="HTML" code={htmlExample} />
            <CodeBlock title="curl" code={curlExample} />
            <CodeBlock title="JavaScript" code={fetchExample} />
          </div>
        </details>

        <details>
          <summary>Endpoints</summary>
          <div className="section-body">
            <div className="table-panel">
              <table className="endpoint-table">
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Response</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>GET /v1/name/{"{text}"}.png</code>
                  </td>
                  <td>Stitched PNG with immutable public cache headers.</td>
                </tr>
                <tr>
                  <td>
                    <code>GET /v1/name/{"{text}"}.json</code>
                  </td>
                  <td>Selected letters, tile URLs, source URLs, and attribution.</td>
                </tr>
                <tr>
                  <td>
                    <code>GET /v1/manifest.json</code>
                  </td>
                  <td>Full inventory of available letter variants and tile sizes.</td>
                </tr>
                <tr>
                  <td>
                    <code>GET /openapi.json</code>
                  </td>
                  <td>OpenAPI 3.1 spec for API clients and tools.</td>
                </tr>
                <tr>
                  <td>
                    <code>GET /llms.txt</code>
                  </td>
                  <td>Plain-text usage notes for coding agents.</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </details>

        <details>
          <summary>Parameters</summary>
          <div className="section-body">
            <div className="table-panel">
              <table className="parameter-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Values</th>
                  <th>Default</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>size</code>
                  </td>
                  <td>
                    <code>512</code> or <code>1024</code>
                  </td>
                  <td>
                    <code>512</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>gap</code>
                  </td>
                  <td>Integer from 0 to 64 pixels.</td>
                  <td>
                    <code>0</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>seed</code>
                  </td>
                  <td>Any string. The same text and seed always select the same variants.</td>
                  <td>
                    <code>default</code>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </details>

        <details>
          <summary>Attribution</summary>
          <div className="section-body">
            <p>
              Source imagery: NASA/USGS Landsat. This API is unofficial and is
              not endorsed by NASA.
            </p>
            <ul className="source-list">
              <li>
                <a href="https://science.nasa.gov/mission/landsat/outreach/your-name-in-landsat/">
                  NASA Science: Your Name in Landsat
                </a>
              </li>
              <li>
                <a href="https://www.nasa.gov/nasa-brand-center/images-and-media/">
                  NASA Images and Media Guidelines
                </a>
              </li>
            </ul>
          </div>
        </details>
      </section>
    </main>
  );
}

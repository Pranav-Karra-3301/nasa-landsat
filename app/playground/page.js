import { TopbarBrand } from "../components/AgencyPartners";
import { PlaygroundClient } from "./PlaygroundClient";

const githubUrl = "https://github.com/Pranav-Karra-3301/nasa-landsat";

export const metadata = {
  title: "Playground — Landsat Alphabet API",
  description:
    "Build a Landsat name image URL with interactive controls and copy to clipboard.",
};

export default function PlaygroundPage() {
  return (
    <main className="page">
      <header className="topbar">
        <TopbarBrand />
        <nav className="nav" aria-label="Primary">
          <a href="/">Home</a>
          <a href={githubUrl}>GitHub</a>
          <a href="/openapi.json">OpenAPI</a>
        </nav>
      </header>

      <section className="playground-hero" aria-labelledby="playground-title">
        <p className="eyebrow">Interactive</p>
        <h1 id="playground-title">Image URL playground</h1>
        <PlaygroundClient />
      </section>
    </main>
  );
}

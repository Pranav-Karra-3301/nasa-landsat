"use client";

import { useLayoutEffect, useState } from "react";

const NAMES = ["LANDSAT", "PRANAV", "ORBIT", "EARTH", "PIXEL", "ATLAS"];

export function HeroImage() {
  const [name, setName] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    setName(NAMES[values[0] % NAMES.length]);
  }, []);

  if (!name) {
    return <div className="hero-preview hero-preview--pending" aria-hidden="true" />;
  }

  const src = `/v1/name/${name}.png?size=512&gap=8`;

  return (
    <figure className="hero-preview">
      <img
        alt={`${name} rendered in Landsat imagery`}
        className={loaded ? "hero-preview-img hero-preview-img--visible" : "hero-preview-img"}
        decoding="async"
        fetchPriority="high"
        src={src}
        onLoad={() => setLoaded(true)}
      />
      <figcaption className="preview-caption">
        <span className="preview-caption-label">Example URL</span>
        <code className="preview-caption-url">{src}</code>
      </figcaption>
    </figure>
  );
}

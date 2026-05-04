"use client";

import { useEffect, useState } from "react";

const NAMES = ["LANDSAT", "PRANAV", "ORBIT", "EARTH", "PIXEL", "ATLAS"];

export function HeroImage() {
  const [name, setName] = useState("LANDSAT");

  useEffect(() => {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    setName(NAMES[values[0] % NAMES.length]);
  }, []);

  const src = `/v1/name/${name}.png?size=512&gap=8`;

  return (
    <div className="hero-preview">
      <img src={src} alt={`${name} rendered in Landsat imagery`} />
      <div className="preview-caption">{src}</div>
    </div>
  );
}

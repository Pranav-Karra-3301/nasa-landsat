import Image from "next/image";

const nasa = { src: "/nasa.png", width: 3840, height: 2160 };
const usgs = { src: "/usgs.png", width: 1336, height: 534 };

const NASA_TOPBAR_H = 40;
const USGS_TOPBAR_H = 40;
const NASA_TOPBAR_W = Math.round((nasa.width * NASA_TOPBAR_H) / nasa.height);
const USGS_TOPBAR_W = Math.round((usgs.width * USGS_TOPBAR_H) / usgs.height);

export function TopbarBrand() {
  return (
    <a className="brand brand-logos" href="/">
      <span className="visually-hidden">Landsat Alphabet API — Home</span>
      <span className="brand-logos-visual" aria-hidden="true">
        <span className="brand-logo-sheet">
          <Image
            alt=""
            aria-hidden
            className="brand-logo-img"
            height={NASA_TOPBAR_H}
            src={nasa.src}
            width={NASA_TOPBAR_W}
          />
        </span>
        <span className="brand-logo-sheet">
          <Image
            alt=""
            aria-hidden
            className="brand-logo-img"
            height={USGS_TOPBAR_H}
            src={usgs.src}
            width={USGS_TOPBAR_W}
          />
        </span>
      </span>
    </a>
  );
}

export function AgencyPartners() {
  return (
    <div
      className="agency-credits"
      role="group"
      aria-label="NASA and USGS attribution"
    >
      <p className="agency-thanks">
        Thank you to{" "}
        <abbr title="National Aeronautics and Space Administration">NASA</abbr>{" "}
        and the{" "}
        <abbr title="United States Geological Survey">U.S. Geological Survey</abbr>{" "}
        for Landsat data and outreach materials this project relies on.
      </p>
      <div className="agency-logos">
        <a
          aria-label="NASA.gov (opens in new tab)"
          className="agency-logo-link"
          href="https://www.nasa.gov/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Image
            alt=""
            aria-hidden
            className="agency-logo-img"
            height={nasa.height}
            src={nasa.src}
            width={nasa.width}
          />
          <span className="agency-logo-label">NASA.gov</span>
        </a>
        <a
          aria-label="USGS Landsat (opens in new tab)"
          className="agency-logo-link"
          href="https://www.usgs.gov/landsat-missions"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Image
            alt=""
            aria-hidden
            className="agency-logo-img"
            height={usgs.height}
            src={usgs.src}
            width={usgs.width}
          />
          <span className="agency-logo-label">USGS Landsat</span>
        </a>
      </div>
    </div>
  );
}

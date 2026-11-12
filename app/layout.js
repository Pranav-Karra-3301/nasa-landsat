import { Ubuntu_Mono } from "next/font/google";
import "./globals.css";

const ubuntuMono = Ubuntu_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ubuntu-mono",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  title: "Landsat Alphabet API",
  description:
    "A public deterministic API that renders any text as a PNG stitched from NASA/USGS Landsat letter imagery. Spell your name in satellite images.",
  metadataBase: new URL("https://landsat.pranavkarra.me"),
  applicationName: "Landsat Alphabet API",
  keywords: [
    "Landsat",
    "NASA",
    "USGS",
    "satellite imagery",
    "your name in Landsat",
    "alphabet API",
    "image API",
    "deterministic API",
  ],
  authors: [{ name: "Pranav Karra", url: "https://pranavkarra.me" }],
  creator: "Pranav Karra",
  publisher: "Pranav Karra",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Landsat Alphabet API",
    url: "https://landsat.pranavkarra.me",
    title: "Landsat Alphabet API",
    description:
      "Write your name as a deterministic NASA/USGS Landsat image API.",
    images: [
      {
        url: "/og-image.png",
        width: 1131,
        height: 954,
        alt: "Landsat Alphabet API homepage preview.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Landsat Alphabet API",
    description:
      "Write your name as a deterministic NASA/USGS Landsat image API.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://landsat.pranavkarra.me/#webapp",
      name: "Landsat Alphabet API",
      url: "https://landsat.pranavkarra.me",
      description:
        "A public deterministic API that renders any text as a PNG stitched from NASA/USGS Landsat letter imagery.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      creator: { "@id": "https://pranavkarra.me/#person" },
    },
    {
      "@type": "Person",
      "@id": "https://pranavkarra.me/#person",
      name: "Pranav Karra",
      url: "https://pranavkarra.me",
      sameAs: [
        "https://github.com/Pranav-Karra-3301",
        "https://www.linkedin.com/in/pranavkarra001",
        "https://x.com/pranavkarra",
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html className={ubuntuMono.variable} lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}

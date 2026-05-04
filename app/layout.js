import "./globals.css";

export const metadata = {
  title: "Landsat Alphabet API",
  description:
    "A public deterministic API that renders names with NASA/USGS Landsat alphabet imagery.",
  metadataBase: new URL("https://landsat.pranavkarra.me"),
  openGraph: {
    title: "Landsat Alphabet API",
    description: "Write your name as a deterministic NASA/USGS Landsat image API.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Landsat Alphabet API over false-color satellite imagery.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Landsat Alphabet API",
    description: "Write your name as a deterministic NASA/USGS Landsat image API.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

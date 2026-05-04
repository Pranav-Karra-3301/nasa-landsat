import "./globals.css";

export const metadata = {
  title: "Landsat Name API",
  description:
    "A public deterministic API that renders text as stitched NASA/USGS Landsat letter imagery.",
  metadataBase: new URL("https://landsat.pranavkarra.me"),
  openGraph: {
    title: "Landsat Name API",
    description: "One URL in, one cached Landsat-imagery PNG out.",
    images: ["/v1/name/LANDSAT.png?size=512&gap=8"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

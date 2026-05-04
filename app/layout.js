import { Ubuntu_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
    "A public deterministic API that renders names with NASA/USGS Landsat alphabet imagery.",
  metadataBase: new URL("https://landsat.pranavkarra.me"),
  openGraph: {
    title: "Landsat Alphabet API",
    description: "Write your name as a deterministic NASA/USGS Landsat image API.",
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
    description: "Write your name as a deterministic NASA/USGS Landsat image API.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html className={ubuntuMono.variable} lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

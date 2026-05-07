import "./globals.css";

export const metadata = {
  title: "10TOES HQ — The Type Beats Community",
  description: "The private community for type beat producers. Track beats, discover winning niches, and connect with producers who are built different.",
  openGraph: {
    title: "10TOES HQ",
    description: "The private community for type beat producers.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

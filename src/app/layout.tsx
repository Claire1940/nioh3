import "./globals.css";

// Root layout for locale-based routing
// The actual HTML structure is defined in [locale]/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

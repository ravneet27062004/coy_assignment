import "./globals.css";
export const metadata = { title: "Coy Discover", description: "Find out if your crush likes you back. If they don't, nobody ever knows." };
export const viewport = { width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover", themeColor: "#FFFFFF", colorScheme: "light" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Baloo+2:wght@800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}

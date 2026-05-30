import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "SyllabroAI",
  description: "AI-powered learning platform",
  openGraph: {
    title: "SyllabroAI",
    description: "AI-powered learning platform",
    images: ["/syllabro-logo.png"],
  },
  icons: {
    icon: "/syllabro-icon.png",
    shortcut: "/syllabro-icon.png",
    apple: "/syllabro-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full antialiased">
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}

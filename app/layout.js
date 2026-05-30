import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "SyllabroAI",
  description: "AI-powered course, quiz, flashcard, and exam generation platform",
  openGraph: {
    title: "SyllabroAI",
    description: "AI-powered course, quiz, flashcard, and exam generation platform",
    images: ["/syllabro-logo.png"],
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico",
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

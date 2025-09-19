import type { Metadata } from "next";
// Remove the font imports if you don't need them
// import { Geist, Geist_Mono } from "next/font/google";

export const metadata: Metadata = {
  title: "My Notes App", // Change this to a more relevant title
  description: "A simple note-taking application.", // Update the description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Remove the font classes from the body tag */}
      <body>
        {children}
      </body>
    </html>
  );
}
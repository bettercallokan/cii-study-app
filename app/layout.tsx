import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CII W01 Çalışma Platformu",
  description:
    "Chartered Insurance Institute W01 sınavına hazırlık için kişiselleştirilmiş öğrenme platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import Loading from "../ui/loading";

const inter = Inter({ subsets: ["latin"] });

const Menu = dynamic(() => import("../ui/navigation"), {
  loading: () => <Loading />,
  ssr: false,
});
const ThemeProvider = dynamic(() => import("../ui/theme"), {
  loading: () => <Loading />,

  ssr: false,
});

export const metadata: Metadata = {
  title: "DAR to OAR converter",
  description: "Convert from DAR to OAR.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>{children}
        <Menu />
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import Header from "@/components/layout/Header";
import Providers from "./providers";
import { Roboto, Josefin_Sans, Lilita_One } from "next/font/google";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-josefin-sans",
});

const lilitaOne = Lilita_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lilita-one",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});
export const metadata = {
  title: "Geronimo's pizza",
  description: "The most delicious pizza in the world",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${josefinSans.variable} ${lilitaOne.variable} ${roboto.variable} scroll-smooth`} >
      <body>
        <Providers>
          <main className="container max-w-6xl mx-auto p-4">
            <Header />
            <div className="min-h-[70vh]">{children}</div>
            <footer className="border-t p-8 text-center text-gray-500 mt-16 font-josefin">
              &copy; {new Date().getFullYear()} All rights reserved
            </footer>
          </main>
        </Providers>
      </body>
    </html>
  );
}

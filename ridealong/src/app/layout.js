import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    template: "%s / RideAlong",
    default: "welcome / RideAlong",
  },
  description:
    "A smart, safe ride-sharing app that lets anyone become a driver or rider anytime. Share rides, reduce fuel costs, and travel together locally with verified users.",
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>

          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

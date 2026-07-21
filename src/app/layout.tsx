import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Mosaic — Every screen. One shared workspace.",description:"An AI-directed collaborative meeting canvas powered by Zoom Video SDK."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}


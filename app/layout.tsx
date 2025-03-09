import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/context/wallet-context"
import { MeetProvider } from "@/context/meet-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ConnectPSI - Private Networking",
  description: "Connect with people who share your interests using Private Set Intersection technology",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <WalletProvider>
            <MeetProvider>{children}</MeetProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


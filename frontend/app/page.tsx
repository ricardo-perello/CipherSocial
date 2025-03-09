"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Users, Lock, Plus, LogIn } from "lucide-react"
import WalletConnect from "@/components/wallet-connect"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/context/wallet-context"
import { WalletRequiredDialog } from "@/components/wallet-required-dialog"
import { JoinMeetDialog } from "@/components/join-meet-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"

export default function Home() {
  const router = useRouter()
  const { connected, connectWallet } = useWallet()
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Only show the component after it has mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCreateMeet = () => {
    if (!connected) {
      setShowWalletDialog(true)
    } else {
      router.push("/create-meet")
    }
  }

  const handleJoinMeet = () => {
    if (!connected) {
      setShowWalletDialog(true)
    } else {
      setShowJoinDialog(true)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/" className="flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span className="inline-block font-bold">ConnectPSI</span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-6 mx-4">
            <Link
              href="#features"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              How It Works
            </Link>
            <Link
              href="#about"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <WalletConnect />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center">
        <section className="w-full space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32 flex items-center justify-center">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center px-4">
            <Badge className="px-3 py-1 text-sm" variant="secondary">
              Private Networking
            </Badge>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl max-w-[800px]">
              Connect with people who share your interests
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Using Private Set Intersection technology to find common interests without revealing your personal data.
            </p>
            <div className="flex flex-col w-full gap-4 sm:flex-row sm:w-auto">
              <Button
                className="h-12 px-8 flex items-center gap-2 w-full sm:w-auto"
                size="lg"
                onClick={handleCreateMeet}
              >
                <Plus className="h-4 w-4" />
                Create Meet
              </Button>
              <Button
                variant="outline"
                className="h-12 px-8 flex items-center gap-2 w-full sm:w-auto"
                size="lg"
                onClick={handleJoinMeet}
              >
                <LogIn className="h-4 w-4" />
                Join Meet
              </Button>
            </div>
          </div>
        </section>
        <section id="features" className="w-full container space-y-6 py-8 md:py-12 lg:py-24 px-4">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Features</h2>
            <p className="max-w-full leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Our platform uses cutting-edge technology to create meaningful connections while protecting your privacy.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4">Private Set Intersection</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Find common interests without revealing your entire profile using PSI cryptography.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Wallet className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4">Web3 Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Connect your wallet from any EVM-compatible chain for secure authentication.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4">Meaningful Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Meet people who truly share your interests and passions in a secure environment.</p>
              </CardContent>
            </Card>
          </div>
        </section>
        <section id="how-it-works" className="w-full container py-8 md:py-12 lg:py-24 px-4">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">How It Works</h2>
            <p className="max-w-full leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Our platform uses Private Set Intersection to find common interests without compromising privacy.
            </p>
          </div>
          <div className="mx-auto grid items-start gap-8 py-8 md:grid-cols-2 md:gap-12 lg:max-w-5xl">
            <div className="flex flex-col gap-2 order-2 md:order-1">
              <h3 className="text-xl font-bold">1. Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Securely authenticate with your preferred EVM-compatible wallet. We never store your private keys.
              </p>
            </div>
            <Image
              src="/placeholder.svg?height=200&width=400"
              width={400}
              height={200}
              alt="Wallet connection illustration"
              className="rounded-lg object-cover order-1 md:order-2"
            />
            <Image
              src="/placeholder.svg?height=200&width=400"
              width={400}
              height={200}
              alt="Interest selection illustration"
              className="rounded-lg object-cover order-3 md:order-3"
            />
            <div className="flex flex-col gap-2 order-4 md:order-4">
              <h3 className="text-xl font-bold">2. Select Your Interests</h3>
              <p className="text-muted-foreground">
                Choose from a wide range of interests or add your own. These are encrypted locally on your device.
              </p>
            </div>
            <div className="flex flex-col gap-2 order-6 md:order-5">
              <h3 className="text-xl font-bold">3. Create or Join a Meet</h3>
              <p className="text-muted-foreground">
                Start your own networking event or join an existing one with a simple code.
              </p>
            </div>
            <Image
              src="/placeholder.svg?height=200&width=400"
              width={400}
              height={200}
              alt="Meeting creation illustration"
              className="rounded-lg object-cover order-5 md:order-6"
            />
            <Image
              src="/placeholder.svg?height=200&width=400"
              width={400}
              height={200}
              alt="PSI matching illustration"
              className="rounded-lg object-cover order-7 md:order-7"
            />
            <div className="flex flex-col gap-2 order-8 md:order-8">
              <h3 className="text-xl font-bold">4. Discover Matches</h3>
              <p className="text-muted-foreground">
                Our PSI technology finds common interests without revealing your entire list to anyone.
              </p>
            </div>
          </div>
        </section>
        <section className="w-full container py-8 md:py-12 lg:py-24 px-4">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Ready to Connect?</h2>
            <p className="max-w-full leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Start networking with people who share your interests while keeping your data private.
            </p>
            <div className="flex flex-col w-full gap-4 sm:flex-row sm:w-auto">
              <Button
                className="h-12 px-8 flex items-center gap-2 w-full sm:w-auto"
                size="lg"
                onClick={handleCreateMeet}
              >
                <Plus className="h-4 w-4" />
                Create Meet
              </Button>
              <Button
                variant="outline"
                className="h-12 px-8 flex items-center gap-2 w-full sm:w-auto"
                size="lg"
                onClick={handleJoinMeet}
              >
                <LogIn className="h-4 w-4" />
                Join Meet
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} ConnectPSI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>

      {mounted && (
        <>
          <WalletRequiredDialog
            open={showWalletDialog}
            onOpenChange={setShowWalletDialog}
            onConnectWallet={async () => {
              const success = await connectWallet()
              if (success) {
                setShowWalletDialog(false)
              }
              return success
            }}
          />

          <JoinMeetDialog open={showJoinDialog} onOpenChange={setShowJoinDialog} />
        </>
      )}
    </div>
  )
}


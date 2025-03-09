"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useWallet } from "@/context/wallet-context"

export default function WalletConnect() {
  const { connected, address, chainId, connectWallet, disconnectWallet } = useWallet()
  const [mounted, setMounted] = useState(false)

  // Only show the component after it has mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // Don't render anything until after client-side hydration
  if (!mounted) {
    return (
      <Button variant="outline" className="opacity-0">
        Loading...
      </Button>
    )
  }

  // Update the button to be more responsive
  return (
    <>
      {!connected ? (
        <Button onClick={connectWallet} className="flex items-center gap-2 text-xs sm:text-sm">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 text-xs sm:text-sm">
              <Wallet className="h-4 w-4" />
              <span>{formatAddress(address)}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-xs text-muted-foreground break-all">{address}</DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-muted-foreground">Chain ID: {chainId}</DropdownMenuItem>
            <DropdownMenuItem onClick={disconnectWallet}>Disconnect</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
}


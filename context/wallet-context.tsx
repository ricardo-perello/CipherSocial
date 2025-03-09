"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface WalletContextType {
  connected: boolean
  address: string
  chainId: string
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState("")
  const [chainId, setChainId] = useState("")

  const connectWallet = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        const chainId = await window.ethereum.request({ method: "eth_chainId" })

        setAddress(accounts[0])
        setChainId(chainId)
        setConnected(true)
        return true
      } else {
        alert("Please install a wallet like MetaMask to use this feature")
        return false
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      return false
    }
  }

  const disconnectWallet = () => {
    setConnected(false)
    setAddress("")
    setChainId("")
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        chainId,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}


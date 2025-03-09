"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Wallet } from "lucide-react"

interface WalletRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnectWallet: () => Promise<boolean>
}

export function WalletRequiredDialog({ open, onOpenChange, onConnectWallet }: WalletRequiredDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet Required</DialogTitle>
          <DialogDescription>You need to connect your wallet before you can create or join a meet.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <Wallet className="h-16 w-16 text-primary opacity-80" />
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              const success = await onConnectWallet()
              if (success) {
                onOpenChange(false)
              }
            }}
            className="w-full"
          >
            Connect Wallet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMeet } from "@/context/meet-context"

interface JoinMeetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinMeetDialog({ open, onOpenChange }: JoinMeetDialogProps) {
  const router = useRouter()
  const { setMeetCode } = useMeet()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  const handleJoin = () => {
    if (!code.trim()) {
      setError("Please enter a meet code")
      return
    }

    // In a real app, you would validate the code against a database
    // For now, we'll accept any code
    setMeetCode(code.toUpperCase())
    onOpenChange(false)
    router.push("/join-meet")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-center text-xl">Join a Meet</DialogTitle>
          <DialogDescription className="text-center">
            Enter the meet code provided by the meet creator.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="meetCode">Meet Code</Label>
            <Input
              id="meetCode"
              placeholder="Enter code (e.g., ABC123)"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setError("")
              }}
              className="text-center text-lg tracking-wider"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleJoin} className="w-full" size="lg">
            Join Meet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


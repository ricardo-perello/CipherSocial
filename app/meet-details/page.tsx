"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/context/wallet-context"
import { useMeet } from "@/context/meet-context"
import { WalletRequiredDialog } from "@/components/wallet-required-dialog"
import { ArrowLeft, Users, Sparkles, Search, UserCheck, Loader2 } from "lucide-react"
import Link from "next/link"

export default function MeetDetails() {
  const router = useRouter()
  const { connected, connectWallet } = useWallet()
  const { meetCode, description, questions } = useMeet()
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [commonInterests, setCommonInterests] = useState<string[]>([])
  const [userId, setUserId] = useState("")
  const [searchedUser, setSearchedUser] = useState<string | null>(null)
  const [userCommonInterests, setUserCommonInterests] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!connected) {
      setShowWalletDialog(true)
    }

    // In a real app, you would use PSI to find common interests
    // For demo purposes, we'll just simulate some common interests
    const answeredQuestions = questions.filter((q) => q.selected && q.answer)
    const simulatedCommonInterests = answeredQuestions
      .filter(() => Math.random() > 0.5) // Randomly select some as "common"
      .map((q) => `${q.text}: ${q.answer}`)

    setCommonInterests(simulatedCommonInterests)
  }, [connected, questions])

  const handleConnectWallet = async () => {
    const success = await connectWallet()
    if (success) {
      setShowWalletDialog(false)
    }
    return success
  }

  const handleSearchUser = () => {
    if (!userId.trim()) {
      alert("Please enter a user ID")
      return
    }

    setIsSearching(true)

    // Simulate API call to search for user
    setTimeout(() => {
      // In a real app, you would use PSI to find common interests with this specific user
      const simulatedUserCommonInterests = commonInterests.filter(() => Math.random() > 0.3)

      setSearchedUser(userId)
      setUserCommonInterests(simulatedUserCommonInterests)
      setIsSearching(false)
    }, 1500)
  }

  if (!connected) {
    return (
      <WalletRequiredDialog
        open={showWalletDialog}
        onOpenChange={setShowWalletDialog}
        onConnectWallet={handleConnectWallet}
      />
    )
  }

  return (
    <div className="container max-w-4xl py-8 px-4 mx-auto flex flex-col items-center">
      <div className="mb-8 w-full">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Meet: {meetCode}</h1>

      <div className="grid gap-8 md:grid-cols-2 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Meet Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{description || "No description provided for this meet."}</p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Common Interests
            </CardTitle>
            <CardDescription>
              Using PSI technology, we found these common interests without revealing your private data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {commonInterests.length > 0 ? (
              <ul className="space-y-2">
                {commonInterests.map((interest, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm sm:text-base">{interest}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No common interests found yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Find Common Interests with a Specific User
          </CardTitle>
          <CardDescription>Enter another user's ID to discover what interests you share with them.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="userId">User ID</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="userId"
                  placeholder="Enter user ID (e.g., 0x1234...)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  onClick={handleSearchUser}
                  disabled={isSearching}
                  className="flex items-center justify-center gap-2 mt-2 sm:mt-0"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {searchedUser && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Common Interests with {searchedUser}</h3>
                {userCommonInterests.length > 0 ? (
                  <ul className="space-y-2">
                    {userCommonInterests.map((interest, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm sm:text-base">{interest}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No common interests found with this user.</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-center w-full">
        <Button onClick={() => router.push("/")} size="lg" className="w-full sm:w-auto">
          Return to Home
        </Button>
      </div>
    </div>
  )
}


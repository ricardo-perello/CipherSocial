"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useWallet } from "@/context/wallet-context"
import { useMeet } from "@/context/meet-context"
import { WalletRequiredDialog } from "@/components/wallet-required-dialog"
import { ArrowLeft, Copy, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { createMeetup } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function CreateMeet() {
  const router = useRouter()
  const { toast } = useToast()
  const { connected, connectWallet, address } = useWallet()
  const { meetCode, description, questions, setDescription, toggleQuestionSelection, getSelectedQuestions } = useMeet()
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!connected) {
      setShowWalletDialog(true)
    }
  }, [connected])

  const handleConnectWallet = async () => {
    const success = await connectWallet()
    if (success) {
      setShowWalletDialog(false)
    }
    return success
  }

  const copyMeetCode = () => {
    navigator.clipboard.writeText(meetCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCreateMeet = async () => {
    const selectedQuestions = getSelectedQuestions()
    if (selectedQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one question",
        variant: "destructive",
      })
      return
    }

    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please add a description for your meet",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // Prepare data for the API call
      const meetupData = {
        meetCode,
        description,
        questions: selectedQuestions,
        creator: address,
        timestamp: new Date().toISOString(),
      }

      // Call the API to create the meetup
      await createMeetup(meetupData)

      toast({
        title: "Success",
        description: `Meet created successfully! Your meet code is: ${meetCode}`,
      })

      router.push("/")
    } catch (error) {
      console.error("Error creating meet:", error)
      toast({
        title: "Error",
        description: "Failed to create meet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
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

      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Create a New Meet</h1>

      <div className="flex flex-col items-start justify-between mb-6 sm:mb-8 p-4 bg-muted rounded-lg w-full">
        <div className="mb-2 sm:mb-0">
          <p className="text-sm font-medium">Your Meet Code</p>
          <p className="text-xl sm:text-2xl font-bold break-all">
            {meetCode === "LOADING" ? "Generating..." : meetCode}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 mt-2 sm:mt-0"
          onClick={copyMeetCode}
          disabled={meetCode === "LOADING"}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Code
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Meet Description</CardTitle>
            <CardDescription>Provide details about your meet to help others understand its purpose.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this meet is about..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Select Questions</CardTitle>
            <CardDescription>
              Choose questions that participants will answer. These will be used to find common interests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`question-${question.id}`}
                    checked={question.selected}
                    onCheckedChange={() => toggleQuestionSelection(question.id)}
                  />
                  <Label htmlFor={`question-${question.id}`} className="text-sm leading-tight cursor-pointer">
                    {question.text}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end w-full">
        <Button
          onClick={handleCreateMeet}
          size="lg"
          disabled={meetCode === "LOADING" || isCreating}
          className="w-full md:w-auto"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Meet"
          )}
        </Button>
      </div>
    </div>
  )
}


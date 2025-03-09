"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/context/wallet-context"
import { useMeet } from "@/context/meet-context"
import { WalletRequiredDialog } from "@/components/wallet-required-dialog"
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { postRoot } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function JoinMeet() {
  const router = useRouter()
  const { toast } = useToast()
  const { connected, connectWallet, address } = useWallet()
  const { meetCode, name, questions, setQuestionAnswer } = useMeet()
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!connected) {
      setShowWalletDialog(true)
    }

    // In a real app, you would fetch the questions for this meet code
    // For demo purposes, we'll just use the questions from context
  }, [connected, meetCode])

  const handleConnectWallet = async () => {
    const success = await connectWallet()
    if (success) {
      setShowWalletDialog(false)
    }
    return success
  }

  const handleAnswer = (questionId: number, answer: string) => {
    setQuestionAnswer(questionId, answer)
    setError("")
  }

  const handleNext = async () => {
    if (!questions[currentStep]?.answer) {
      setError("Please select an option before continuing")
      return
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
      setError("")
    } else {
      // All questions answered, submit the data and proceed to meet details
      await handleSubmitAnswers()
    }
  }

  const handleSubmitAnswers = async () => {
    setIsSubmitting(true)

    try {
      // Prepare data for the API call
      const answeredQuestions = questions.map((q) => ({
        id: q.id,
        answer: q.answerId,
      }))

      const rootData = {
        meetCode,
        participant: address,
        answers: answeredQuestions,
        timestamp: new Date().toISOString(),
      }

      // Call the API to post the root data
      await postRoot(rootData)

      toast({
        title: "Success",
        description: "Your answers have been submitted successfully!",
      })

      router.push("/meet-details")
    } catch (error) {
      console.error("Error submitting answers:", error)

      toast({
        title: "Error",
        description: "Failed to submit answers. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setError("")
    }
  }

  const currentQuestion = questions[currentStep]
  const isLastQuestion = currentStep === questions.length - 1

  if (!connected) {
    return (
      <WalletRequiredDialog
        open={showWalletDialog}
        onOpenChange={setShowWalletDialog}
        onConnectWallet={handleConnectWallet}
      />
    )
  }

  if (questions.length === 0) {
    return (
      <div className="container max-w-4xl py-8 px-4 mx-auto flex flex-col items-center">
        <div className="mb-8 w-full">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>No Questions Found</CardTitle>
            <CardDescription>
              There are no questions associated with this meet code. Please check the code and try again.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
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

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Join Meet: {meetCode}</h1>
      {name && <h2 className="text-xl font-medium mb-2">{name}</h2>}
      <p className="text-muted-foreground mb-6 sm:mb-8 text-center">
        Answer the following questions to find common interests with other participants. Your answers will be processed
        using Private Set Intersection to protect your privacy.
      </p>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
        <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
          Question {currentStep + 1} of {questions.length}
        </p>
        <div className="flex gap-2">
          {Array.from({ length: questions.length }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-6 sm:w-8 rounded-full ${
                index === currentStep ? "bg-primary" : index < currentStep ? "bg-primary/40" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4 w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{currentQuestion?.text}</CardTitle>
          <CardDescription>Select one option based on your personal preference.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentQuestion?.answer || ""}
            onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion?.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-base cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!currentQuestion?.answer || isSubmitting}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLastQuestion ? "Submitting..." : "Next..."}
              </>
            ) : isLastQuestion ? (
              "Finish"
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}


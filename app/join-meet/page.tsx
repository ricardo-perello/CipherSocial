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
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { postRoot } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function JoinMeet() {
  const router = useRouter()
  const { toast } = useToast()
  const { connected, connectWallet, address } = useWallet()
  const { meetCode, questions, setQuestionAnswer } = useMeet()
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const selectedQuestions = questions.filter((q) => q.selected)

  useEffect(() => {
    if (!connected) {
      setShowWalletDialog(true)
    }

    // In a real app, you would fetch the selected questions for this meet code
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
  }

  const handleNext = async () => {
    if (currentStep < selectedQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // All questions answered, submit the data and proceed to meet details
      await handleSubmitAnswers()
    }
  }

  const handleSubmitAnswers = async () => {
    setIsSubmitting(true)

    try {
      // Prepare data for the API call
      const answeredQuestions = selectedQuestions.map((q) => ({
        id: q.id,
        text: q.text,
        answer: q.answer,
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

      // Proceed to meet details
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
    }
  }

  const currentQuestion = selectedQuestions[currentStep]
  const isLastQuestion = currentStep === selectedQuestions.length - 1

  if (!connected) {
    return (
      <WalletRequiredDialog
        open={showWalletDialog}
        onOpenChange={setShowWalletDialog}
        onConnectWallet={handleConnectWallet}
      />
    )
  }

  if (selectedQuestions.length === 0) {
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
      <p className="text-muted-foreground mb-6 sm:mb-8 text-center">
        Answer the following questions to find common interests with other participants.
      </p>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
        <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
          Question {currentStep + 1} of {selectedQuestions.length}
        </p>
        <div className="flex gap-2">
          {Array.from({ length: selectedQuestions.length }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-6 sm:w-8 rounded-full ${
                index === currentStep ? "bg-primary" : index < currentStep ? "bg-primary/40" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{currentQuestion.text}</CardTitle>
          <CardDescription>Select one option based on your personal preference.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentQuestion.answer || ""}
            onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
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
            disabled={!currentQuestion.answer || isSubmitting}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
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


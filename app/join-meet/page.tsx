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
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function JoinMeet() {
  const router = useRouter()
  const { connected, connectWallet } = useWallet()
  const { meetCode, questions, setQuestionAnswer } = useMeet()
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
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

  const handleNext = () => {
    if (currentStep < selectedQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // All questions answered, proceed to meet details
      router.push("/meet-details")
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
      <div className="container max-w-4xl py-8 mx-auto flex flex-col items-center">
        <div className="mb-8">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card>
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
      <div className="mb-8">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Join Meet: {meetCode}</h1>
      <p className="text-muted-foreground mb-6 sm:mb-8">
        Answer the following questions to find common interests with other participants.
      </p>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
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

      <Card>
        <CardHeader>
          <CardTitle>{currentQuestion.text}</CardTitle>
          <CardDescription>Select True or False based on your personal experience.</CardDescription>
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
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
            Previous
          </Button>
          <Button onClick={handleNext} disabled={!currentQuestion.answer}>
            {isLastQuestion ? "Finish" : "Next"}
            {!isLastQuestion && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}


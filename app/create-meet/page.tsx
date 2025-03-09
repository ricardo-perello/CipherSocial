"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/context/wallet-context"
import { useMeet, type Question } from "@/context/meet-context"
import { WalletRequiredDialog } from "@/components/wallet-required-dialog"
import { ArrowLeft, Copy, Check, Loader2, Trash2, Edit, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createMeetup } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateMeet() {
  const router = useRouter()
  const { toast } = useToast()
  const { connected, connectWallet, address } = useWallet()
  const { meetCode, name, questions, setName, addQuestion, updateQuestion, removeQuestion } = useMeet()
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [errors, setErrors] = useState({
    name: "",
    questionText: "",
    optionText: "",
    general: "",
  })
  const [newQuestion, setNewQuestion] = useState<{
    text: string
    options: string[]
    currentOption: string
  }>({
    text: "",
    options: [],
    currentOption: "",
  })
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null)

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

  const validateOption = () => {
    if (!newQuestion.currentOption.trim()) {
      setErrors((prev) => ({ ...prev, optionText: "Option cannot be empty" }))
      return false
    }

    if (newQuestion.options.includes(newQuestion.currentOption.trim())) {
      setErrors((prev) => ({ ...prev, optionText: "This option already exists" }))
      return false
    }

    setErrors((prev) => ({ ...prev, optionText: "" }))
    return true
  }

  const handleAddOption = () => {
    if (!validateOption()) return

    if (newQuestion.options.length >= 5) {
      setErrors((prev) => ({ ...prev, optionText: "Maximum 5 options allowed per question" }))
      return
    }

    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, newQuestion.currentOption.trim()],
      currentOption: "",
    })
    setErrors((prev) => ({ ...prev, optionText: "" }))
  }

  const handleRemoveOption = (index: number) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.filter((_, i) => i !== index),
    })
  }

  const validateQuestion = () => {
    if (!newQuestion.text.trim()) {
      setErrors((prev) => ({ ...prev, questionText: "Question text cannot be empty" }))
      return false
    }

    if (newQuestion.options.length !== 5) {
      setErrors((prev) => ({ ...prev, questionText: "Each question must have exactly 5 options" }))
      return false
    }

    setErrors((prev) => ({ ...prev, questionText: "" }))
    return true
  }

  const handleAddQuestion = () => {
    if (!validateQuestion()) return

    if (questions.length >= 4 && editingQuestionId === null) {
      setErrors((prev) => ({ ...prev, general: "Maximum 4 questions allowed" }))
      return
    }

    if (editingQuestionId !== null) {
      // Update existing question
      updateQuestion(editingQuestionId, {
        text: newQuestion.text.trim(),
        options: newQuestion.options,
      })
      setEditingQuestionId(null)
    } else {
      // Add new question
      addQuestion({
        id: Date.now(),
        text: newQuestion.text.trim(),
        options: newQuestion.options,
      })
    }

    // Reset form
    setNewQuestion({
      text: "",
      options: [],
      currentOption: "",
    })
    setErrors((prev) => ({ ...prev, questionText: "", general: "" }))
  }

  const handleEditQuestion = (question: Question) => {
    setNewQuestion({
      text: question.text,
      options: [...question.options],
      currentOption: "",
    })
    setEditingQuestionId(question.id)
    setErrors((prev) => ({ ...prev, questionText: "", optionText: "", general: "" }))
  }

  const validateMeet = () => {
    let isValid = true
    const newErrors = { ...errors }

    if (!name.trim()) {
      newErrors.name = "Please enter a name for your meet"
      isValid = false
    } else {
      newErrors.name = ""
    }

    if (questions.length !== 4) {
      newErrors.general = `You need exactly 4 questions (currently have ${questions.length})`
      isValid = false
    } else {
      newErrors.general = ""
    }

    setErrors(newErrors)
    return isValid
  }

  const handleCreateMeet = async () => {
    if (!validateMeet()) return

    setIsCreating(true)

    try {
      // Prepare data for the API call
      const meetupData = {
        meetCode,
        name,
        questions,
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

      {errors.general && (
        <Alert variant="destructive" className="mb-6 w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Meet Name</CardTitle>
            <CardDescription>Give your meet a name to help others identify it.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter a name for your meet..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (e.target.value.trim()) {
                      setErrors((prev) => ({ ...prev, name: "" }))
                    }
                  }}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create Questions</CardTitle>
            <CardDescription>
              Create exactly 4 questions with 5 options each. These will be used to find common interests among
              participants. Each participant will select one option per question, and the system will use Private Set
              Intersection to find matches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Question creation form - only show if less than 4 questions or editing */}
              {(questions.length < 4 || editingQuestionId !== null) && (
                <div className="space-y-4 border p-4 rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor="question-text">
                      {editingQuestionId !== null ? "Edit Question" : `Question (${questions.length}/4)`}
                    </Label>
                    <Input
                      id="question-text"
                      placeholder="Enter your question..."
                      value={newQuestion.text}
                      onChange={(e) => {
                        setNewQuestion({ ...newQuestion, text: e.target.value })
                        if (e.target.value.trim()) {
                          setErrors((prev) => ({ ...prev, questionText: "" }))
                        }
                      }}
                      className={errors.questionText ? "border-red-500" : ""}
                    />
                    {errors.questionText && <p className="text-sm text-red-500">{errors.questionText}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Options ({newQuestion.options.length}/5)</Label>
                    <div className="flex flex-col gap-2">
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-grow p-2 bg-muted rounded text-sm">{option}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOption(index)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {/* Only show option input if less than 5 options */}
                      {newQuestion.options.length < 5 && (
                        <div className="flex gap-2">
                          <Input
                            placeholder={`Add option ${newQuestion.options.length + 1}/5...`}
                            value={newQuestion.currentOption}
                            onChange={(e) => {
                              setNewQuestion({ ...newQuestion, currentOption: e.target.value })
                              if (e.target.value.trim()) {
                                setErrors((prev) => ({ ...prev, optionText: "" }))
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddOption()
                              }
                            }}
                            className={errors.optionText ? "border-red-500" : ""}
                          />
                          <Button
                            onClick={handleAddOption}
                            disabled={newQuestion.options.length >= 5 || !newQuestion.currentOption.trim()}
                          >
                            Add
                          </Button>
                        </div>
                      )}

                      {errors.optionText && <p className="text-sm text-red-500">{errors.optionText}</p>}
                    </div>
                  </div>

                  <Button
                    onClick={handleAddQuestion}
                    className="w-full"
                    disabled={!newQuestion.text.trim() || newQuestion.options.length !== 5}
                  >
                    {editingQuestionId !== null ? "Update Question" : "Add Question"}
                  </Button>
                </div>
              )}

              {/* Message when 4 questions are created */}
              {questions.length >= 4 && editingQuestionId === null && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    You've created all 4 required questions. You can edit them below if needed.
                  </AlertDescription>
                </Alert>
              )}

              {/* List of created questions */}
              <div className="space-y-4">
                <h3 className="font-medium">Created Questions ({questions.length}/4)</h3>
                {questions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No questions created yet. You need to create 4 questions.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {questions.map((question) => (
                      <div key={question.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{question.text}</h4>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditQuestion(question)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeQuestion(question.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {question.options.map((option, index) => (
                            <div key={index} className="text-sm text-muted-foreground pl-2">
                              • {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex w-full">
        <Button
          onClick={handleCreateMeet}
          size="lg"
          disabled={meetCode === "LOADING" || isCreating || !name.trim() || questions.length !== 4}
          className="w-full md:w-auto ml-auto"
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


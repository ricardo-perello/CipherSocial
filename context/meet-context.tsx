"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Update the Question interface to support multiple choice
export interface Question {
  id: number
  text: string
  options: string[]
  selected?: boolean
  answer?: string // Changed from boolean to string to store the selected option
}

interface MeetContextType {
  meetCode: string
  description: string
  questions: Question[]
  setMeetCode: (code: string) => void
  setDescription: (description: string) => void
  toggleQuestionSelection: (id: number) => void
  setQuestionAnswer: (id: number, answer: string) => void
  getSelectedQuestions: () => Question[]
  resetMeet: () => void
}

// Replace the defaultQuestions array with the new multiple-choice questions
const defaultQuestions: Question[] = [
  {
    id: 1,
    text: "What is your favourite book?",
    options: ["Percy Jackson", "Harry Potter", "Angels and Demons", "Snow Crash", "Algorithms, third edition"],
  },
  {
    id: 2,
    text: "Where do you study?",
    options: ["Paris", "EPFL", "Oxford", "UCL", "Imperial"],
  },
  {
    id: 3,
    text: "What is your primary language?",
    options: ["German", "French", "Chinese", "Spanish", "English"],
  },
  {
    id: 4,
    text: "What subject are you most interested in?",
    options: ["zkVM", "zkTLS", "AI", "Sharding", "Quantum Computers"],
  },
]

// Generate a random 6-character code
const generateMeetCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const MeetContext = createContext<MeetContextType | undefined>(undefined)

export function MeetProvider({ children }: { children: ReactNode }) {
  // Start with a placeholder, then update after mount
  const [meetCode, setMeetCode] = useState("LOADING")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions)
  const [isInitialized, setIsInitialized] = useState(false)

  // Generate the meet code after component mounts to avoid hydration mismatch
  useEffect(() => {
    if (!isInitialized) {
      setMeetCode(generateMeetCode())
      setIsInitialized(true)
    }
  }, [isInitialized])

  const toggleQuestionSelection = (id: number) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, selected: !q.selected } : q)))
  }

  // Update the setQuestionAnswer function to handle string answers
  const setQuestionAnswer = (id: number, answer: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, answer } : q)))
  }

  const getSelectedQuestions = () => {
    return questions.filter((q) => q.selected)
  }

  const resetMeet = () => {
    setMeetCode(generateMeetCode())
    setDescription("")
    setQuestions(defaultQuestions)
  }

  return (
    <MeetContext.Provider
      value={{
        meetCode,
        description,
        questions,
        setMeetCode,
        setDescription,
        toggleQuestionSelection,
        setQuestionAnswer,
        getSelectedQuestions,
        resetMeet,
      }}
    >
      {children}
    </MeetContext.Provider>
  )
}

export function useMeet() {
  const context = useContext(MeetContext)
  if (context === undefined) {
    throw new Error("useMeet must be used within a MeetProvider")
  }
  return context
}


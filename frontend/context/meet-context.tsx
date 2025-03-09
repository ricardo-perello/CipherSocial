"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Update the Question interface to support custom questions
export interface Question {
  id: number
  text: string
  options: string[]
  selected?: boolean
  answer?: string // Changed from boolean to string to store the selected option
  answerId : number
}

interface MeetContextType {
  meetCode: string
  name: string
  questions: Question[]
  setMeetCode: (code: string) => void
  setName: (name: string) => void
  addQuestion: (question: Question) => void
  updateQuestion: (id: number, question: Partial<Question>) => void
  removeQuestion: (id: number) => void
  setQuestionAnswer: (id: number, answer: string) => void
  resetMeet: () => void
}

// Replace the defaultQuestions array with empty array since questions will be created by users
const defaultQuestions: Question[] = [{
  id: 0,
  text: "What is Your Favorite Fruit?",
  options: ["Apple 🍎", "Orange 🍊", "Banana 🍌", "Watermelon 🍉", "Mango 🥭"],
   // Changed from boolean to string to store the selected option
  answerId : 4
},
{
  id: 1,
  text: "What is Your Favorite Sport?",
  options: ["Football ⚽", "Football 🏈", "Basketball 🏀", "Skiing ⛷️", "Rugby 🏉"],
   // Changed from boolean to string to store the selected option
  answerId : 4
},
{
  id: 2,
  text: "What Country are you from?",
  options: ["England 🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Spain 🇪🇸", "United States 🇺🇸", "France 🇫🇷", "Switzerland 🇨🇭"],
   // Changed from boolean to string to store the selected option
  answerId : 4
},
{
  id: 3,
  text: "What is your favorite Blockchain?",
  options: ["Mina", "ETH", "Hyle", "Hedera", "Bitcoin ₿"],
   // Changed from boolean to string to store the selected option
  answerId : 4
}
]

// Generate a random 6-character code
const generateMeetCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const MeetContext = createContext<MeetContextType | undefined>(undefined)

export function MeetProvider({ children }: { children: ReactNode }) {
  // Start with a placeholder, then update after mount
  const [meetCode, setMeetCode] = useState("LOADING")
  const [name, setName] = useState("")
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions)
  const [isInitialized, setIsInitialized] = useState(false)

  // Generate the meet code after component mounts to avoid hydration mismatch
  useEffect(() => {
    if (!isInitialized) {
      setMeetCode(generateMeetCode())
      setIsInitialized(true)
    }
  }, [isInitialized])

  const addQuestion = (question: Question) => {
    setQuestions([...questions, question])
  }

  const updateQuestion = (id: number, updatedFields: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updatedFields } : q)))
  }

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  // Update the setQuestionAnswer function to handle string answers
  const setQuestionAnswer = (id: number, answer: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, answer } : q)))
  }

  const resetMeet = () => {
    setMeetCode(generateMeetCode())
    setName("")
    setQuestions(defaultQuestions)
  }

  return (
    <MeetContext.Provider
      value={{
        meetCode,
        name,
        questions,
        setMeetCode,
        setName,
        addQuestion,
        updateQuestion,
        removeQuestion,
        setQuestionAnswer,
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


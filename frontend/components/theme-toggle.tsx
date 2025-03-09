"use client"

import { useEffect } from "react"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  // Always use system theme
  useEffect(() => {
    setTheme("system")
  }, [setTheme])

  // Return null (don't render anything)
  return null
}


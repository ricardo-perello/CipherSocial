"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          <Link
            href="#features"
            className="flex items-center py-2 text-base font-medium border-b border-border"
            onClick={() => setOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="flex items-center py-2 text-base font-medium border-b border-border"
            onClick={() => setOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="#about"
            className="flex items-center py-2 text-base font-medium border-b border-border"
            onClick={() => setOpen(false)}
          >
            About
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}


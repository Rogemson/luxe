"use client"

import { useState } from "react"
import { Menu, X, ShoppingCart, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="font-serif text-2xl font-semibold text-foreground tracking-tight">LUXE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-12">
            <Link
              href="/collection"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              Collections
            </Link>
            <Link href="/products" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Shop
            </Link>
            <a href="#" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              About
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Contact
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <button className="p-2 text-foreground hover:text-accent transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="relative p-2 text-foreground hover:text-accent transition-colors">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
            </button>
            <Button variant="outline" className="hidden sm:inline-flex text-sm font-medium bg-transparent">
              Account
            </Button>
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-6 flex flex-col gap-4 border-t border-border pt-4">
            <Link
              href="/collections"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              Collections
            </Link>
            <Link href="/products" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Shop
            </Link>
            <a href="#" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              About
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Contact
            </a>
          </nav>
        )}
      </div>
    </header>
  )
}

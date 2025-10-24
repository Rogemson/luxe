"use client"

import { useState } from "react"
import { Menu, X, ShoppingCart, Search, User } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/context/cart"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { cartCount } = useCart()
  
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

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <button className="p-2 text-foreground hover:text-accent transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/cart"
              className="relative p-2 text-foreground hover:text-accent transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/account"
              className="p-2 text-foreground hover:text-accent transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Mobile Menu Toggle */}
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

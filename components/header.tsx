'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Search, User } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSearch } from '@/context/search'
import { SearchModal } from '@/components/search-modal'
import { CartDrawer } from '@/components/cart-drawer'
import { MegaMenu } from '@/components/mega-menu'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [clientState, setClientState] = useState({
    mounted: false,
    email: '',
    token: '',
  })
  const { products, isSearchOpen, openSearch, closeSearch } = useSearch()

  useEffect(() => {
    const email = localStorage.getItem('customerEmail') || ''
    const authToken = localStorage.getItem('shopifyCustomerToken') || ''
    Promise.resolve().then(() => {
      setClientState({
        mounted: true,
        email,
        token: authToken,
      })
    })
  }, [])

  const getInitials = (email: string): string => {
    if (!email) return 'U'
    return email
      .split('@')[0]
      .split('.')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isLoggedIn =
    clientState.mounted &&
    clientState.token.length > 0 &&
    clientState.email.length > 0

  if (!clientState.mounted) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="h-8 w-24 bg-secondary animate-pulse rounded" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={closeSearch}
        products={products}
      />

      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link href="/" className="font-serif text-2xl font-bold">
              Zoster
            </Link>

            {/* Desktop Navigation with Mega Menu */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </Link>
              
              {/* ✅ Mega Menu */}
              <MegaMenu />
              
              <Link href="/collections" className="text-sm font-medium hover:text-primary transition-colors">
                Collections
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={openSearch}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart Drawer */}
              <CartDrawer />

              {/* User */}
              {isLoggedIn ? (
                <Link href="/account">
                  <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                    <AvatarFallback className="text-xs">
                      {getInitials(clientState.email)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Link href="/login">
                  <button className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                </Link>
              )}

              {/* Mobile Menu */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 hover:bg-secondary rounded-full transition-colors"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden border-t border-border">
              <nav className="flex flex-col p-4 space-y-4">
                <Link 
                  href="/" 
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/products" 
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Products
                </Link>
                <Link 
                  href="/collections" 
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Collections
                </Link>
                <Link 
                  href="/about" 
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  )
}

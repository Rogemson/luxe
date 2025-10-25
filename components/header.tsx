'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ShoppingCart, Search, User } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useCart } from '@/context/cart'
import { useSearch } from '@/context/search'
import { SearchModal } from '@/components/search-modal'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [clientState, setClientState] = useState({
    mounted: false,
    email: '',
    token: '',
  })
  const { cartCount } = useCart()
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
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <span className="font-serif text-2xl font-semibold text-foreground tracking-tight">
                LUXE
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-12">
              <Link
                href="/collections"
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                Collections
              </Link>
              <Link
                href="/products"
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                Shop
              </Link>
              <a
                href="#"
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                Contact
              </a>
            </nav>
            <div className="flex items-center gap-6">
              <button className="p-2 text-foreground hover:text-accent transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <Link
                href="/cart"
                className="relative p-2 text-foreground hover:text-accent transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
              </Link>
              <Link
                href="/account"
                className="p-2 text-foreground hover:text-accent transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>
              <button className="md:hidden p-2 text-foreground">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <span className="font-serif text-2xl font-semibold text-foreground tracking-tight">
                LUXE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-12">
              <Link
                href="/collections"
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                Collections
              </Link>
              <Link
                href="/products"
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                Shop
              </Link>
              <a
                href="#"
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={openSearch}
                className="p-2 text-foreground hover:text-accent transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link
                href="/cart"
                className="relative p-2 text-foreground hover:text-accent transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold bg-primary text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {isLoggedIn ? (
                <Link
                  href="/account"
                  className="p-2 text-foreground hover:text-accent transition-colors"
                >
                  <Avatar className="w-8 h-8 cursor-pointer">
                    <AvatarFallback className="text-xs font-semibold bg-accent text-accent-foreground">
                      {getInitials(clientState.email)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Link
                  href="/account"
                  className="p-2 text-foreground hover:text-accent transition-colors"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-foreground"
              >
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
              <Link
                href="/products"
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                Shop
              </Link>
              <a
                href="#"
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                Contact
              </a>
            </nav>
          )}
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal products={products} isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  )
}
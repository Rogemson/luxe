import { Instagram, Facebook, Twitter } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-background">LUXE</h3>
            <p className="text-background/70 text-sm leading-relaxed">
              Curated premium clothing for the modern lifestyle. Quality, style, and sustainability.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="font-medium text-background text-sm uppercase tracking-wide">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/collections" className="text-background/70 hover:text-background transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-background/70 hover:text-background transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Sale
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-medium text-background text-sm uppercase tracking-wide">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Care Instructions
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-medium text-background text-sm uppercase tracking-wide">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-background/70">© 2025 LUXE. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-background/70 hover:text-background transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-background/70 hover:text-background transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-background/70 hover:text-background transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

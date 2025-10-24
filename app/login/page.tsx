import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LoginForm } from "@/components/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <Link href="/" className="inline-block mb-6">
              <span className="font-serif text-3xl font-semibold text-foreground tracking-tight">LUXE</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue shopping</p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}

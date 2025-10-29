"use client"

import { User, ShoppingBag, Heart, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AccountSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  email: string
  onLogout: () => void
}

export function AccountSidebar({ activeTab, onTabChange, email, onLogout }: AccountSidebarProps) {
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside className="space-y-4">
      {/* User Info */}
      <div className="bg-card rounded-lg border p-4 text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-primary rounded-full flex items-center justify-center text-white">
          {email.charAt(0).toUpperCase()}
        </div>
        <p className="font-medium truncate">{email}</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Logout Button */}
      <Button onClick={onLogout} variant="outline" className="w-full justify-start bg-transparent">
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </aside>
  )
}

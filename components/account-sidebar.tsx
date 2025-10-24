"use client"

import { User, Package, Heart, Settings, LogOut } from "lucide-react"

interface AccountSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AccountSidebar({ activeTab, onTabChange }: AccountSidebarProps) {
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside className="w-full md:w-64">
      <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-4">
        <h3 className="font-serif text-lg font-semibold mb-6 text-foreground">My Account</h3>
        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </nav>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-red-50 mt-6 transition-colors duration-200 text-left">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

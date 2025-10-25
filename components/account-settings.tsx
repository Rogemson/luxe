"use client"

import { Bell, MessageSquare, Lock, Shield, Smartphone, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AccountSettingsProps {
  email: string
  onLogout: () => void
}

export function AccountSettings({ email, onLogout }: AccountSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-2">Account Settings</h2>
        <p className="text-muted-foreground">Manage your preferences and security</p>
      </div>

      <div className="space-y-4">
        {/* Notifications */}
        <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Bell className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-serif font-semibold text-foreground text-lg">Email Notifications</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Receive updates about orders, promotions, and new arrivals
                </p>
              </div>
            </div>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-primary" />
            </label>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <MessageSquare className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-serif font-semibold text-foreground text-lg">SMS Notifications</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Get text alerts for order status and special offers
                </p>
              </div>
            </div>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded accent-primary" />
            </label>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Lock className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-serif font-semibold text-foreground text-lg">Privacy Settings</h3>
                <p className="text-sm text-muted-foreground mt-2">Control how your data is used and shared</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
              Manage
            </Button>
          </div>
        </div>

        {/* Password */}
        <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Shield className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-serif font-semibold text-foreground text-lg">Password & Security</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Change your password and manage two-factor authentication
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
              Change
            </Button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Smartphone className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-serif font-semibold text-foreground text-lg">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground mt-2">Add an extra layer of security to your account</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
              Enable
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-serif font-semibold text-red-900 text-lg mb-2">Danger Zone</h3>
            <p className="text-sm text-red-800 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

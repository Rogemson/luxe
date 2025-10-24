"use client"

import { Mail, Phone, MapPin, Star, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AccountProfile() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-2">Profile Information</h2>
          <p className="text-muted-foreground">Manage and update your personal details</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent whitespace-nowrap">
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-8 mb-8 pb-8 border-b border-border">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-white text-3xl font-serif">
              JD
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  First Name
                </label>
                <p className="text-foreground mt-2 text-lg font-medium">John</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Name</label>
                <p className="text-foreground mt-2 text-lg font-medium">Doe</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Email Address
              </label>
              <p className="text-foreground mt-2 text-lg">john@example.com</p>
              <p className="text-xs text-muted-foreground mt-1">Primary email for account notifications</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Phone Number
              </label>
              <p className="text-foreground mt-2 text-lg">+1 (555) 123-4567</p>
              <p className="text-xs text-muted-foreground mt-1">Used for order updates and support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl font-semibold text-foreground">Default Shipping Address</h3>
            <p className="text-sm text-muted-foreground mt-1">Used for all future orders</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        </div>
        <div className="flex items-start gap-4">
          <MapPin className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-foreground font-semibold text-lg">123 Fashion Street</p>
            <p className="text-muted-foreground mt-1">Apt 4B</p>
            <p className="text-muted-foreground">New York, NY 10001</p>
            <p className="text-muted-foreground">United States</p>
            <p className="text-muted-foreground mt-2 text-sm">ZIP: 10001</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-lg p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Star className="w-8 h-8 text-accent flex-shrink-0" />
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">Member Status</h3>
            <p className="text-muted-foreground mt-2">You are a valued member since October 2023</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
              <span className="text-sm font-medium text-foreground">65% to next tier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

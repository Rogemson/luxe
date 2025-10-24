'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Edit2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CustomerData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
}

export function AccountProfile({ email }: { email: string }) {
  const [profile, setProfile] = useState<CustomerData>({
    firstName: '',
    lastName: '',
    email: email,
    phone: '',
    address: ''
  })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('shopifyCustomerToken')
        
        if (!token) {
          setLoading(false)
          return
        }

        console.log('👤 [PROFILE] Fetching customer data...')

        const response = await fetch('/api/auth/customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (response.ok && data.customer) {
          const customer = data.customer
          setProfile({
            firstName: customer.firstName || '',
            lastName: customer.lastName || '',
            email: customer.email || email,
            phone: customer.phone || '',
            address: customer.defaultAddress
              ? `${customer.defaultAddress.address1}, ${customer.defaultAddress.city}`
              : ''
          })
          console.log('✅ [PROFILE] Loaded:', customer.email)
        } else {
          console.error('❌ [PROFILE] Error:', data.error)
        }
      } catch (error) {
        console.error('❌ [PROFILE] Exception:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [email])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    // Save to localStorage for now
    localStorage.setItem('customerProfile', JSON.stringify(profile))
    console.log('✅ Profile saved')
    setEditing(false)
    setSaving(false)
  }

  if (loading) {
    return <div className="p-6">Loading profile...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profile Information</h2>
          <p className="text-muted-foreground">Manage your account details</p>
        </div>
        {!editing && (
          <Button
            onClick={() => setEditing(true)}
            variant="outline"
            size="sm"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">First Name</label>
            <input
              type="text"
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              disabled={!editing}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              disabled={!editing}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full mt-1 px-3 py-2 border rounded-lg bg-muted cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-sm font-medium flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            disabled={!editing}
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-sm font-medium flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Address
          </label>
          <input
            type="text"
            name="address"
            value={profile.address}
            onChange={handleChange}
            disabled={!editing}
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted cursor-not-allowed"
          />
        </div>

        {editing && (
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={() => setEditing(false)}
              variant="outline"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

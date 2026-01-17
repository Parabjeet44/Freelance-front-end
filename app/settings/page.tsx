'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from '../../utils/axiosInstance'
import Swal from 'sweetalert2'

interface User {
  id: number
  name: string
  email: string
  role: 'BUYER' | 'SELLER'
  mobile?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    mobile: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACK_END}/api/auth/me`,
        { withCredentials: true }
      )
      
      const userData = res.data.user
      setUser(userData)
      
      // Initialize form
      setProfileForm({
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      console.error('Failed to fetch user:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load profile',
        confirmButtonColor: '#ef4444'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!profileForm.name || !profileForm.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Name and email are required',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    // Validate mobile if provided
    if (profileForm.mobile && !/^\d{10}$/.test(profileForm.mobile)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Mobile',
        text: 'Mobile number must be 10 digits',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    // Password validation if changing password
    if (profileForm.newPassword) {
      if (!profileForm.currentPassword) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Current Password',
          text: 'Please enter your current password',
          confirmButtonColor: '#f59e0b'
        })
        return
      }

      if (profileForm.newPassword.length < 6) {
        Swal.fire({
          icon: 'warning',
          title: 'Weak Password',
          text: 'New password must be at least 6 characters',
          confirmButtonColor: '#f59e0b'
        })
        return
      }

      if (profileForm.newPassword !== profileForm.confirmPassword) {
        Swal.fire({
          icon: 'warning',
          title: 'Password Mismatch',
          text: 'New passwords do not match',
          confirmButtonColor: '#f59e0b'
        })
        return
      }
    }

    setSaving(true)

    try {
      const updateData: any = {
        name: profileForm.name,
        email: profileForm.email,
        mobile: profileForm.mobile || null,
      }

      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword
        updateData.newPassword = profileForm.newPassword
      }

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACK_END}/api/auth/profile`,
        updateData,
        { withCredentials: true }
      )

      setUser(res.data.user)
      
      // Clear password fields
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Profile updated successfully',
        confirmButtonColor: '#10b981'
      })
    } catch (err: any) {
      console.error('Update error:', err)
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err?.response?.data?.message || 'Failed to update profile',
        confirmButtonColor: '#ef4444'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Required',
        text: 'Please enter your password to confirm deletion',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    const confirmResult = await Swal.fire({
      title: 'Are you absolutely sure?',
      text: 'This action cannot be undone. All your data will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete my account',
      cancelButtonText: 'Cancel'
    })

    if (!confirmResult.isConfirmed) return

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACK_END}/api/auth/account`,
        {
          data: { password: deletePassword },
          withCredentials: true
        }
      )

      await Swal.fire({
        icon: 'success',
        title: 'Account Deleted',
        text: 'Your account has been permanently deleted',
        confirmButtonColor: '#10b981'
      })

      // Redirect to home/login
      router.push('/login')
    } catch (err: any) {
      console.error('Delete error:', err)
      Swal.fire({
        icon: 'error',
        title: 'Deletion Failed',
        text: err?.response?.data?.message || 'Failed to delete account',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400">
        <div className="text-white text-xl">User not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-white/70">Manage your profile and account preferences</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Profile Information Card */}
          <div className="backdrop-blur-lg bg-white/10 p-8 rounded-2xl border border-white/20 text-white">
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              {/* Role Badge */}
              <div className="mb-4">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  user.role === 'BUYER' 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {user.role}
                </span>
              </div>

              {/* Name */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  value={profileForm.mobile}
                  onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  maxLength={10}
                  className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="border-t border-white/20 pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <p className="text-white/60 text-sm mb-4">
                  Leave blank if you don't want to change your password
                </p>

                {/* Current Password */}
                <div className="mb-4">
                  <label className="block text-white font-semibold mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                      placeholder="Min 6 characters"
                    />
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-green-500 hover:bg-green-600 transition rounded-lg p-4 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Danger Zone Card */}
          <div className="backdrop-blur-lg bg-red-500/10 p-8 rounded-2xl border border-red-500/30 text-white">
            <h2 className="text-2xl font-bold mb-2 text-red-300">Danger Zone</h2>
            <p className="text-white/70 mb-6">
              Once you delete your account, there is no going back. Please be certain.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500 hover:bg-red-600 transition rounded-lg px-6 py-3 font-bold shadow-lg"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-red-600 to-pink-600 p-8 rounded-2xl max-w-md w-full border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">Delete Account</h3>
            <p className="text-white/90 mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>

            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                placeholder="Your password"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition"
              >
                Delete Forever
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletePassword('')
                }}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
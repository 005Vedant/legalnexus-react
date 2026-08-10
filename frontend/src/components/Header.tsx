import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function Header() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('photo_url').eq('id', user.id).single()
        .then(({ data }) => { if (data?.photo_url) setPhotoUrl(data.photo_url) })
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const handlePhotoUpload = async (file: File) => {
    try {
      setUploading(true)
      const ext = file.name.split('.').pop()
      const path = `profiles/${user?.id}.${ext}`
      let bucket = 'profile-photos'
      let { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
      if (error) {
        bucket = 'lawyer-photos'
        const res = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
        if (res.error) throw res.error
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      await supabase.from('profiles').upsert({ id: user?.id, photo_url: data.publicUrl, role })
      setPhotoUrl(data.publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const roleLabel = role === 'admin' ? '🛡️ Admin' : role === 'lawyer' ? '⚖️ Lawyer' : '👤 Client'
  const roleBg = role === 'admin' ? 'bg-gray-900 text-white' : role === 'lawyer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/lawyers', label: 'Lawyers' },
    { to: '/cases', label: 'Cases' },
    { to: '/faq', label: 'FAQ' },
  ]

  return (
    <header className="bg-legalnexus-nav text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center">⚖️</div>
          <span>LegalNexus</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 text-sm text-white/90 hover:text-white rounded-md hover:bg-white/5 transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Avatar + Mobile burger */}
        <div className="flex items-center gap-3">

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-md hover:bg-white/10 transition"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation"
          >
            <span
              className="block w-5 h-0.5 bg-white transition-all duration-200"
              style={{ transform: mobileMenuOpen ? 'translateY(8px) rotate(45deg)' : 'none' }}
            />
            <span
              className="block w-5 h-0.5 bg-white transition-all duration-200"
              style={{ opacity: mobileMenuOpen ? 0 : 1 }}
            />
            <span
              className="block w-5 h-0.5 bg-white transition-all duration-200"
              style={{ transform: mobileMenuOpen ? 'translateY(-8px) rotate(-45deg)' : 'none' }}
            />
          </button>

          {/* Profile Avatar + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-blue-200" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-white hidden sm:block">
                {userName}
              </span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-white/5 z-50 overflow-hidden">

                {/* Profile Header */}
                <div className="p-4 bg-legalnexus-nav text-white">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Profile"
                          className="w-14 h-14 rounded-full object-cover border-2 border-white" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-blue-400 flex items-center justify-center text-white text-2xl font-bold border-2 border-white">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center cursor-pointer shadow">
                        <span className="text-xs">📷</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) handlePhotoUpload(file)
                          }}
                        />
                      </label>
                    </div>
                    <div>
                      <p className="font-bold text-white">{userName}</p>
                        <p className="text-white/80 text-xs">{user?.email}</p>
                      <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleBg}`}>
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                  {uploading && (
                    <p className="text-xs text-blue-100 mt-2">Uploading photo...</p>
                  )}
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-sm font-medium transition">
                    <span className="text-lg">👤</span>
                    <div>
                      <p className="font-medium">My Profile</p>
                      <p className="text-xs text-gray-400">View and edit your profile</p>
                    </div>
                  </Link>

                  <Link to="/cases" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-sm font-medium transition">
                    <span className="text-lg">📋</span>
                    <div>
                      <p className="font-medium">My Cases</p>
                      <p className="text-xs text-gray-400">View your case status</p>
                    </div>
                  </Link>

                  <Link to="/" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-sm font-medium transition">
                    <span className="text-lg">🏠</span>
                    <div>
                      <p className="font-medium">Dashboard</p>
                      <p className="text-xs text-gray-400">Go to your dashboard</p>
                    </div>
                  </Link>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 text-sm font-medium transition">
                      <span className="text-lg">🚪</span>
                      <p className="font-medium">Sign Out</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-legalnexus-nav px-4 py-3 flex flex-col gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 text-sm text-white/90 hover:text-white rounded-lg hover:bg-white/10 transition font-medium"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/10 mt-2 pt-2">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 text-sm text-white/90 hover:text-white rounded-lg hover:bg-white/10 transition font-medium flex items-center gap-2"
            >
              👤 My Profile
            </Link>
            <button
              onClick={() => { setMobileMenuOpen(false); handleSignOut() }}
              className="w-full text-left px-3 py-2.5 text-sm text-red-300 hover:text-red-200 rounded-lg hover:bg-white/10 transition font-medium flex items-center gap-2 mt-1"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Menu, X, User, LogOut, Ticket, Home, Search, Plus, Sparkles } from 'lucide-react'

export default function Header() {
  const { t, language, setLanguage } = useLanguage()
  const { user, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/tickets', label: t('nav.browse'), icon: Search },
    { href: '/sell', label: t('nav.sell'), icon: Plus },
  ]

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-header shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c4f135] to-[#9bc22a] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <Ticket className="w-5 h-5 text-[#050507]" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-[#c4f135] blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-white tracking-tight">
                Tkt<span className="text-[#c4f135]">Resell</span>
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest hidden sm:block">
                Trusted Tickets
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white transition-all duration-300 group"
              >
                <link.icon className="w-4 h-4 group-hover:text-[#c4f135] transition-colors" />
                <span>{link.label}</span>
                <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors" />
              </Link>
            ))}
          </nav>

          {/* Right side: Language + Auth */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'ka' ? 'en' : 'ka')}
              className="px-3 py-2 text-xs font-bold text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 uppercase tracking-wider"
            >
              {language === 'ka' ? 'EN' : 'ქარ'}
            </button>

            {/* Auth Section */}
            {loading ? (
              <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
            ) : user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-all duration-300 group"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c4f135]/20 to-[#00f5d4]/20 flex items-center justify-center border border-white/10 group-hover:border-[#c4f135]/30 transition-colors">
                      <User className="w-4 h-4 text-[#c4f135]" />
                    </div>
                    {user.is_verified_seller && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c4f135] flex items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 text-[#050507]" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {user.full_name || t('nav.profile')}
                    </span>
                    {user.is_verified_seller && (
                      <span className="text-[10px] text-[#c4f135] uppercase tracking-wider">
                        Verified
                      </span>
                    )}
                  </div>
                </Link>
                <button
                  onClick={signOut}
                  className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex btn btn-primary"
              >
                {t('nav.login')}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/5 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <link.icon className="w-5 h-5 text-[#c4f135]" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}

              <div className="h-px bg-white/5 my-2" />

              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300"
                  >
                    <User className="w-5 h-5 text-[#c4f135]" />
                    <span className="font-medium">{t('nav.profile')}</span>
                    {user.is_verified_seller && (
                      <span className="badge badge-primary ml-auto">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{t('nav.logout')}</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 mx-4 mt-2 btn btn-primary"
                >
                  {t('nav.login')}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { isValidPhone } from '@/lib/utils'
import { Phone, Key, Loader2, ArrowLeft, Ticket, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { user, signInWithOtp, verifyOtp, loading: authLoading } = useAuth()
  const { t } = useLanguage()

  const [phone, setPhone] = useState('+995')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/profile')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanPhone = phone.replace(/\s/g, '')

    if (!isValidPhone(cleanPhone)) {
      setError('გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი (+995XXXXXXXXX)')
      return
    }

    setLoading(true)

    const { error } = await signInWithOtp(cleanPhone)

    if (error) {
      setError(error)
    } else {
      setStep('otp')
      setCountdown(60)
    }

    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (otp.length !== 6) {
      setError('გთხოვთ შეიყვანოთ 6-ციფრიანი კოდი')
      return
    }

    setLoading(true)

    const { error } = await verifyOtp(phone, otp)

    if (error) {
      setError(error)
    } else {
      router.push('/profile')
    }

    setLoading(false)
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return

    setLoading(true)
    setError(null)

    const { error } = await signInWithOtp(phone)

    if (error) {
      setError(error)
    } else {
      setCountdown(60)
    }

    setLoading(false)
  }

  const formatPhoneInput = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '')

    if (!cleaned.startsWith('+995')) {
      if (cleaned.startsWith('995')) {
        cleaned = '+' + cleaned
      } else if (cleaned.startsWith('+')) {
        cleaned = '+995' + cleaned.substring(1).replace(/\D/g, '')
      } else {
        cleaned = '+995' + cleaned.replace(/\D/g, '')
      }
    }

    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13)
    }

    if (cleaned.length > 4) {
      let formatted = cleaned.substring(0, 4)
      const rest = cleaned.substring(4)

      if (rest.length > 0) formatted += ' ' + rest.substring(0, 3)
      if (rest.length > 3) formatted += ' ' + rest.substring(3, 6)
      if (rest.length > 6) formatted += ' ' + rest.substring(6, 9)

      return formatted
    }

    return cleaned
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c4f135]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 hero-grid opacity-30" />

      {/* Glow orbs */}
      <div className="glow-orb glow-orb-lime w-[400px] h-[400px] -top-32 -left-32" />
      <div className="glow-orb glow-orb-cyan w-[300px] h-[300px] bottom-0 right-0" />

      <div className="w-full max-w-md relative">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          მთავარზე დაბრუნება
        </Link>

        <div className="card p-8 relative overflow-hidden">
          {/* Card glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#c4f135]/20 rounded-full blur-[80px]" />

          {step === 'phone' ? (
            <div className="relative">
              <div className="text-center mb-8">
                {/* Animated logo */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#c4f135] to-[#00f5d4] animate-pulse-glow" />
                  <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#c4f135] to-[#9bc22a] flex items-center justify-center">
                    <Ticket className="w-10 h-10 text-[#050507]" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">
                  {t('auth.login_title')}
                </h1>
                <p className="text-zinc-400">
                  {t('auth.login_subtitle')}
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="label flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#c4f135]" />
                    {t('auth.phone')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                    className="input text-center text-lg tracking-wider font-mono"
                    placeholder={t('auth.phone_placeholder')}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full justify-center py-3.5"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t('auth.send_otp')
                  )}
                </button>
              </form>

              <p className="text-xs text-zinc-600 text-center mt-8">
                გაგრძელებით თქვენ ეთანხმებით ჩვენს{' '}
                <a href="/terms" className="text-[#c4f135] hover:underline">
                  წესებსა და პირობებს
                </a>
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#00f5d4]/20 to-[#00f5d4]/5 border border-[#00f5d4]/20 flex items-center justify-center">
                  <Key className="w-10 h-10 text-[#00f5d4]" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">
                  კოდის დადასტურება
                </h1>
                <p className="text-zinc-400">
                  {t('auth.otp_sent')}
                </p>
                <p className="text-sm text-[#c4f135] font-medium mt-2">{phone}</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="label flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00f5d4]" />
                    {t('auth.otp')}
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input text-center text-3xl tracking-[0.5em] font-mono"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn btn-primary w-full justify-center py-3.5"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t('auth.verify')
                  )}
                </button>
              </form>

              <div className="mt-6 text-center space-y-3">
                <button
                  onClick={() => setStep('phone')}
                  className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  ← ნომრის შეცვლა
                </button>

                <div>
                  {countdown > 0 ? (
                    <p className="text-sm text-zinc-600">
                      ხელახლა გაგზავნა <span className="text-[#c4f135] font-mono">{countdown}</span> წამში
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-sm text-[#c4f135] hover:underline"
                    >
                      კოდის ხელახლა გაგზავნა
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

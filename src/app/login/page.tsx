'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { isValidPhone } from '@/lib/utils'
import { Phone, Key, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'

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

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/profile')
    }
  }, [user, authLoading, router])

  // Countdown timer for resend
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
    // Remove all non-digits except the leading +
    let cleaned = value.replace(/[^\d+]/g, '')

    // Ensure it starts with +995
    if (!cleaned.startsWith('+995')) {
      if (cleaned.startsWith('995')) {
        cleaned = '+' + cleaned
      } else if (cleaned.startsWith('+')) {
        cleaned = '+995' + cleaned.substring(1).replace(/\D/g, '')
      } else {
        cleaned = '+995' + cleaned.replace(/\D/g, '')
      }
    }

    // Limit to +995 + 9 digits
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13)
    }

    // Format: +995 XXX XXX XXX
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          მთავარზე დაბრუნება
        </Link>

        <div className="card p-6 md:p-8">
          {step === 'phone' ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-primary-600" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">
                  {t('auth.login_title')}
                </h1>
                <p className="text-zinc-500">
                  {t('auth.login_subtitle')}
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="label">{t('auth.phone')}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                    className="input text-center text-lg tracking-wider"
                    placeholder={t('auth.phone_placeholder')}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full justify-center py-3"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t('auth.send_otp')
                  )}
                </button>
              </form>

              <p className="text-xs text-zinc-500 text-center mt-6">
                გაგრძელებით თქვენ ეთანხმებით ჩვენს{' '}
                <a href="/terms" className="text-primary-600 hover:underline">
                  წესებსა და პირობებს
                </a>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-primary-600" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">
                  კოდის დადასტურება
                </h1>
                <p className="text-zinc-500">
                  {t('auth.otp_sent')}
                </p>
                <p className="text-sm text-zinc-700 font-medium mt-2">{phone}</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="label">{t('auth.otp')}</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input text-center text-2xl tracking-[0.5em] font-mono"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn btn-primary w-full justify-center py-3"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t('auth.verify')
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setStep('phone')}
                  className="text-sm text-zinc-600 hover:text-zinc-900"
                >
                  ← ნომრის შეცვლა
                </button>
              </div>

              <div className="mt-4 text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-zinc-500">
                    ხელახლა გაგზავნა {countdown} წამში
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    კოდის ხელახლა გაგზავნა
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

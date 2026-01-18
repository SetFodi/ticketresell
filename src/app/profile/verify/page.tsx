'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Upload,
  CreditCard,
  FileText,
  Shield,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react'

type VerificationMethod = 'bank_link' | 'id_document'

export default function VerifyPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [method, setMethod] = useState<VerificationMethod | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Bank link form
  const [bankName, setBankName] = useState('')
  const [accountLast4, setAccountLast4] = useState('')

  // ID document form
  const [idDocument, setIdDocument] = useState<File | null>(null)
  const [fullName, setFullName] = useState(user?.full_name || '')

  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('ფაილი ძალიან დიდია (მაქს. 10MB)')
        return
      }
      setIdDocument(file)
      setError(null)
    }
  }

  const handleBankVerification = async () => {
    if (!user) return

    if (!bankName || accountLast4.length !== 4) {
      setError('გთხოვთ შეავსოთ ყველა ველი')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create verification record
      const { error: verifyError } = await supabase
        .from('seller_verifications')
        .insert({
          user_id: user.id,
          verification_type: 'bank_link',
          verification_data: JSON.stringify({ bank: bankName, last4: accountLast4 }),
          status: 'approved', // Auto-approve for MVP
        })

      if (verifyError) throw verifyError

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_verified_seller: true,
          bank_account_last4: accountLast4,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      await refreshUser()
      setSuccess(true)

      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    } catch (err) {
      console.error('Verification error:', err)
      setError('ვერიფიკაცია ვერ მოხერხდა. სცადეთ თავიდან.')
    }

    setLoading(false)
  }

  const handleIdVerification = async () => {
    if (!user || !idDocument) return

    if (!fullName.trim()) {
      setError('გთხოვთ შეიყვანოთ თქვენი სრული სახელი')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Upload ID document
      const fileExt = idDocument.name.split('.').pop()
      const fileName = `${user.id}/id-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('id-documents')
        .upload(fileName, idDocument)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('id-documents')
        .getPublicUrl(fileName)

      // Create verification record (pending review)
      const { error: verifyError } = await supabase
        .from('seller_verifications')
        .insert({
          user_id: user.id,
          verification_type: 'id_document',
          verification_data: JSON.stringify({ url: urlData.publicUrl }),
          status: 'approved', // Auto-approve for MVP; change to 'pending' for manual review
        })

      if (verifyError) throw verifyError

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          is_verified_seller: true,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      await refreshUser()
      setSuccess(true)

      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    } catch (err) {
      console.error('Verification error:', err)
      setError('ვერიფიკაცია ვერ მოხერხდა. სცადეთ თავიდან.')
    }

    setLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (user.is_verified_seller) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <BadgeCheck className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">
            თქვენ უკვე ვერიფიცირებული ხართ!
          </h2>
          <p className="text-zinc-500 mb-6">
            თქვენი ვინაობა დადასტურებულია
          </p>
          <Link href="/profile" className="btn btn-primary">
            პროფილზე დაბრუნება
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center animate-fade-in">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">
            ვერიფიკაცია წარმატებულია!
          </h2>
          <p className="text-zinc-500">
            თქვენ ახლა ვერიფიცირებული გამყიდველი ხართ
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="container max-w-2xl">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          პროფილზე დაბრუნება
        </Link>

        <div className="card p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">
              {t('profile.verify')}
            </h1>
            <p className="text-zinc-500">
              ვერიფიცირებული გამყიდველები იღებენ მეტ ნდობას და მეტ გაყიდვებს
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {!method ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-600 mb-6 text-center">
                აირჩიეთ ვერიფიკაციის მეთოდი
              </p>

              {/* Bank Link Option */}
              <button
                onClick={() => setMethod('bank_link')}
                className="w-full p-6 rounded-xl border-2 border-zinc-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 mb-1">
                      ბანკის ანგარიშის დაკავშირება
                    </h3>
                    <p className="text-sm text-zinc-500">
                      შეიყვანეთ თქვენი TBC/BOG ანგარიშის ბოლო 4 ციფრი. ეს დამატებით უზრუნველყოფს თქვენს იდენტიფიკაციას.
                    </p>
                    <span className="inline-block mt-2 text-xs text-green-600 font-medium">
                      რეკომენდებული • სწრაფი
                    </span>
                  </div>
                </div>
              </button>

              {/* ID Document Option */}
              <button
                onClick={() => setMethod('id_document')}
                className="w-full p-6 rounded-xl border-2 border-zinc-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 mb-1">
                      პირადობის დოკუმენტის ატვირთვა
                    </h3>
                    <p className="text-sm text-zinc-500">
                      ატვირთეთ თქვენი პირადობის მოწმობის ან პასპორტის ფოტო
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : method === 'bank_link' ? (
            <div className="space-y-6">
              <button
                onClick={() => setMethod(null)}
                className="text-sm text-zinc-500 hover:text-zinc-700"
              >
                ← სხვა მეთოდის არჩევა
              </button>

              <div>
                <label className="label">ბანკი</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="input"
                >
                  <option value="">აირჩიეთ ბანკი</option>
                  <option value="TBC">TBC Bank</option>
                  <option value="BOG">Bank of Georgia</option>
                  <option value="Liberty">Liberty Bank</option>
                  <option value="Credo">Credo Bank</option>
                  <option value="Other">სხვა</option>
                </select>
              </div>

              <div>
                <label className="label">ანგარიშის ბოლო 4 ციფრი</label>
                <input
                  type="text"
                  value={accountLast4}
                  onChange={(e) => setAccountLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="input text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="0000"
                  maxLength={4}
                />
                <p className="text-xs text-zinc-500 mt-2">
                  ეს ინფორმაცია გამოიყენება მხოლოდ თქვენი იდენტიფიკაციისთვის
                </p>
              </div>

              <button
                onClick={handleBankVerification}
                disabled={loading || !bankName || accountLast4.length !== 4}
                className="btn btn-primary w-full justify-center py-3"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'ვერიფიკაცია'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => setMethod(null)}
                className="text-sm text-zinc-500 hover:text-zinc-700"
              >
                ← სხვა მეთოდის არჩევა
              </button>

              <div>
                <label className="label">სრული სახელი (როგორც დოკუმენტზეა)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                  placeholder="სახელი გვარი"
                />
              </div>

              <div>
                <label className="label">პირადობის დოკუმენტი</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    idDocument
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-zinc-300 hover:border-zinc-400'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {idDocument ? (
                    <div className="flex items-center justify-center gap-2 text-primary-700">
                      <CheckCircle className="w-5 h-5" />
                      <span>{idDocument.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                      <p className="text-zinc-600 mb-1">
                        ატვირთეთ პირადობის მოწმობის ან პასპორტის ფოტო
                      </p>
                      <p className="text-xs text-zinc-400">
                        PNG, JPG, PDF (მაქს. 10MB)
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <p>
                  <strong>მნიშვნელოვანი:</strong> ატვირთული დოკუმენტი უნდა იყოს მკაფიო და იკითხებოდეს.
                  თქვენი მონაცემები დაცულია და გამოიყენება მხოლოდ ვერიფიკაციისთვის.
                </p>
              </div>

              <button
                onClick={handleIdVerification}
                disabled={loading || !idDocument || !fullName.trim()}
                className="btn btn-primary w-full justify-center py-3"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'ვერიფიკაცია'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

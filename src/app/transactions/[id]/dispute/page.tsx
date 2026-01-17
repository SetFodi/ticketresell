'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { DisputeReason } from '@/types'
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Upload,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'

const disputeReasons: { value: DisputeReason; label: string; description: string }[] = [
  {
    value: 'ticket_invalid',
    label: 'ბილეთი არასწორი/ყალბი იყო',
    description: 'ბილეთი არ იმუშავა ღონისძიებაზე',
  },
  {
    value: 'wrong_ticket',
    label: 'არასწორი ბილეთი მივიღე',
    description: 'მივიღე სხვა ღონისძიების ან სხვა თარიღის ბილეთი',
  },
  {
    value: 'seller_no_show',
    label: 'გამყიდველმა ბილეთი არ გამომიგზავნა',
    description: 'გადახდის შემდეგ გამყიდველი არ პასუხობს',
  },
  {
    value: 'other',
    label: 'სხვა პრობლემა',
    description: 'სხვა სახის პრობლემა',
  },
]

export default function DisputePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [reason, setReason] = useState<DisputeReason | null>(null)
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((f) => f.size <= 5 * 1024 * 1024)

    if (validFiles.length !== files.length) {
      setError('ზოგიერთი ფაილი ძალიან დიდია (მაქს. 5MB)')
    }

    setEvidence((prev) => [...prev, ...validFiles].slice(0, 5))
  }

  const removeFile = (index: number) => {
    setEvidence((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user || !reason) {
      setError('გთხოვთ აირჩიოთ პრობლემის მიზეზი')
      return
    }

    if (!description.trim()) {
      setError('გთხოვთ აღწერეთ პრობლემა')
      return
    }

    setLoading(true)

    try {
      // Upload evidence files
      const evidenceUrls: string[] = []

      for (const file of evidence) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${params.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('dispute-evidence')
          .upload(fileName, file)

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('dispute-evidence')
            .getPublicUrl(fileName)
          evidenceUrls.push(urlData.publicUrl)
        }
      }

      // Create dispute
      const { error: disputeError } = await supabase.from('disputes').insert({
        transaction_id: params.id,
        reporter_id: user.id,
        reason,
        description: description.trim(),
        evidence_urls: evidenceUrls,
        status: 'open',
      })

      if (disputeError) {
        throw disputeError
      }

      setSuccess(true)

      // Redirect after delay
      setTimeout(() => {
        router.push(`/transactions/${params.id}`)
      }, 3000)
    } catch (err) {
      console.error('Error creating dispute:', err)
      setError('შეცდომა მოხდა. სცადეთ თავიდან.')
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center animate-fade-in">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">
            დავა გაიგზავნა
          </h2>
          <p className="text-zinc-500">
            ჩვენ განვიხილავთ თქვენს საჩივარს და დაგიკავშირდებით.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="container max-w-2xl">
        <Link
          href={`/transactions/${params.id}`}
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          უკან დაბრუნება
        </Link>

        <div className="card p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">
              {t('dispute.title')}
            </h1>
            <p className="text-zinc-500">
              აღწერეთ პრობლემა და ატვირთეთ მტკიცებულებები
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">გთხოვთ გაითვალისწინოთ</p>
                <p>
                  დავის გახსნის შემდეგ ჩვენი გუნდი განიხილავს საქმეს და მიიღებს გადაწყვეტილებას
                  წარმოდგენილი მტკიცებულებების საფუძველზე.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason Selection */}
            <div>
              <label className="label">{t('dispute.reason')}</label>
              <div className="space-y-3">
                {disputeReasons.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      reason === r.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-zinc-900">{r.label}</div>
                      <div className="text-sm text-zinc-500">{r.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label">{t('dispute.description')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-[120px] resize-none"
                placeholder="დეტალურად აღწერეთ რა მოხდა..."
                required
              />
            </div>

            {/* Evidence Upload */}
            <div>
              <label className="label">{t('dispute.evidence')}</label>

              {evidence.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {evidence.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-lg text-sm"
                    >
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-zinc-500 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {evidence.length < 5 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center cursor-pointer hover:border-zinc-400 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-zinc-600">ატვირთეთ სკრინშოტები</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    მაქსიმუმ 5 ფაილი (თითო 5MB-მდე)
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !reason}
              className="btn btn-danger w-full justify-center py-3"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('dispute.submit')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { CreateTicketInput } from '@/types'
import {
  Ticket,
  Calendar,
  MapPin,
  DollarSign,
  Hash,
  FileText,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

export default function SellPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<CreateTicketInput>({
    event_name: '',
    event_date: '',
    venue: '',
    original_price: 0,
    asking_price: 0,
    ticket_type: 'General',
    quantity: 1,
    description: '',
  })

  const [ticketProof, setTicketProof] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('ფაილი ძალიან დიდია (მაქს. 5MB)')
        return
      }
      setTicketProof(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      router.push('/login')
      return
    }

    if (!formData.event_name || !formData.event_date || !formData.venue) {
      setError('გთხოვთ შეავსოთ ყველა სავალდებულო ველი')
      return
    }

    if (formData.asking_price <= 0) {
      setError('გთხოვთ მიუთითოთ ფასი')
      return
    }

    setLoading(true)

    try {
      let proofUrl = null

      // Upload ticket proof if provided
      if (ticketProof) {
        const fileExt = ticketProof.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('ticket-proofs')
          .upload(fileName, ticketProof)

        if (uploadError) {
          throw new Error('ფაილის ატვირთვა ვერ მოხერხდა')
        }

        const { data: urlData } = supabase.storage
          .from('ticket-proofs')
          .getPublicUrl(fileName)

        proofUrl = urlData.publicUrl
      }

      // Create ticket listing
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          seller_id: user.id,
          event_name: formData.event_name,
          event_date: formData.event_date,
          venue: formData.venue,
          original_price: formData.original_price,
          asking_price: formData.asking_price,
          ticket_type: formData.ticket_type,
          quantity: formData.quantity,
          description: formData.description || null,
          ticket_proof_url: proofUrl,
          status: 'available',
        })
        .select()
        .single()

      if (ticketError) {
        throw new Error('განცხადების შექმნა ვერ მოხერხდა')
      }

      setSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/tickets/${ticket.id}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'შეცდომა მოხდა. სცადეთ თავიდან.')
    } finally {
      setLoading(false)
    }
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="glow-orb glow-orb-lime w-[300px] h-[300px] top-0 right-0" />

        <div className="card p-8 max-w-md w-full text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-zinc-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            შესვლა საჭიროა
          </h2>
          <p className="text-zinc-400 mb-6">
            ბილეთის გასაყიდად გთხოვთ შეხვიდეთ ანგარიშზე
          </p>
          <Link href="/login" className="btn btn-primary">
            შესვლა
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="glow-orb glow-orb-lime w-[400px] h-[400px] -top-32 left-1/2 -translate-x-1/2" />

        <div className="card p-8 max-w-md w-full text-center animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#c4f135]/20 rounded-full blur-[60px]" />

          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c4f135] to-[#9bc22a] flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#050507]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('sell.success')}
            </h2>
            <p className="text-zinc-400">
              გადამისამართება...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 md:py-12 relative">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 hero-grid opacity-20" />

      {/* Glow orbs */}
      <div className="glow-orb glow-orb-lime w-[400px] h-[400px] -top-32 -left-32" />
      <div className="glow-orb glow-orb-cyan w-[300px] h-[300px] bottom-0 right-0" />

      <div className="container max-w-2xl relative">
        <div className="card p-6 md:p-8 relative overflow-hidden">
          {/* Card glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#c4f135]/10 rounded-full blur-[60px]" />

          <div className="mb-8 relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c4f135] to-[#9bc22a] flex items-center justify-center">
                <Ticket className="w-6 h-6 text-[#050507]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {t('sell.title')}
                </h1>
                <p className="text-zinc-400 text-sm">
                  {t('sell.subtitle')}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            {/* Event Name */}
            <div>
              <label className="label flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c4f135]" />
                {t('sell.form.event_name')} *
              </label>
              <input
                type="text"
                name="event_name"
                value={formData.event_name}
                onChange={handleChange}
                className="input"
                placeholder="მაგ: ბასიანი - გაზაფხულის წვეულება"
                required
              />
            </div>

            {/* Event Date & Venue */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00f5d4]" />
                  {t('sell.form.event_date')} *
                </label>
                <input
                  type="datetime-local"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#ff6b9d]" />
                  {t('sell.form.venue')} *
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className="input"
                  placeholder="მაგ: ბასიანი, თბილისი"
                  required
                />
              </div>
            </div>

            {/* Prices */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-zinc-500" />
                  {t('sell.form.original_price')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="original_price"
                    value={formData.original_price || ''}
                    onChange={handleChange}
                    className="input pr-10"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">₾</span>
                </div>
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#c4f135]" />
                  {t('sell.form.asking_price')} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="asking_price"
                    value={formData.asking_price || ''}
                    onChange={handleChange}
                    className="input pr-10"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">₾</span>
                </div>
              </div>
            </div>

            {/* Ticket Type & Quantity */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('sell.form.ticket_type')}</label>
                <select
                  name="ticket_type"
                  value={formData.ticket_type}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="General">{t('sell.form.ticket_type.general')}</option>
                  <option value="VIP">{t('sell.form.ticket_type.vip')}</option>
                  <option value="Seated">{t('sell.form.ticket_type.seated')}</option>
                </select>
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Hash className="w-4 h-4 text-zinc-500" />
                  {t('sell.form.quantity')}
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="input"
                  min="1"
                  max="10"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-500" />
                {t('sell.form.description')}
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="input min-h-[100px] resize-none"
                placeholder="დამატებითი ინფორმაცია..."
              />
            </div>

            {/* Ticket Proof Upload */}
            <div>
              <label className="label">{t('sell.form.proof')}</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  ticketProof
                    ? 'border-[#c4f135]/50 bg-[#c4f135]/5'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {ticketProof ? (
                  <div className="flex items-center justify-center gap-2 text-[#c4f135]">
                    <CheckCircle className="w-5 h-5" />
                    <span>{ticketProof.name}</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6 text-zinc-500" />
                    </div>
                    <p className="text-zinc-400">დააწკაპუნეთ ან გადმოიტანეთ ფაილი</p>
                    <p className="text-xs text-zinc-600 mt-1">PNG, JPG, PDF (მაქს. 5MB)</p>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-3.5"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t('sell.form.submit')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

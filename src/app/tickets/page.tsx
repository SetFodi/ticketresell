'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Ticket } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import TicketCard from '@/components/TicketCard'
import { Search, SlidersHorizontal, Calendar, Sparkles, Loader2, Ticket as TicketIcon } from 'lucide-react'

type EventCategory = 'all' | 'concerts' | 'clubs' | 'sports' | 'theater'

export default function TicketsPage() {
  const { t } = useLanguage()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState<EventCategory>('all')
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'recent'>('recent')

  const supabase = createClient()

  useEffect(() => {
    fetchTickets()
  }, [category, sortBy])

  async function fetchTickets() {
    setLoading(true)

    let query = supabase
      .from('tickets')
      .select(`
        *,
        seller:users!seller_id (
          id,
          full_name,
          is_verified_seller,
          reputation_score,
          avatar_url
        )
      `)
      .eq('status', 'available')
      .gt('event_date', new Date().toISOString())

    // Apply sorting
    switch (sortBy) {
      case 'date':
        query = query.order('event_date', { ascending: true })
        break
      case 'price':
        query = query.order('asking_price', { ascending: true })
        break
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching tickets:', error)
    } else {
      setTickets(data as Ticket[])
    }

    setLoading(false)
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        ticket.event_name.toLowerCase().includes(query) ||
        ticket.venue.toLowerCase().includes(query)
      )
    }
    return true
  })

  const categories: { value: EventCategory; label: string; icon?: string }[] = [
    { value: 'all', label: t('tickets.filter.all') },
    { value: 'concerts', label: t('tickets.filter.concerts') },
    { value: 'clubs', label: t('tickets.filter.clubs') },
    { value: 'sports', label: t('tickets.filter.sports') },
    { value: 'theater', label: t('tickets.filter.theater') },
  ]

  return (
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 hero-grid opacity-30" />

      {/* Glow orbs */}
      <div className="glow-orb glow-orb-lime w-[400px] h-[400px] -top-32 right-0" />
      <div className="glow-orb glow-orb-cyan w-[300px] h-[300px] top-1/2 -left-32" />

      {/* Header Section */}
      <div className="relative border-b border-white/5">
        <div className="container py-8 md:py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c4f135]/20 to-[#c4f135]/5 flex items-center justify-center">
              <TicketIcon className="w-5 h-5 text-[#c4f135]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {t('tickets.browse')}
            </h1>
          </div>
          <p className="text-zinc-400 mb-8">
            {t('tickets.subtitle')}
          </p>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder={t('tickets.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12 w-full"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="input pl-12 w-full md:w-48 appearance-none cursor-pointer"
              >
                <option value="recent">{t('tickets.sort.recent')}</option>
                <option value="date">{t('tickets.sort.date')}</option>
                <option value="price">{t('tickets.sort.price')}</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  category === cat.value
                    ? 'bg-[#c4f135] text-[#050507] shadow-lg shadow-[#c4f135]/20'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="container py-8 md:py-12 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c4f135]/20 to-[#c4f135]/5 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#c4f135]" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-[#c4f135] blur-2xl opacity-20 animate-pulse" />
            </div>
            <p className="text-zinc-500 mt-4">{t('common.loading')}</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10" />
              <div className="relative w-full h-full rounded-2xl flex items-center justify-center">
                <Search className="w-10 h-10 text-zinc-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t('tickets.no_results')}
            </h3>
            <p className="text-zinc-500">
              {t('tickets.try_other')}
            </p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-[#c4f135]" />
              <span className="text-sm text-zinc-400">
                {t('tickets.found')} <span className="text-white font-medium">{filteredTickets.length}</span> {t('common.tickets')}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

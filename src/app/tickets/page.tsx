'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Ticket } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import TicketCard from '@/components/TicketCard'
import { Search, Filter, Calendar, MapPin, Loader2 } from 'lucide-react'

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

  const categories: { value: EventCategory; label: string }[] = [
    { value: 'all', label: t('tickets.filter.all') },
    { value: 'concerts', label: t('tickets.filter.concerts') },
    { value: 'clubs', label: t('tickets.filter.clubs') },
    { value: 'sports', label: t('tickets.filter.sports') },
    { value: 'theater', label: t('tickets.filter.theater') },
  ]

  return (
    <div className="bg-zinc-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="container py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
            {t('tickets.browse')}
          </h1>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder={t('tickets.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="input w-full md:w-44"
            >
              <option value="recent">ახალი</option>
              <option value="date">თარიღით</option>
              <option value="price">ფასით</option>
            </select>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === cat.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="container py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 mb-2">
              {t('tickets.no_results')}
            </h3>
            <p className="text-zinc-500">
              სცადეთ სხვა ძიება ან ფილტრი
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

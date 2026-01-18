export type UserRole = 'buyer' | 'seller' | 'admin'

export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export type TicketStatus = 'available' | 'pending' | 'sold' | 'disputed' | 'completed' | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'held' | 'released' | 'refunded'

export type DisputeReason = 'ticket_invalid' | 'wrong_ticket' | 'seller_no_show' | 'other'

export type DisputeStatus = 'open' | 'investigating' | 'resolved_buyer' | 'resolved_seller'

export type VerificationType = 'bank_link' | 'id_document' | 'phone'

export interface User {
  id: string
  email: string | null
  phone: string
  full_name: string | null
  is_verified_seller: boolean
  is_admin: boolean
  bank_account_last4: string | null
  reputation_score: number
  created_at: string
  avatar_url: string | null
}

export interface Ticket {
  id: string
  seller_id: string
  event_name: string
  event_date: string
  venue: string
  original_price: number
  asking_price: number
  ticket_type: string
  quantity: number
  ticket_proof_url: string | null
  description: string | null
  status: TicketStatus
  created_at: string
  seller?: User
}

export interface Transaction {
  id: string
  ticket_id: string
  buyer_id: string
  seller_id: string
  amount: number
  platform_fee: number
  payment_status: PaymentStatus
  payment_provider_id: string | null
  escrow_release_at: string | null
  seller_bank_details: string | null
  payment_proof_url: string | null
  seller_confirmed: boolean
  ticket_sent: boolean
  ticket_sent_at: string | null
  created_at: string
  ticket?: Ticket
  buyer?: User
  seller?: User
}

export interface Dispute {
  id: string
  transaction_id: string
  reporter_id: string
  reason: DisputeReason
  description: string
  evidence_urls: string[]
  status: DisputeStatus
  resolution_notes: string | null
  created_at: string
  resolved_at: string | null
  transaction?: Transaction
  reporter?: User
}

export interface SellerVerification {
  id: string
  user_id: string
  verification_type: VerificationType
  verification_data: string | null
  status: VerificationStatus
  verified_at: string | null
  created_at: string
}

export interface Message {
  id: string
  transaction_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: User
}

// Form types
export interface CreateTicketInput {
  event_name: string
  event_date: string
  venue: string
  original_price: number
  asking_price: number
  ticket_type: string
  quantity: number
  description?: string
}

export interface CreateDisputeInput {
  transaction_id: string
  reason: DisputeReason
  description: string
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// Translation keys
export type TranslationKey =
  | 'nav.home'
  | 'nav.browse'
  | 'nav.sell'
  | 'nav.profile'
  | 'nav.login'
  | 'nav.logout'
  | 'home.hero.title'
  | 'home.hero.subtitle'
  | 'home.hero.cta'
  | 'home.features.verified'
  | 'home.features.secure'
  | 'home.features.easy'
  | 'tickets.browse'
  | 'tickets.filter.all'
  | 'tickets.filter.concerts'
  | 'tickets.filter.clubs'
  | 'tickets.filter.sports'
  | 'tickets.no_results'
  | 'ticket.buy_now'
  | 'ticket.original_price'
  | 'ticket.asking_price'
  | 'ticket.quantity'
  | 'ticket.seller'
  | 'ticket.verified_seller'
  | 'sell.title'
  | 'sell.form.event_name'
  | 'sell.form.event_date'
  | 'sell.form.venue'
  | 'sell.form.original_price'
  | 'sell.form.asking_price'
  | 'sell.form.ticket_type'
  | 'sell.form.quantity'
  | 'sell.form.description'
  | 'sell.form.proof'
  | 'sell.form.submit'
  | 'auth.phone'
  | 'auth.otp'
  | 'auth.send_otp'
  | 'auth.verify'
  | 'profile.title'
  | 'profile.verify'
  | 'profile.my_tickets'
  | 'profile.my_purchases'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.cancel'
  | 'common.confirm'
  | 'common.gel'

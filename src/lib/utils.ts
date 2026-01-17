import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ka-GE', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

export function formatDate(date: string | Date, locale: string = 'ka-GE'): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatDateTime(date: string | Date, locale: string = 'ka-GE'): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffInMs = now.getTime() - d.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return 'ახლახანს'
  if (diffInMinutes < 60) return `${diffInMinutes} წუთის წინ`
  if (diffInHours < 24) return `${diffInHours} საათის წინ`
  if (diffInDays < 7) return `${diffInDays} დღის წინ`
  return formatDate(d)
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function isValidPhone(phone: string): boolean {
  // Georgian phone numbers: +995 XXX XXX XXX
  const phoneRegex = /^\+995\d{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 12 && cleaned.startsWith('995')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
  }
  return phone
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function calculatePlatformFee(amount: number, feePercent: number = 12): number {
  return Math.round(amount * (feePercent / 100) * 100) / 100
}

export function getEscrowReleaseDate(eventDate: string | Date): Date {
  const d = new Date(eventDate)
  d.setHours(d.getHours() + 24)
  return d
}

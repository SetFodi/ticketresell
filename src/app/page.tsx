'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  Shield,
  BadgeCheck,
  Clock,
  ArrowRight,
  Search,
  Plus,
  CheckCircle,
  Sparkles,
  Zap,
  Lock,
  TrendingUp,
  Users,
  Star,
} from 'lucide-react'

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background layers */}
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 hero-grid" />

        {/* Animated glow orbs */}
        <div className="glow-orb glow-orb-lime w-[500px] h-[500px] -top-48 -left-48 animate-float" />
        <div className="glow-orb glow-orb-cyan w-[400px] h-[400px] top-1/2 -right-32 animate-float" style={{ animationDelay: '1s' }} />
        <div className="glow-orb glow-orb-pink w-[300px] h-[300px] bottom-0 left-1/3 animate-float" style={{ animationDelay: '2s' }} />

        <div className="container relative py-20 md:py-32">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
              <div className="w-2 h-2 rounded-full bg-[#c4f135] animate-pulse" />
              <span className="text-sm text-zinc-400">საქართველოს #1 ბილეთების პლატფორმა</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 animate-fade-in-up stagger-1">
              <span className="text-white">იყიდე და გაყიდე</span>
              <br />
              <span className="gradient-text">ბილეთები უსაფრთხოდ</span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-2xl leading-relaxed animate-fade-in-up stagger-2">
              {t('home.hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-3">
              <Link
                href="/tickets"
                className="btn btn-primary btn-lg group"
              >
                <Search className="w-5 h-5" />
                {t('home.hero.cta')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/sell"
                className="btn btn-secondary btn-lg"
              >
                <Plus className="w-5 h-5" />
                {t('home.hero.sell_cta')}
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-8 mt-12 pt-8 border-t border-white/5 animate-fade-in-up stagger-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#c4f135]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#c4f135]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-xs text-zinc-500">მომხმარებელი</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#00f5d4]/10 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-[#00f5d4]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-zinc-500">ვერიფიცირებული</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#ff6b9d]/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#ff6b9d]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">0%</div>
                  <div className="text-xs text-zinc-500">თაღლითობა</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              რატომ <span className="gradient-text">TktResell</span>?
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Facebook-ისა და Telegram-ის ჯგუფებში ბილეთების ყიდვა სარისკოა.
              ჩვენთან თანხა დაცულია.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="card card-hover p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c4f135]/20 to-[#c4f135]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BadgeCheck className="w-7 h-7 text-[#c4f135]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('home.features.verified')}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {t('home.features.verified_desc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card card-hover p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00f5d4]/20 to-[#00f5d4]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-7 h-7 text-[#00f5d4]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('home.features.secure')}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {t('home.features.secure_desc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card card-hover p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff6b9d]/20 to-[#ff6b9d]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-[#ff6b9d]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('home.features.easy')}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {t('home.features.easy_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section relative bg-[#0a0a0f]">
        <div className="absolute inset-0 hero-grid opacity-50" />

        <div className="container relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('home.how.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* For Buyers */}
            <div className="card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c4f135]/5 rounded-full blur-3xl" />

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[#c4f135]/10 flex items-center justify-center">
                  <Search className="w-6 h-6 text-[#c4f135]" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {t('home.how.buyer.title')}
                </h3>
              </div>

              <div className="space-y-6">
                <Step number={1} text={t('home.how.buyer.step1')} color="#c4f135" />
                <Step number={2} text={t('home.how.buyer.step2')} color="#00f5d4" />
                <Step number={3} text={t('home.how.buyer.step3')} color="#ff6b9d" />
              </div>
            </div>

            {/* For Sellers */}
            <div className="card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f5d4]/5 rounded-full blur-3xl" />

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[#00f5d4]/10 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-[#00f5d4]" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {t('home.how.seller.title')}
                </h3>
              </div>

              <div className="space-y-6">
                <Step number={1} text={t('home.how.seller.step1')} color="#00f5d4" />
                <Step number={2} text={t('home.how.seller.step2')} color="#a855f7" />
                <Step number={3} text={t('home.how.seller.step3')} color="#c4f135" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Points Section */}
      <section className="section">
        <div className="container">
          <div className="card p-8 md:p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 mesh-gradient opacity-50" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#c4f135]/10 rounded-full blur-[100px]" />

            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c4f135]/10 border border-[#c4f135]/20 mb-6">
                <Sparkles className="w-4 h-4 text-[#c4f135]" />
                <span className="text-sm font-medium text-[#c4f135]">ნდობა და უსაფრთხოება</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                თქვენი ფული დაცულია
              </h2>

              <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <TrustPoint
                  icon={<BadgeCheck className="w-6 h-6" />}
                  text="ვერიფიცირებული გამყიდველები"
                  color="#c4f135"
                />
                <TrustPoint
                  icon={<Shield className="w-6 h-6" />}
                  text="თანხის დაცვა ღონისძიებამდე"
                  color="#00f5d4"
                />
                <TrustPoint
                  icon={<Star className="w-6 h-6" />}
                  text="მარტივი დავების გადაწყვეტა"
                  color="#ff6b9d"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#c4f135]/5 to-transparent" />

        <div className="container relative text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            მზად ხართ <span className="gradient-text">დასაწყებად</span>?
          </h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-xl mx-auto">
            დარეგისტრირდით უფასოდ და დაიწყეთ ბილეთების უსაფრთხო ყიდვა-გაყიდვა.
          </p>
          <Link
            href="/login"
            className="btn btn-primary btn-lg group"
          >
            დაწყება
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  )
}

function Step({ number, text, color }: { number: number; text: string; color: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-110"
        style={{
          backgroundColor: `${color}15`,
          color: color,
          boxShadow: `0 0 20px ${color}20`,
        }}
      >
        {number}
      </div>
      <span className="text-zinc-300 group-hover:text-white transition-colors">{text}</span>
    </div>
  )
}

function TrustPoint({ icon, text, color }: { icon: React.ReactNode; text: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition-colors">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          backgroundColor: `${color}15`,
          color: color,
        }}
      >
        {icon}
      </div>
      <span className="text-sm text-zinc-300 text-center">{text}</span>
    </div>
  )
}

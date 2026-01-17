'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { Shield, BadgeCheck, Clock, ArrowRight, Search, Plus, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-600 via-primary-800 to-zinc-900 text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>


        <div className="container relative py-20 md:py-28 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/tickets"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                <Search className="w-5 h-5" />
                {t('home.hero.cta')}
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-400 border border-primary-400 transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t('home.hero.sell_cta')}
              </Link>
            </div>
          </div>
        </div>
      </section >

      {/* Features Section */}
      < section className="section bg-white" >
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Verified Sellers */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <BadgeCheck className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                {t('home.features.verified')}
              </h3>
              <p className="text-zinc-600">
                {t('home.features.verified_desc')}
              </p>
            </div>

            {/* Secure Payments */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                {t('home.features.secure')}
              </h3>
              <p className="text-zinc-600">
                {t('home.features.secure_desc')}
              </p>
            </div>

            {/* Easy Process */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Clock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                {t('home.features.easy')}
              </h3>
              <p className="text-zinc-600">
                {t('home.features.easy_desc')}
              </p>
            </div>
          </div>
        </div>
      </section >

      {/* How It Works Section */}
      < section className="section bg-zinc-50" >
        <div className="container">
          <h2 className="text-3xl font-bold text-center text-zinc-900 mb-12">
            {t('home.how.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* For Buyers */}
            <div className="card card-hover p-8">
              <h3 className="text-xl font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary-600" />
                {t('home.how.buyer.title')}
              </h3>
              <div className="space-y-4">
                <Step number={1} text={t('home.how.buyer.step1')} />
                <Step number={2} text={t('home.how.buyer.step2')} />
                <Step number={3} text={t('home.how.buyer.step3')} />
              </div>
            </div>

            {/* For Sellers */}
            <div className="card card-hover p-8">
              <h3 className="text-xl font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-600" />
                {t('home.how.seller.title')}
              </h3>
              <div className="space-y-4">
                <Step number={1} text={t('home.how.seller.step1')} />
                <Step number={2} text={t('home.how.seller.step2')} />
                <Step number={3} text={t('home.how.seller.step3')} />
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Trust Section */}
      < section className="section bg-white" >
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-zinc-900 mb-6">
              რატომ TktResell?
            </h2>
            <p className="text-lg text-zinc-600 mb-8">
              Facebook-ისა და Telegram-ის ჯგუფებში ბილეთების ყიდვა სარისკოა.
              TktResell-ზე ყველა გამყიდველი ვერიფიცირებულია და თანხა დაცულია.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 text-left">
              <TrustPoint text="ვერიფიცირებული გამყიდველები ბანკის დაკავშირებით" />
              <TrustPoint text="თანხის დაცვა ღონისძიებამდე" />
              <TrustPoint text="მარტივი დავების გადაწყვეტა" />
            </div>
          </div>
        </div>
      </section >

      {/* CTA Section */}
      < section className="section bg-primary-600 text-white" >
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            მზად ხართ დასაწყებად?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
            დარეგისტრირდით უფასოდ და დაიწყეთ ბილეთების უსაფრთხო ყიდვა-გაყიდვა.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            დაწყება
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section >
    </div >
  )
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
        {number}
      </div>
      <span className="text-zinc-700">{text}</span>
    </div>
  )
}

function TrustPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
      <span className="text-zinc-700">{text}</span>
    </div>
  )
}

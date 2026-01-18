'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-white/5 py-12 mt-auto">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c4f135] to-[#9bc22a] flex items-center justify-center">
                <svg className="w-4 h-4 text-[#050507]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <span className="font-bold text-white">
                Tkt<span className="text-[#c4f135]">Resell</span>
              </span>
            </div>
            <p className="text-sm text-zinc-600">
              © {new Date().getFullYear()} TktResell. {t('footer.rights')}
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm">
            <Link href="/terms" className="text-zinc-500 hover:text-[#c4f135] transition-colors">
              {t('footer.terms')}
            </Link>
            <Link href="/privacy" className="text-zinc-500 hover:text-[#c4f135] transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/contact" className="text-zinc-500 hover:text-[#c4f135] transition-colors">
              {t('footer.contact')}
            </Link>
          </div>

          {/* Social / Made with */}
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <span>{t('footer.made_in')}</span>
            <span className="text-[#c4f135]">&#10084;</span>
            <span>{t('footer.georgia')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

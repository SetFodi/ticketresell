import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import Header from '@/components/Header'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'TktResell - ბილეთების უსაფრთხო გაყიდვა',
  description: 'იყიდე და გაყიდე ღონისძიებების ბილეთები უსაფრთხოდ. ვერიფიცირებული გამყიდველები, უსაფრთხო ტრანზაქციები.',
  keywords: ['ბილეთები', 'კონცერტები', 'თბილისი', 'საქართველო', 'რესელი', 'tickets', 'concerts', 'Georgia'],
  openGraph: {
    title: 'TktResell - ბილეთების უსაფრთხო გაყიდვა',
    description: 'იყიდე და გაყიდე ღონისძიებების ბილეთები უსაფრთხოდ',
    type: 'website',
    locale: 'ka_GE',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ka" className={spaceGrotesk.variable}>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-[#050507]">
              <Header />
              <main className="flex-1">
                {children}
              </main>
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
                        © 2024 TktResell. ყველა უფლება დაცულია.
                      </p>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-8 text-sm">
                      <a href="/terms" className="text-zinc-500 hover:text-[#c4f135] transition-colors">
                        წესები და პირობები
                      </a>
                      <a href="/privacy" className="text-zinc-500 hover:text-[#c4f135] transition-colors">
                        კონფიდენციალურობა
                      </a>
                      <a href="/contact" className="text-zinc-500 hover:text-[#c4f135] transition-colors">
                        კონტაქტი
                      </a>
                    </div>

                    {/* Social / Made with */}
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <span>შექმნილია</span>
                      <span className="text-[#c4f135]">♥</span>
                      <span>საქართველოში</span>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

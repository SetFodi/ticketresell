import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="ka">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <footer className="bg-zinc-50 border-t border-zinc-200 py-8">
                <div className="container">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-zinc-500">
                      © 2024 TktResell. ყველა უფლება დაცულია.
                    </div>
                    <div className="flex items-center gap-6 text-sm text-zinc-500">
                      <a href="/terms" className="hover:text-zinc-700">წესები და პირობები</a>
                      <a href="/privacy" className="hover:text-zinc-700">კონფიდენციალურობა</a>
                      <a href="/contact" className="hover:text-zinc-700">კონტაქტი</a>
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

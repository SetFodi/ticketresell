import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tktresell.ge'),
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
              <Footer />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

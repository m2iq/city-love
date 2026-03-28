import type { Metadata } from 'next';
import { Cairo, Noto_Naskh_Arabic } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
});

const naskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-naskh',
});

export const metadata: Metadata = {
  title: 'مدينة حب - رسائل رومانسية عبر العراق',
  description: 'أرسل رسالة حب سينمائية من محافظة إلى أخرى داخل العراق، وشاهد الرحلة على خريطة تفاعلية عربية أنيقة.',
  keywords: 'العراق, رسائل حب, خريطة العراق, تجربة تفاعلية, رسائل رومانسية, محافظات العراق',
  openGraph: {
    title: 'مدينة حب - تجربة رسائل عاطفية عبر خريطة العراق',
    description: 'تجربة عربية سينمائية تنقل رسالة الحب بين المحافظات العراقية بطريقة بصرية راقية.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${naskh.variable}`}>
      <body className="font-sans antialiased min-h-screen romantic-gradient text-white">
        {children}
      </body>
    </html>
  );
}

import Link from 'next/link';
import { HeartCrack } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 romantic-gradient">
      <div className="text-center space-y-5">
        <HeartCrack className="w-14 h-14 mx-auto text-romantic-400/60" />
        <h1 className="text-2xl font-serif font-bold text-white">الرسالة غير موجودة</h1>
        <p className="text-white/40 text-sm">قد يكون الرابط غير صحيح أو أن الرسالة لم تعد متاحة.</p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-3 rounded-2xl bg-linear-to-r from-romantic-500 to-romantic-600 text-white font-semibold shadow-lg shadow-romantic-500/25 hover:shadow-romantic-500/40 transition-all"
        >
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}

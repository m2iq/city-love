import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { provinces } from '@/lib/provinces';
import CinematicExperience from './CinematicExperience';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from('messages')
    .select('sender_name, receiver_name, sender_province, receiver_province')
    .eq('slug', id)
    .single();

  if (!data) {
    return { title: 'الرسالة غير موجودة' };
  }

  const senderProvince = provinces[data.sender_province]?.nameAr ?? data.sender_province;
  const receiverProvince = provinces[data.receiver_province]?.nameAr ?? data.receiver_province;

  return {
    title: `رسالة حب من ${data.sender_name} إلى ${data.receiver_name}`,
    description: `رسالة رومانسية تعبر العراق من ${senderProvince} إلى ${receiverProvince}.`,
    openGraph: {
      title: `رسالة حب إلى ${data.receiver_name}`,
      description: 'تجربة عربية تفاعلية لرسائل الحب عبر خريطة العراق',
    },
  };
}

export default async function MessagePage({ params }: PageProps) {
  const { id } = await params;
  const { data: message, error } = await supabase
    .from('messages')
    .select('*')
    .eq('slug', id)
    .single();

  if (error || !message) {
    notFound();
  }

  return <CinematicExperience message={message} />;
}

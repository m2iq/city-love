import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { provinceList } from '@/lib/provinces';
import { generateSlug } from '@/utils/helpers';

const validProvinceIds = provinceList.map((p) => p.id);
const MAX_NAME = 50;
const MAX_MESSAGE = 500;

function sanitize(text: string): string {
  return text.trim().replace(/<[^>]*>/g, '').slice(0, MAX_MESSAGE);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { sender_name, receiver_name, message, sender_province, receiver_province, theme, heart_color } = body;

    // Validate required fields
    if (!sender_name || !receiver_name || !message || !sender_province || !receiver_province) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    // Validate lengths
    if (sender_name.trim().length > MAX_NAME || receiver_name.trim().length > MAX_NAME) {
      return NextResponse.json({ error: 'يجب ألا يتجاوز كل اسم 50 حرفًا' }, { status: 400 });
    }

    if (message.trim().length > MAX_MESSAGE) {
      return NextResponse.json({ error: 'يجب ألا تتجاوز الرسالة 500 حرف' }, { status: 400 });
    }

    // Validate provinces
    if (!validProvinceIds.includes(sender_province) || !validProvinceIds.includes(receiver_province)) {
      return NextResponse.json({ error: 'المحافظة المختارة غير صالحة' }, { status: 400 });
    }

    // Sanitize text
    const cleanSender = sanitize(sender_name).slice(0, MAX_NAME);
    const cleanReceiver = sanitize(receiver_name).slice(0, MAX_NAME);
    const cleanMessage = sanitize(message);

    // Validate theme and heart_color
    const validThemes = ['romantic', 'golden', 'midnight', 'sunset'];
    const cleanTheme = validThemes.includes(theme) ? theme : 'romantic';
    const colorRegex = /^#[0-9a-fA-F]{6}$/;
    const cleanColor = colorRegex.test(heart_color) ? heart_color : '#ff2d55';

    const slug = generateSlug();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        slug,
        sender_name: cleanSender,
        receiver_name: cleanReceiver,
        message: cleanMessage,
        sender_province,
        receiver_province,
        theme: cleanTheme,
        heart_color: cleanColor,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'تعذر إنشاء الرسالة حاليًا' }, { status: 500 });
    }

    return NextResponse.json({ slug: data.slug, id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'الطلب غير صالح' }, { status: 400 });
  }
}

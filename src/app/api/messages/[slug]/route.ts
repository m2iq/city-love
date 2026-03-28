import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { provinceList } from '@/lib/provinces';

const validProvinceIds = provinceList.map((p) => p.id);
const MAX_NAME = 50;
const MAX_MESSAGE = 500;
const validThemes = ['romantic', 'golden', 'midnight', 'sunset'];
const colorRegex = /^#[0-9a-fA-F]{6}$/;

function sanitize(text: string, max: number): string {
  return text.trim().replace(/<[^>]*>/g, '').slice(0, max);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) return NextResponse.json({ error: 'المعرّف مطلوب' }, { status: 400 });

    const body = await request.json();
    const { sender_name, receiver_name, message, sender_province, receiver_province, theme, heart_color } = body;

    const updates: Record<string, string> = {};

    if (sender_name !== undefined) {
      const v = sanitize(String(sender_name), MAX_NAME);
      if (!v) return NextResponse.json({ error: 'اسم المرسل مطلوب' }, { status: 400 });
      updates.sender_name = v;
    }
    if (receiver_name !== undefined) {
      const v = sanitize(String(receiver_name), MAX_NAME);
      if (!v) return NextResponse.json({ error: 'اسم المستلم مطلوب' }, { status: 400 });
      updates.receiver_name = v;
    }
    if (message !== undefined) {
      const v = sanitize(String(message), MAX_MESSAGE);
      if (!v) return NextResponse.json({ error: 'نص الرسالة مطلوب' }, { status: 400 });
      updates.message = v;
    }
    if (sender_province !== undefined) {
      if (!validProvinceIds.includes(sender_province))
        return NextResponse.json({ error: 'المحافظة المرسلة غير صالحة' }, { status: 400 });
      updates.sender_province = sender_province;
    }
    if (receiver_province !== undefined) {
      if (!validProvinceIds.includes(receiver_province))
        return NextResponse.json({ error: 'المحافظة المستلمة غير صالحة' }, { status: 400 });
      updates.receiver_province = receiver_province;
    }
    if (theme !== undefined) {
      if (!validThemes.includes(theme))
        return NextResponse.json({ error: 'الطابع اللوني غير صالح' }, { status: 400 });
      updates.theme = theme;
    }
    if (heart_color !== undefined) {
      if (!colorRegex.test(heart_color))
        return NextResponse.json({ error: 'لون القلب غير صالح' }, { status: 400 });
      updates.heart_color = heart_color;
    }

    if (Object.keys(updates).length === 0)
      return NextResponse.json({ error: 'لا توجد بيانات للتحديث' }, { status: 400 });

    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('slug', slug)
      .select('slug')
      .single();

    if (error || !data)
      return NextResponse.json({ error: 'تعذر تحديث الرسالة' }, { status: 500 });

    return NextResponse.json({ slug: data.slug });
  } catch {
    return NextResponse.json({ error: 'الطلب غير صالح' }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) return NextResponse.json({ error: 'المعرّف مطلوب' }, { status: 400 });

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('slug', slug);

    if (error)
      return NextResponse.json({ error: 'تعذر حذف الرسالة' }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'الطلب غير صالح' }, { status: 400 });
  }
}

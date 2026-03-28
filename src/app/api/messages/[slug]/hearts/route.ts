import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Increment heart count
    const { data: message } = await supabase
      .from('messages')
      .select('hearts_count')
      .eq('slug', slug)
      .single();

    if (!message) {
      return NextResponse.json({ error: 'الرسالة غير موجودة' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('messages')
      .update({ hearts_count: message.hearts_count + 1 })
      .eq('slug', slug)
      .select('hearts_count')
      .single();

    if (error) {
      return NextResponse.json({ error: 'تعذر تحديث التفاعل' }, { status: 500 });
    }

    return NextResponse.json({ hearts_count: data.hearts_count });
  } catch {
    return NextResponse.json({ error: 'الطلب غير صالح' }, { status: 400 });
  }
}

import DOMPurify from 'dompurify';

const MAX_NAME_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 500;

export function sanitizeText(text: string): string {
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(text.trim(), { ALLOWED_TAGS: [] });
  }
  // Server-side: strip HTML tags
  return text.trim().replace(/<[^>]*>/g, '');
}

export function validateName(name: string): { valid: boolean; error?: string } {
  const clean = name.trim();
  if (!clean) return { valid: false, error: 'هذا الحقل مطلوب' };
  if (clean.length > MAX_NAME_LENGTH) return { valid: false, error: `يجب ألا يتجاوز الاسم ${MAX_NAME_LENGTH} حرفًا` };
  return { valid: true };
}

export function validateMessage(msg: string): { valid: boolean; error?: string } {
  const clean = msg.trim();
  if (!clean) return { valid: false, error: 'الرسالة مطلوبة' };
  if (clean.length > MAX_MESSAGE_LENGTH) return { valid: false, error: `يجب ألا تتجاوز الرسالة ${MAX_MESSAGE_LENGTH} حرفًا` };
  return { valid: true };
}

export function validateProvince(province: string, validProvinces: string[]): { valid: boolean; error?: string } {
  if (!province) return { valid: false, error: 'يرجى اختيار المحافظة' };
  if (!validProvinces.includes(province)) return { valid: false, error: 'المحافظة المختارة غير صالحة' };
  return { valid: true };
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Heart, ArrowRight, Eye, RotateCcw, MapPin, Trash2, Clock, ExternalLink, Pencil, X, Check, Download } from 'lucide-react';
import { provinceList } from '@/lib/provinces';
import { validateName, validateMessage, validateProvince, sanitizeText } from '@/utils/validation';
import { checkRateLimit, incrementRateLimit, saveMessageToHistory, getMessageHistory, deleteMessageFromHistory, updateMessageInHistory, formatDate, type SavedMessage } from '@/utils/helpers';
import GlassCard from '@/components/ui/GlassCard';
import RomanticButton from '@/components/ui/RomanticButton';
import { RomanticInput, RomanticTextarea, RomanticSelect } from '@/components/ui/FormElements';
import ShareButtons from '@/components/ShareButtons';
import ColoredQR from '@/components/ColoredQR';

const ParticleField = dynamic(() => import('@/components/ParticleField'), { ssr: false });
const IraqMap = dynamic(() => import('@/components/IraqMap'), { ssr: false });

const provinceOptions = provinceList.map((p) => ({
  value: p.id,
  label: p.nameAr,
}));

const themes = [
  { value: 'romantic', label: 'قلب ملتهب' },
  { value: 'golden', label: 'بريق الشمس' },
  { value: 'midnight', label: 'سحر الليل' },
  { value: 'sunset', label: 'أفق الحنين' },
];

const heartColors: Record<string, string> = {
  romantic: '#ff2d55',
  golden: '#fbbf24',
  midnight: '#818cf8',
  sunset: '#f97316',
};

interface FormErrors {
  sender_name?: string;
  receiver_name?: string;
  message?: string;
  sender_province?: string;
  receiver_province?: string;
}

export default function CreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    sender_name: '',
    receiver_name: '',
    message: '',
    sender_province: '',
    receiver_province: '',
    theme: 'romantic',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [createdColor, setCreatedColor] = useState<string>('#ff2d55');
  const [serverError, setServerError] = useState('');
  const [history, setHistory] = useState<SavedMessage[]>([]);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Edit modal state
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ sender_name: '', receiver_name: '', message: '', sender_province: '', receiver_province: '', theme: 'romantic' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    setHistory(getMessageHistory());
  }, []);

  const validProvinceIds = provinceList.map((p) => p.id);
  const heartColor = heartColors[formData.theme] || '#ff2d55';

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError('');
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const sn = validateName(formData.sender_name);
    if (!sn.valid) newErrors.sender_name = sn.error;
    const rn = validateName(formData.receiver_name);
    if (!rn.valid) newErrors.receiver_name = rn.error;
    const msg = validateMessage(formData.message);
    if (!msg.valid) newErrors.message = msg.error;
    const sp = validateProvince(formData.sender_province, validProvinceIds);
    if (!sp.valid) newErrors.sender_province = sp.error;
    const rp = validateProvince(formData.receiver_province, validProvinceIds);
    if (!rp.valid) newErrors.receiver_province = rp.error;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    if (!checkRateLimit()) {
      setServerError('لقد أرسلت رسائل كثيرة مؤخرًا. يرجى الانتظار قليلًا ثم المحاولة مجددًا.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: sanitizeText(formData.sender_name),
          receiver_name: sanitizeText(formData.receiver_name),
          message: sanitizeText(formData.message),
          sender_province: formData.sender_province,
          receiver_province: formData.receiver_province,
          theme: formData.theme,
          heart_color: heartColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error || 'حدث خطأ غير متوقع'); return; }
      incrementRateLimit();
      saveMessageToHistory({
        slug: data.slug,
        sender_name: sanitizeText(formData.sender_name),
        receiver_name: sanitizeText(formData.receiver_name),
        sender_province: formData.sender_province,
        receiver_province: formData.receiver_province,
        heart_color: heartColor,
        theme: formData.theme,
      });
      setHistory(getMessageHistory());
      setCreatedColor(heartColor);
      setCreatedSlug(data.slug);
    } catch {
      setServerError('تعذر الاتصال الآن. حاول مرة أخرى بعد قليل.');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = async (slug: string, heartColor: string) => {
    if (typeof window === 'undefined') return;
    const QRCode = (await import('qrcode')).default;
    const url = `${window.location.origin}/m/${slug}`;
    const size = 220;
    const padding = 24;
    const total = size + padding * 2;
    const canvas = document.createElement('canvas');
    canvas.width = total;
    canvas.height = total;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark background
    const grad = ctx.createLinearGradient(0, 0, total, total);
    grad.addColorStop(0, '#0d0d1a');
    grad.addColorStop(1, '#151525');
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, total, total, 16);
    ctx.fill();

    // QR on a temp canvas
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, url, {
      width: size,
      margin: 0,
      color: { dark: heartColor, light: '#00000000' },
    });
    ctx.drawImage(qrCanvas, padding, padding);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `qr-${slug}.png`;
    a.click();
  };

  const openEdit = (msg: SavedMessage) => {
    setEditSlug(msg.slug);
    setEditForm({
      sender_name: msg.sender_name,
      receiver_name: msg.receiver_name,
      message: '',
      sender_province: msg.sender_province,
      receiver_province: msg.receiver_province,
      theme: msg.theme,
    });
    setEditError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSlug) return;
    setEditLoading(true);
    setEditError('');
    const editColor = heartColors[editForm.theme] || '#ff2d55';
    try {
      const payload: Record<string, string> = {
        sender_name: editForm.sender_name.trim(),
        receiver_name: editForm.receiver_name.trim(),
        sender_province: editForm.sender_province,
        receiver_province: editForm.receiver_province,
        theme: editForm.theme,
        heart_color: editColor,
      };
      if (editForm.message.trim()) payload.message = editForm.message.trim();

      const res = await fetch(`/api/messages/${editSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error || 'حدث خطأ'); return; }

      updateMessageInHistory(editSlug, {
        sender_name: editForm.sender_name.trim(),
        receiver_name: editForm.receiver_name.trim(),
        sender_province: editForm.sender_province,
        receiver_province: editForm.receiver_province,
        theme: editForm.theme,
        heart_color: editColor,
      });
      setHistory(getMessageHistory());
      setEditSlug(null);
    } catch {
      setEditError('تعذر الاتصال. حاول مرة أخرى.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen px-4 py-8 md:py-16 overflow-hidden">
      <ParticleField color={heartColor} count={isMobile ? 8 : 20} />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-sm mb-6"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            العودة للرئيسية
          </button>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif">
            <span className="bg-linear-to-r from-romantic-400 to-gold-400 bg-clip-text text-transparent">
              أنشئ رسالتك
            </span>
          </h1>
          <p className="text-white/40 mt-2 text-sm">صمّم رسالة عربية تعبر المحافظات العراقية</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {createdSlug ? (
            /* ── Success ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <GlassCard className="text-center space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Heart className="w-12 h-12 mx-auto" fill={heartColor} color={heartColor} />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 font-serif">تم إنشاء الرسالة</h2>
                  <p className="text-white/40 text-sm">شارك هذا الرابط مع الشخص الذي تنتظره هذه الرسالة</p>
                </div>

                <div className="glass rounded-xl p-3.5 text-sm text-white/60 break-all font-mono select-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/m/${createdSlug}` : `/m/${createdSlug}`}
                </div>

                <ShareButtons slug={createdSlug} />

                {/* Colored QR Code */}
                <div className="pt-2">
                  <ColoredQR
                    url={typeof window !== 'undefined' ? `${window.location.origin}/m/${createdSlug}` : `/m/${createdSlug}`}
                    heartColor={createdColor}
                  />
                </div>

                <div className="flex items-center justify-center gap-6 pt-2">
                  <button
                    onClick={() => router.push(`/m/${createdSlug}`)}
                    className="inline-flex items-center gap-1.5 text-romantic-400 hover:text-romantic-300 text-sm transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    معاينة التجربة
                  </button>
                  <button
                    onClick={() => {
                      setCreatedSlug(null);
                      setFormData({ sender_name: '', receiver_name: '', message: '', sender_province: '', receiver_province: '', theme: 'romantic' });
                    }}
                    className="inline-flex items-center gap-1.5 text-white/25 hover:text-white/50 text-sm transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    رسالة جديدة
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            /* ── Form ── */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-8"
            >
              {/* Form column (3/5) */}
              <div className="lg:col-span-3">
                <GlassCard delay={0.1}>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <RomanticInput
                        label="اسم المرسل"
                        placeholder="مثال: علي"
                        value={formData.sender_name}
                        onChange={(e) => handleChange('sender_name', e.target.value)}
                        error={errors.sender_name}
                        maxLength={50}
                      />
                      <RomanticInput
                        label="اسم المستلم"
                        placeholder="مثال: سارة"
                        value={formData.receiver_name}
                        onChange={(e) => handleChange('receiver_name', e.target.value)}
                        error={errors.receiver_name}
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <RomanticTextarea
                        label="الرسالة"
                        placeholder="اكتب شيئًا دافئًا من القلب..."
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        error={errors.message}
                        maxLength={500}
                      />
                      <p className="text-left text-xs text-white/20 mt-1 pl-1" dir="ltr">
                        {formData.message.length}/500
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <RomanticSelect
                        label="المحافظة المرسلة"
                        value={formData.sender_province}
                        onChange={(e) => handleChange('sender_province', e.target.value)}
                        options={provinceOptions}
                        error={errors.sender_province}
                      />
                      <RomanticSelect
                        label="المحافظة المستلمة"
                        value={formData.receiver_province}
                        onChange={(e) => handleChange('receiver_province', e.target.value)}
                        options={provinceOptions}
                        error={errors.receiver_province}
                      />
                    </div>

                    <RomanticSelect
                      label="الطابع اللوني"
                      value={formData.theme}
                      onChange={(e) => handleChange('theme', e.target.value)}
                      options={themes}
                    />

                    {serverError && (
                      <motion.div
                        className="bg-red-500/8 border border-red-500/20 rounded-xl p-3.5 text-sm text-red-400"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {serverError}
                      </motion.div>
                    )}

                    <RomanticButton type="submit" loading={loading} className="w-full" size="lg">
                      <Heart className="w-4 h-4 ml-1" fill="currentColor" />
                      إرسال الرسالة
                    </RomanticButton>
                  </form>
                </GlassCard>
              </div>

              {/* Map column (2/5) */}
              <div className="lg:col-span-2">
                <GlassCard delay={0.2} className="h-full flex flex-col">
                  <h3 className="text-xs font-medium text-white/30 mb-4 text-center tracking-[0.2em] flex items-center justify-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-white/20" />
                    معاينة خريطة العراق
                  </h3>
                  <div className="relative flex-1 min-h-80 overflow-hidden rounded-xl">
                    <IraqMap
                      senderProvince={formData.sender_province}
                      receiverProvince={formData.receiver_province}
                      showPath={!!(formData.sender_province && formData.receiver_province)}
                      heartColor={heartColor}
                      interactive
                      onProvinceClick={(p) => {
                        if (!formData.sender_province) {
                          handleChange('sender_province', p.id);
                        } else if (!formData.receiver_province) {
                          handleChange('receiver_province', p.id);
                        }
                      }}
                    />
                  </div>
                  {formData.sender_province && formData.receiver_province && (
                    <motion.p
                      className="text-center text-xs text-white/30 mt-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {provinceList.find((p) => p.id === formData.sender_province)?.nameAr} ←{' '}
                      {provinceList.find((p) => p.id === formData.receiver_province)?.nameAr}
                    </motion.p>
                  )}
                </GlassCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── My Messages History ── */}
        {history.length > 0 && (
          <motion.div
            className="mt-14"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-3.5 h-3.5 text-white/25" />
              <h2 className="text-xs font-medium text-white/25 tracking-[0.22em] uppercase">رسائلي المحفوظة</h2>
              <span className="text-white/15 text-xs">({history.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((msg) => (
                <motion.div
                  key={msg.slug}
                  className="glass-card rounded-2xl p-4 border flex flex-col gap-3"
                  style={{ borderColor: `${msg.heart_color}20` }}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Heart
                        className="w-3.5 h-3.5 shrink-0"
                        fill={msg.heart_color}
                        color={msg.heart_color}
                        style={{ filter: `drop-shadow(0 0 5px ${msg.heart_color}80)` }}
                      />
                      <span className="text-white/70 text-sm font-medium truncate">
                        {msg.sender_name} → {msg.receiver_name}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch(`/api/messages/${msg.slug}`, { method: 'DELETE' });
                        deleteMessageFromHistory(msg.slug);
                        setHistory(getMessageHistory());
                      }}
                      className="shrink-0 text-white/15 hover:text-red-400 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Provinces */}
                  <p className="text-white/30 text-xs">
                    {provinceList.find((p) => p.id === msg.sender_province)?.nameAr} ←{' '}
                    {provinceList.find((p) => p.id === msg.receiver_province)?.nameAr}
                  </p>

                  {/* Date */}
                  <p className="text-white/20 text-[11px]">{formatDate(msg.created_at)}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-auto pt-1 border-t" style={{ borderColor: `${msg.heart_color}15` }}>
                    <button
                      onClick={() => router.push(`/m/${msg.slug}`)}
                      className="flex items-center gap-1 text-[11px] transition-colors"
                      style={{ color: `${msg.heart_color}90` }}
                    >
                      <Eye className="w-3 h-3" />
                      معاينة
                    </button>
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(`${window.location.origin}/m/${msg.slug}`);
                        }
                      }}
                      className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      نسخ الرابط
                    </button>
                    <button
                      onClick={() => downloadQR(msg.slug, msg.heart_color)}
                      className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors"
                      title="تحميل الباركود"
                    >
                      <Download className="w-3 h-3" />
                      باركود
                    </button>
                    <button
                      onClick={() => openEdit(msg)}
                      className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors ms-auto"
                    >
                      <Pencil className="w-3 h-3" />
                      تعديل
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Edit Modal ── */}
        <AnimatePresence>
          {editSlug && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setEditSlug(null)}
              />

              {/* Panel */}
              <motion.div
                className="relative z-10 w-full max-w-md glass-card rounded-2xl p-6 border border-white/10"
                initial={{ scale: 0.94, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.94, y: 16 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white/80 font-semibold tracking-wide flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-white/40" />
                    تعديل الرسالة
                  </h3>
                  <button onClick={() => setEditSlug(null)} className="text-white/25 hover:text-white/60 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <RomanticInput
                      label="اسم المرسل"
                      value={editForm.sender_name}
                      onChange={(e) => setEditForm((p) => ({ ...p, sender_name: e.target.value }))}
                      maxLength={50}
                    />
                    <RomanticInput
                      label="اسم المستلم"
                      value={editForm.receiver_name}
                      onChange={(e) => setEditForm((p) => ({ ...p, receiver_name: e.target.value }))}
                      maxLength={50}
                    />
                  </div>

                  <RomanticTextarea
                    label="نص الرسالة الجديد (اتركه فارغاً للإبقاء على القديم)"
                    placeholder="اكتب النص الجديد هنا..."
                    value={editForm.message}
                    onChange={(e) => setEditForm((p) => ({ ...p, message: e.target.value }))}
                    maxLength={500}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <RomanticSelect
                      label="المحافظة المرسلة"
                      value={editForm.sender_province}
                      onChange={(e) => setEditForm((p) => ({ ...p, sender_province: e.target.value }))}
                      options={provinceOptions}
                    />
                    <RomanticSelect
                      label="المحافظة المستلمة"
                      value={editForm.receiver_province}
                      onChange={(e) => setEditForm((p) => ({ ...p, receiver_province: e.target.value }))}
                      options={provinceOptions}
                    />
                  </div>

                  <RomanticSelect
                    label="الطابع اللوني"
                    value={editForm.theme}
                    onChange={(e) => setEditForm((p) => ({ ...p, theme: e.target.value }))}
                    options={themes}
                  />

                  {editError && (
                    <p className="text-red-400 text-sm bg-red-500/8 border border-red-500/20 rounded-xl p-3">
                      {editError}
                    </p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditSlug(null)}
                      className="flex-1 glass rounded-xl py-2.5 text-white/40 hover:text-white/60 text-sm transition-colors"
                    >
                      إلغاء
                    </button>
                    <RomanticButton type="submit" loading={editLoading} className="flex-1">
                      <Check className="w-4 h-4 ml-1" />
                      حفظ التغييرات
                    </RomanticButton>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

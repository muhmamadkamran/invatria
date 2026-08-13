import type { LangCode } from "./types";

export interface LanguageDef {
  code: LangCode;
  label: string;
  native: string;
  rtl: boolean;
}

export const LANGUAGES: LanguageDef[] = [
  { code: "en", label: "English", native: "English", rtl: false },
  { code: "ur", label: "Urdu", native: "اردو", rtl: true },
  { code: "ar", label: "Arabic", native: "العربية", rtl: true },
  { code: "fr", label: "French", native: "Français", rtl: false },
  { code: "es", label: "Spanish", native: "Español", rtl: false },
  { code: "tr", label: "Turkish", native: "Türkçe", rtl: false },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia", rtl: false },
];

export const LANGUAGE_MAP = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l]),
) as Record<LangCode, LanguageDef>;

export function isRtl(code: LangCode) {
  return LANGUAGE_MAP[code]?.rtl ?? false;
}

type Dict = {
  openInvitation: string;
  tapToOpen: string;
  countdownTo: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  theDay: string;
  schedule: string;
  when: string;
  where: string;
  directions: string;
  addToCalendar: string;
  dressCode: string;
  gallery: string;
  ourStory: string;
  family: string;
  gifts: string;
  travel: string;
  transportation: string;
  accommodation: string;
  faqs: string;
  rsvp: string;
  attending: string;
  notAttending: string;
  maybe: string;
  yourName: string;
  yourEmail: string;
  guestCount: string;
  mealPreference: string;
  aMessage: string;
  sendRsvp: string;
  rsvpThanks: string;
  guestbook: string;
  signGuestbook: string;
  scanToOpen: string;
  playMusic: string;
  pauseMusic: string;
  madeWith: string;
};

const en: Dict = {
  openInvitation: "Open Invitation",
  tapToOpen: "Tap the seal to open",
  countdownTo: "Counting down to the day",
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
  theDay: "Today is the day",
  schedule: "Schedule",
  when: "When",
  where: "Where",
  directions: "Get Directions",
  addToCalendar: "Add to Calendar",
  dressCode: "Dress Code",
  gallery: "Gallery",
  ourStory: "Our Story",
  family: "Family",
  gifts: "Gifts",
  travel: "Travel & Stay",
  transportation: "Transportation",
  accommodation: "Accommodation",
  faqs: "Questions",
  rsvp: "RSVP",
  attending: "Joyfully attending",
  notAttending: "Regretfully declining",
  maybe: "Not sure yet",
  yourName: "Your name",
  yourEmail: "Email",
  guestCount: "How many of you?",
  mealPreference: "Meal preference",
  aMessage: "A message (optional)",
  sendRsvp: "Send RSVP",
  rsvpThanks: "Thank you — your reply has been recorded.",
  guestbook: "Guest Book",
  signGuestbook: "Leave a note",
  scanToOpen: "Scan to open",
  playMusic: "Play music",
  pauseMusic: "Pause music",
  madeWith: "Made with Invitra",
};

const dicts: Record<LangCode, Dict> = {
  en,
  ur: {
    ...en,
    openInvitation: "دعوت نامہ کھولیں",
    tapToOpen: "کھولنے کے لیے مہر پر ٹیپ کریں",
    countdownTo: "تقریب میں باقی وقت",
    days: "دن",
    hours: "گھنٹے",
    minutes: "منٹ",
    seconds: "سیکنڈ",
    theDay: "آج کا دن",
    schedule: "پروگرام",
    when: "کب",
    where: "کہاں",
    directions: "راستہ دیکھیں",
    addToCalendar: "کیلنڈر میں شامل کریں",
    dressCode: "لباس",
    gallery: "تصاویر",
    ourStory: "ہماری کہانی",
    family: "خاندان",
    gifts: "تحائف",
    travel: "سفر و قیام",
    transportation: "آمد و رفت",
    accommodation: "رہائش",
    faqs: "سوالات",
    rsvp: "شرکت کی تصدیق",
    attending: "خوشی سے شریک ہوں گا",
    notAttending: "معذرت، شریک نہیں ہو سکتا",
    maybe: "ابھی یقین نہیں",
    yourName: "آپ کا نام",
    yourEmail: "ای میل",
    guestCount: "کتنے افراد؟",
    mealPreference: "کھانے کی ترجیح",
    aMessage: "پیغام (اختیاری)",
    sendRsvp: "بھیجیں",
    rsvpThanks: "شکریہ — آپ کا جواب موصول ہو گیا۔",
    guestbook: "مہمانوں کی کتاب",
    signGuestbook: "پیغام لکھیں",
    scanToOpen: "کھولنے کے لیے اسکین کریں",
    madeWith: "Invitra سے بنایا گیا",
  },
  ar: {
    ...en,
    openInvitation: "افتح الدعوة",
    tapToOpen: "اضغط على الختم للفتح",
    countdownTo: "العد التنازلي لليوم",
    days: "أيام",
    hours: "ساعات",
    minutes: "دقائق",
    seconds: "ثوانٍ",
    theDay: "اليوم هو الموعد",
    schedule: "البرنامج",
    when: "متى",
    where: "أين",
    directions: "الاتجاهات",
    addToCalendar: "أضف إلى التقويم",
    dressCode: "الزي",
    gallery: "الصور",
    ourStory: "قصتنا",
    family: "العائلة",
    gifts: "الهدايا",
    travel: "السفر والإقامة",
    transportation: "المواصلات",
    accommodation: "الإقامة",
    faqs: "الأسئلة",
    rsvp: "تأكيد الحضور",
    attending: "سأحضر بسرور",
    notAttending: "أعتذر عن الحضور",
    maybe: "لست متأكداً بعد",
    yourName: "اسمك",
    yourEmail: "البريد الإلكتروني",
    guestCount: "كم عدد الحضور؟",
    mealPreference: "تفضيل الوجبة",
    aMessage: "رسالة (اختياري)",
    sendRsvp: "إرسال",
    rsvpThanks: "شكراً لك — تم تسجيل ردك.",
    guestbook: "سجل الضيوف",
    signGuestbook: "اترك رسالة",
    scanToOpen: "امسح للفتح",
    madeWith: "صُنع بواسطة Invitra",
  },
  fr: {
    ...en,
    openInvitation: "Ouvrir l'invitation",
    tapToOpen: "Touchez le sceau pour ouvrir",
    countdownTo: "Compte à rebours",
    days: "Jours",
    hours: "Heures",
    minutes: "Minutes",
    seconds: "Secondes",
    theDay: "C'est aujourd'hui",
    schedule: "Programme",
    when: "Quand",
    where: "Où",
    directions: "Itinéraire",
    addToCalendar: "Ajouter au calendrier",
    dressCode: "Tenue",
    gallery: "Galerie",
    ourStory: "Notre histoire",
    family: "Famille",
    gifts: "Cadeaux",
    travel: "Voyage & séjour",
    transportation: "Transport",
    accommodation: "Hébergement",
    faqs: "Questions",
    rsvp: "Réponse",
    attending: "Je serai présent",
    notAttending: "Je ne pourrai pas venir",
    maybe: "Peut-être",
    yourName: "Votre nom",
    yourEmail: "E-mail",
    guestCount: "Combien serez-vous ?",
    mealPreference: "Préférence de repas",
    aMessage: "Un message (facultatif)",
    sendRsvp: "Envoyer",
    rsvpThanks: "Merci — votre réponse a été enregistrée.",
    guestbook: "Livre d'or",
    signGuestbook: "Laisser un mot",
    scanToOpen: "Scannez pour ouvrir",
    madeWith: "Créé avec Invitra",
  },
  es: {
    ...en,
    openInvitation: "Abrir invitación",
    tapToOpen: "Toca el sello para abrir",
    countdownTo: "Cuenta atrás",
    days: "Días",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
    theDay: "Hoy es el día",
    schedule: "Programa",
    when: "Cuándo",
    where: "Dónde",
    directions: "Cómo llegar",
    addToCalendar: "Añadir al calendario",
    dressCode: "Código de vestimenta",
    gallery: "Galería",
    ourStory: "Nuestra historia",
    family: "Familia",
    gifts: "Regalos",
    travel: "Viaje y alojamiento",
    transportation: "Transporte",
    accommodation: "Alojamiento",
    faqs: "Preguntas",
    rsvp: "Confirmar asistencia",
    attending: "Asistiré encantado",
    notAttending: "No podré asistir",
    maybe: "Aún no lo sé",
    yourName: "Tu nombre",
    yourEmail: "Correo",
    guestCount: "¿Cuántos vendréis?",
    mealPreference: "Preferencia de menú",
    aMessage: "Un mensaje (opcional)",
    sendRsvp: "Enviar",
    rsvpThanks: "Gracias — tu respuesta ha sido registrada.",
    guestbook: "Libro de visitas",
    signGuestbook: "Deja una nota",
    scanToOpen: "Escanea para abrir",
    madeWith: "Hecho con Invitra",
  },
  tr: {
    ...en,
    openInvitation: "Davetiyeyi aç",
    tapToOpen: "Açmak için mühre dokunun",
    countdownTo: "Güne kalan süre",
    days: "Gün",
    hours: "Saat",
    minutes: "Dakika",
    seconds: "Saniye",
    theDay: "Bugün o gün",
    schedule: "Program",
    when: "Ne zaman",
    where: "Nerede",
    directions: "Yol tarifi",
    addToCalendar: "Takvime ekle",
    dressCode: "Kıyafet",
    gallery: "Galeri",
    ourStory: "Hikâyemiz",
    family: "Aile",
    gifts: "Hediyeler",
    travel: "Ulaşım & Konaklama",
    transportation: "Ulaşım",
    accommodation: "Konaklama",
    faqs: "Sorular",
    rsvp: "Katılım bildirimi",
    attending: "Seve seve katılıyorum",
    notAttending: "Maalesef katılamıyorum",
    maybe: "Henüz emin değilim",
    yourName: "Adınız",
    yourEmail: "E-posta",
    guestCount: "Kaç kişisiniz?",
    mealPreference: "Yemek tercihi",
    aMessage: "Mesaj (isteğe bağlı)",
    sendRsvp: "Gönder",
    rsvpThanks: "Teşekkürler — yanıtınız kaydedildi.",
    guestbook: "Anı defteri",
    signGuestbook: "Bir not bırakın",
    scanToOpen: "Açmak için tarayın",
    madeWith: "Invitra ile hazırlandı",
  },
  id: {
    ...en,
    openInvitation: "Buka undangan",
    tapToOpen: "Ketuk segel untuk membuka",
    countdownTo: "Hitung mundur",
    days: "Hari",
    hours: "Jam",
    minutes: "Menit",
    seconds: "Detik",
    theDay: "Hari ini harinya",
    schedule: "Rangkaian Acara",
    when: "Waktu",
    where: "Tempat",
    directions: "Petunjuk arah",
    addToCalendar: "Tambah ke kalender",
    dressCode: "Dress code",
    gallery: "Galeri",
    ourStory: "Kisah Kami",
    family: "Keluarga",
    gifts: "Hadiah",
    travel: "Perjalanan & Menginap",
    transportation: "Transportasi",
    accommodation: "Penginapan",
    faqs: "Pertanyaan",
    rsvp: "Konfirmasi kehadiran",
    attending: "Dengan senang hati hadir",
    notAttending: "Mohon maaf berhalangan",
    maybe: "Belum pasti",
    yourName: "Nama Anda",
    yourEmail: "Email",
    guestCount: "Berapa orang?",
    mealPreference: "Preferensi hidangan",
    aMessage: "Pesan (opsional)",
    sendRsvp: "Kirim",
    rsvpThanks: "Terima kasih — jawaban Anda telah tercatat.",
    guestbook: "Buku Tamu",
    signGuestbook: "Tinggalkan pesan",
    scanToOpen: "Pindai untuk membuka",
    madeWith: "Dibuat dengan Invitra",
  },
};

export function t(lang: LangCode): Dict {
  return dicts[lang] ?? en;
}

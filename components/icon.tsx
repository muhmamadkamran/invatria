import {
  Gem, Diamond, Cake, HeartHandshake, Baby, Flower2, GraduationCap,
  Building2, MoonStar, Sparkles, Heart, Hand, UtensilsCrossed, PartyPopper,
  House, PlaneTakeoff, School, Briefcase,
  Infinity as InfinityIcon, Users, Share2, ClipboardCheck, Timer, MapPin,
  Images, Music4, Upload, Video, QrCode, Link2, Languages, Moon,
  MessageCircle, Wand2, Eye, ImageDown, FileDown, Smartphone, Search, Zap,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  gem: Gem,
  diamond: Diamond,
  cake: Cake,
  "heart-handshake": HeartHandshake,
  baby: Baby,
  flower: Flower2,
  "graduation-cap": GraduationCap,
  building: Building2,
  "moon-star": MoonStar,
  sparkles: Sparkles,
  heart: Heart,
  hand: Hand,
  utensils: UtensilsCrossed,
  "party-popper": PartyPopper,
  house: House,
  plane: PlaneTakeoff,
  school: School,
  briefcase: Briefcase,

  infinity: InfinityIcon,
  users: Users,
  share: Share2,
  "clipboard-check": ClipboardCheck,
  timer: Timer,
  "map-pin": MapPin,
  images: Images,
  music: Music4,
  upload: Upload,
  video: Video,
  "qr-code": QrCode,
  link: Link2,
  languages: Languages,
  moon: Moon,
  "message-circle": MessageCircle,
  wand: Wand2,
  eye: Eye,
  "image-down": ImageDown,
  "file-down": FileDown,
  smartphone: Smartphone,
  search: Search,
  zap: Zap,
};

export function Icon({
  name,
  className,
  strokeWidth = 1.25,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = ICONS[name] ?? Sparkles;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden />;
}

import { newId } from "@/shared/lib/id";
import type {
  PageDesign,
  Section,
} from "@/features/builder/state/types";
import { explodeSection, isExplodable } from "@/features/builder/explode";
import type { ProjectTemplateType } from "@/features/projects/types";

import { createHeader } from "./Header/defaults";
import { createHero } from "./Hero/defaults";
import { createFeatures } from "./Features/defaults";
import { createCTA } from "./CTA/defaults";
import { createFooter } from "./Footer/defaults";
import { createGallery } from "./Gallery/defaults";
import { createTestimonials } from "./Testimonials/defaults";
import { createContact } from "./Contact/defaults";
import { createBooking } from "./Booking/defaults";
import { createMenu } from "./Menu/defaults";
import { createPortfolio } from "./Portfolio/defaults";

/**
 * Auto-explode every preset section as we seed the starter — the user
 * lands directly in a fully-editable free-canvas layout where every
 * heading / paragraph / button / image / card background is its own
 * draggable primitive, instead of frozen inside a preset's responsive
 * frame. Non-explodable types (Gallery, Booking, Menu, etc.) pass
 * through untouched.
 */
const wrap = (sections: Section[]): PageDesign => ({
  version: 1,
  sections: sections.map((s) =>
    isExplodable(s) ? (explodeSection(s) ?? s) : s,
  ),
});

// =============================================================================
// Helpers — typed mutators so TS narrows on `section.type`.
// =============================================================================

function header(setup: (props: Extract<Section, { type: "header" }>["props"]) => void): Section {
  const s = createHeader();
  if (s.type === "header") setup(s.props);
  return s;
}
function hero(setup: (props: Extract<Section, { type: "hero" }>["props"]) => void): Section {
  const s = createHero();
  if (s.type === "hero") setup(s.props);
  return s;
}
function features(setup: (props: Extract<Section, { type: "features" }>["props"]) => void): Section {
  const s = createFeatures();
  if (s.type === "features") setup(s.props);
  return s;
}
function cta(setup: (props: Extract<Section, { type: "cta" }>["props"]) => void): Section {
  const s = createCTA();
  if (s.type === "cta") setup(s.props);
  return s;
}
function footer(setup: (props: Extract<Section, { type: "footer" }>["props"]) => void): Section {
  const s = createFooter();
  if (s.type === "footer") setup(s.props);
  return s;
}
function gallery(setup: (props: Extract<Section, { type: "gallery" }>["props"]) => void): Section {
  const s = createGallery();
  if (s.type === "gallery") setup(s.props);
  return s;
}
function testimonials(setup: (props: Extract<Section, { type: "testimonials" }>["props"]) => void): Section {
  const s = createTestimonials();
  if (s.type === "testimonials") setup(s.props);
  return s;
}
function contact(setup: (props: Extract<Section, { type: "contact" }>["props"]) => void): Section {
  const s = createContact();
  if (s.type === "contact") setup(s.props);
  return s;
}
function booking(setup: (props: Extract<Section, { type: "booking" }>["props"]) => void): Section {
  const s = createBooking();
  if (s.type === "booking") setup(s.props);
  return s;
}
function menu(setup: (props: Extract<Section, { type: "menu" }>["props"]) => void): Section {
  const s = createMenu();
  if (s.type === "menu") setup(s.props);
  return s;
}
function portfolio(setup: (props: Extract<Section, { type: "portfolio" }>["props"]) => void): Section {
  const s = createPortfolio();
  if (s.type === "portfolio") setup(s.props);
  return s;
}

// =============================================================================
// Barber shop
// =============================================================================
function barberStarter(): PageDesign {
  return wrap([
    header((p) => {
      p.brand = { label: "صالون الحلاقة", href: "/" };
      p.links = [
        { label: "الرئيسية", href: "#" },
        { label: "خدماتنا", href: "#services" },
        { label: "احجز", href: "#booking" },
        { label: "تواصل", href: "#contact" },
      ];
      p.ctaButton = { label: "احجز موعدك", href: "#booking", show: true };
    }),
    hero((p) => {
      p.eyebrow = "صالون الحلاقة";
      p.title = "احجز موعدك مع أفضل الحلاقين";
      p.subtitle =
        "خدمات الحلاقة الكلاسيكية والعصرية بأيدي محترفين. ادخل بدون انتظار — احجز موعدك في ثوانٍ.";
      p.imageUrl =
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80";
      p.primaryButton = { label: "احجز الآن", href: "#booking", show: true };
      p.secondaryButton = {
        label: "شاهد الخدمات",
        href: "#services",
        show: true,
      };
      p.layout = "image-right";
      p.alignment = "left";
    }),
    features((p) => {
      p.eyebrow = "خدماتنا";
      p.title = "كل ما يحتاجه الرجل في مكان واحد";
      p.subtitle =
        "حلاقة، تشذيب، تصفيف، عناية باللحية، ومنتجات طبيعية مختارة.";
      p.columns = 3;
      p.items = [
        {
          id: newId(),
          icon: "Scissors",
          title: "حلاقة كلاسيكية",
          description: "أساليب تقليدية بدقة عالية ولمسة عصرية.",
        },
        {
          id: newId(),
          icon: "Sparkles",
          title: "تشذيب اللحية",
          description: "عناية وتشذيب باستخدام أحدث الأدوات والمستحضرات.",
        },
        {
          id: newId(),
          icon: "Wand2",
          title: "تصفيف الشعر",
          description: "تصفيف لكل المناسبات — من اليومي إلى المناسبات.",
        },
        {
          id: newId(),
          icon: "Droplets",
          title: "غسيل وتدليك",
          description: "غسيل الشعر مع تدليك مريح لفروة الرأس.",
        },
        {
          id: newId(),
          icon: "Flame",
          title: "تشميع وإزالة شعر",
          description: "إزالة شعر الوجه باحترافية وبدون ألم.",
        },
        {
          id: newId(),
          icon: "Crown",
          title: "باقات VIP",
          description: "تجربة كاملة لمن يبحث عن الأفضل.",
        },
      ];
    }),
    testimonials((p) => {
      p.title = "آراء عملائنا";
      p.subtitle = "أكثر من 1200 زائر سعيد في آخر 6 أشهر.";
      p.columns = 3;
      p.items = [
        {
          id: newId(),
          name: "خالد الزهراني",
          role: "عميل دائم",
          quote: "أفضل حلاق جربته. السعر معقول والخدمة ممتازة.",
          rating: 5,
        },
        {
          id: newId(),
          name: "عبدالله الحربي",
          role: "زبون VIP",
          quote: "النظافة والاحترافية في أعلى مستوى. أنصح بقوة.",
          rating: 5,
        },
        {
          id: newId(),
          name: "ماجد القحطاني",
          role: "أول زيارة",
          quote: "تجربة رائعة من أول مرة. سأعود بالتأكيد.",
          rating: 4,
        },
      ];
    }),
    booking((p) => {
      p.title = "احجز موعدك الآن";
      p.subtitle = "اختر الموظف والوقت المناسب — رد تأكيد فوري.";
      p.buttonLabel = "تأكيد الحجز";
      p.staff = [
        { id: newId(), name: "أحمد" },
        { id: newId(), name: "خالد" },
        { id: newId(), name: "سالم" },
      ];
    }),
    contact((p) => {
      p.title = "وين تلقانا";
      p.subtitle = "نشتغل من الساعة 10 صباحًا حتى منتصف الليل.";
      p.email = "salon@example.com";
      p.phone = "+966 50 000 0000";
      p.address = "الرياض — حي العليا";
    }),
    footer((p) => {
      p.brand.text = "صالون الحلاقة";
      p.brand.tagline = "حلاقة احترافية منذ 2019.";
      p.copyright = "© 2026 صالون الحلاقة — جميع الحقوق محفوظة.";
    }),
  ]);
}

// =============================================================================
// Coffee shop
// =============================================================================
function coffeeStarter(): PageDesign {
  return wrap([
    header((p) => {
      p.brand = { label: "مقهى الأحلام", href: "/" };
      p.links = [
        { label: "الرئيسية", href: "#" },
        { label: "القائمة", href: "#menu" },
        { label: "صور", href: "#gallery" },
        { label: "تواصل", href: "#contact" },
      ];
      p.ctaButton = { label: "اطلب الآن", href: "#menu", show: true };
    }),
    hero((p) => {
      p.eyebrow = "مقهى الأحلام";
      p.title = "قهوة طازجة، أجواء دافئة";
      p.subtitle =
        "حبوب محمصة محليًا، حليب طازج، ووصفات نعتز فيها. تعال جربها أو اطلبها للبيت.";
      p.imageUrl =
        "https://images.unsplash.com/photo-1442975631115-c4f7b05b8a2c?w=1200&q=80";
      p.primaryButton = { label: "شاهد القائمة", href: "#menu", show: true };
      p.secondaryButton = {
        label: "اطلب توصيل",
        href: "#contact",
        show: true,
      };
      p.layout = "image-right";
      p.alignment = "left";
    }),
    menu((p) => {
      p.title = "قائمتنا";
      p.subtitle = "أصناف مختارة محمصة طازجة كل أسبوع.";
      p.currency = "ر.س";
      p.columns = 2;
      p.items = [
        {
          id: newId(),
          name: "إسبريسو مزدوج",
          description: "جرعتان من أفضل حبوبنا الإثيوبية.",
          price: "14",
          imageUrl:
            "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&q=80",
        },
        {
          id: newId(),
          name: "لاتيه فانيلا",
          description: "حليب مخفوق مع رشّة فانيلا طبيعية.",
          price: "22",
          imageUrl:
            "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80",
        },
        {
          id: newId(),
          name: "كابتشينو كلاسيك",
          description: "إسبريسو + حليب مخفوق + رغوة عالية.",
          price: "20",
          imageUrl:
            "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&q=80",
        },
        {
          id: newId(),
          name: "موكا بالشوكولاتة",
          description: "إسبريسو + شوكولاتة بلجيكية + حليب.",
          price: "24",
          imageUrl:
            "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&q=80",
        },
        {
          id: newId(),
          name: "كرواسون بالزبدة",
          description: "مخبوز يوميًا، ذهبي ومقرمش.",
          price: "12",
          imageUrl:
            "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80",
        },
        {
          id: newId(),
          name: "كيك الجزر",
          description: "مع كريمة الجبن الخفيفة.",
          price: "18",
          imageUrl:
            "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80",
        },
      ];
    }),
    gallery((p) => {
      p.title = "أجواؤنا";
      p.subtitle = "لمحة من داخل المقهى.";
      p.columns = 3;
      p.items = [
        {
          id: newId(),
          url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
          alt: "داخل المقهى",
        },
        {
          id: newId(),
          url: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80",
          alt: "ركن القراءة",
        },
        {
          id: newId(),
          url: "https://images.unsplash.com/photo-1525629870786-7c1f86df74de?w=800&q=80",
          alt: "تحضير القهوة",
        },
        {
          id: newId(),
          url: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800&q=80",
          alt: "حبوب طازجة",
        },
        {
          id: newId(),
          url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80",
          alt: "كابتشينو",
        },
        {
          id: newId(),
          url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
          alt: "لاتيه آرت",
        },
      ];
    }),
    cta((p) => {
      p.title = "اطلبها وأنت في بيتك";
      p.description = "توصيل سريع لكل أحياء الرياض خلال 30 دقيقة.";
      p.button = { label: "اطلب الآن", href: "#contact" };
      p.style = "gradient";
    }),
    contact((p) => {
      p.title = "زورنا";
      p.subtitle = "مفتوحين من 7 صباحًا حتى منتصف الليل.";
      p.email = "hello@cafe.example";
      p.phone = "+966 50 000 0000";
      p.address = "الرياض — حي الياسمين";
    }),
    footer((p) => {
      p.brand.text = "مقهى الأحلام";
      p.brand.tagline = "قهوة طازجة، كل يوم.";
      p.copyright = "© 2026 مقهى الأحلام — جميع الحقوق محفوظة.";
    }),
  ]);
}

// =============================================================================
// Photography portfolio
// =============================================================================
function photographyStarter(): PageDesign {
  return wrap([
    header((p) => {
      p.brand = { label: "عدسة الإبداع", href: "/" };
      p.links = [
        { label: "الرئيسية", href: "#" },
        { label: "أعمالي", href: "#portfolio" },
        { label: "الباقات", href: "#packages" },
        { label: "تواصل", href: "#contact" },
      ];
      p.ctaButton = { label: "احجز جلسة", href: "#contact", show: true };
    }),
    hero((p) => {
      p.eyebrow = "عدسة الإبداع";
      p.title = "نلتقط اللحظات اللي تستاهل تتذكر";
      p.subtitle =
        "تصوير أفراح، عائلي، تجاري، وبورتريه. أسلوب طبيعي بإضاءة مدروسة.";
      p.imageUrl =
        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&q=80";
      p.primaryButton = { label: "احجز جلستك", href: "#contact", show: true };
      p.secondaryButton = {
        label: "شاهد أعمالي",
        href: "#portfolio",
        show: true,
      };
      p.layout = "image-bg";
      p.alignment = "center";
    }),
    portfolio((p) => {
      p.title = "آخر أعمالي";
      p.subtitle = "مجموعة مختارة من جلسات السنة الأخيرة.";
      p.columns = 3;
      const photos: Array<{ imageUrl: string; title: string; category: string }> = [
        {
          imageUrl:
            "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
          title: "عرس بحري",
          category: "أفراح",
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80",
          title: "خطوبة الرياض",
          category: "أفراح",
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
          title: "ذكريات العائلة",
          category: "عائلي",
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=800&q=80",
          title: "بورتريه",
          category: "بورتريه",
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1496440737103-cd596325d314?w=800&q=80",
          title: "علامة تجارية",
          category: "تجاري",
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
          title: "تخرج 2026",
          category: "مناسبات",
        },
      ];
      p.items = photos.map((it) => ({ id: newId(), ...it }));
    }),
    features((p) => {
      p.eyebrow = "الباقات";
      p.title = "اختر الباقة اللي تناسبك";
      p.subtitle = "كل باقة قابلة للتعديل حسب احتياجك.";
      p.columns = 3;
      p.items = [
        {
          id: newId(),
          icon: "Camera",
          title: "الأساسية",
          description: "ساعة تصوير + 30 صورة معدّلة.",
        },
        {
          id: newId(),
          icon: "Sparkles",
          title: "المميزة",
          description: "3 ساعات + 80 صورة + فيديو قصير.",
        },
        {
          id: newId(),
          icon: "Crown",
          title: "كاملة",
          description: "يوم كامل + ألبوم مطبوع + 200 صورة.",
        },
      ];
    }),
    testimonials((p) => {
      p.title = "آراء عملائي";
      p.subtitle = "كل صورة قصة، وكل عميل صار صديق.";
      p.columns = 2;
      p.items = [
        {
          id: newId(),
          name: "ريم القحطاني",
          role: "عروس 2025",
          quote: "صور أعراسي صارت تحفة. ذوقه عالي وتعامله راقي.",
          rating: 5,
        },
        {
          id: newId(),
          name: "سارة الدوسري",
          role: "أمّ لأربعة",
          quote: "جلسة عائلية عفوية، أطفالي ارتاحوا والصور خرجت طبيعية.",
          rating: 5,
        },
      ];
    }),
    contact((p) => {
      p.title = "احجز جلستك";
      p.subtitle = "أرسل لي تفاصيل المناسبة وأرد عليك خلال ساعات.";
      p.email = "hello@photo.example";
      p.phone = "+966 50 000 0000";
      p.address = "الرياض — استديو الورود";
    }),
    footer((p) => {
      p.brand.text = "عدسة الإبداع";
      p.brand.tagline = "نوثق لحظاتك الخالدة.";
      p.copyright = "© 2026 عدسة الإبداع — جميع الحقوق محفوظة.";
    }),
  ]);
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Returns a fully-populated PageDesign for the given template, or an empty
 * design when no template was picked (the "scratch" path).
 */
export function starterDesignFor(
  template: ProjectTemplateType | undefined,
): PageDesign {
  switch (template) {
    case "barber":
      return barberStarter();
    case "coffee":
      return coffeeStarter();
    case "photography":
      return photographyStarter();
    default:
      return { version: 1, sections: [] };
  }
}

// Rekaz-themed demo design.
//
// The demo page (`/demo`) renders a faithful sketch of rekaz.io — booking
// platform for SMBs in KSA — using the SAME section presets the builder
// publishes to /preview and /sites. The point is to show prospective users
// the polished output: "this is what your published site can look like."
//
// We intentionally do NOT auto-explode here. Inside the builder, sections
// get exploded so users can drag every piece around; on a published site
// the polished preset rendering is what visitors actually see. The demo
// mirrors the published path, not the builder path.

import { newId } from "@/shared/lib/id";
import type { PageDesign, Section } from "@/features/builder/state/types";

export function rekazDemoDesign(): PageDesign {
  const sections: Section[] = [
      // ──────────────────────────────────────────────────────────── Header
      {
        id: newId(),
        type: "header",
        props: {
          brand: { label: "ركاز", href: "#" },
          links: [
            { label: "الميزات", href: "#features" },
            { label: "القطاعات", href: "#industries" },
            { label: "الأسعار", href: "#pricing" },
            { label: "عملاؤنا", href: "#testimonials" },
            { label: "اتصل بنا", href: "#contact" },
          ],
          ctaButton: { label: "ابدأ مجاناً", href: "/templates", show: true },
        },
      },

      // ────────────────────────────────────────────────────────────── Hero
      {
        id: newId(),
        type: "hero",
        props: {
          eyebrow: "منصة الحجوزات الأولى في المملكة",
          title: "حجوزات أكثر، بدون قروشة.",
          subtitle:
            "أتمت حجوزاتك، استقبل المدفوعات، وأرسل تذكيرات الواتساب — كل ذلك من لوحة واحدة سهلة الاستخدام. أكثر من 10,000 مشروع يثقون بنا.",
          imageUrl:
            "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1400&q=80",
          primaryButton: { label: "ابدأ تجربتك المجانية", href: "/templates", show: true },
          secondaryButton: { label: "احجز عرضاً تفصيلياً", href: "#contact", show: true },
          layout: "image-right",
          alignment: "left",
        },
      },

      // ────────────────────────────────────────────────────────── Features
      {
        id: newId(),
        type: "features",
        props: {
          eyebrow: "كل ما تحتاجه",
          title: "أدوات قوية لإدارة مشروعك بالكامل",
          subtitle:
            "من الحجز الأول إلى المتابعة بعد البيع، ركاز يجمع كل العمليات في مكان واحد.",
          columns: 3,
          items: [
            {
              id: newId(),
              icon: "Calendar",
              title: "حجوزات أونلاين",
              description:
                "موقع حجز جاهز خلال دقائق، يعمل على الجوال والحاسوب، بدون أي خبرة تقنية.",
            },
            {
              id: newId(),
              icon: "MessageCircle",
              title: "ربط واتساب",
              description:
                "تذكيرات تلقائية، تأكيدات الحجز، ورسائل المتابعة — كلها عبر واتساب الأعمال.",
            },
            {
              id: newId(),
              icon: "CreditCard",
              title: "مدفوعات رقمية",
              description:
                "اقبل الدفع نقداً، بالبطاقة، أو بالتقسيط. عمولات منخفضة وتسوية يومية.",
            },
            {
              id: newId(),
              icon: "Users",
              title: "تطبيق الموظفين",
              description:
                "كل موظف يرى حجوزاته فقط، مع كاشير مدمج وعرض ساعات العمل.",
            },
            {
              id: newId(),
              icon: "BarChart",
              title: "تقارير ذكية",
              description:
                "تابع الإيرادات، عدد الحجوزات، وأداء كل موظف لحظياً — قرارات أسرع وأذكى.",
            },
            {
              id: newId(),
              icon: "Shield",
              title: "بيانات محمية",
              description:
                "بيانات عملائك مشفّرة ومستضافة داخل المملكة، متوافقة مع متطلبات هيئة الاتصالات.",
            },
          ],
        },
      },

      // ──────────────────────────────────────────── Industries (Portfolio)
      {
        id: newId(),
        type: "portfolio",
        props: {
          title: "ركاز يناسب جميع القطاعات",
          subtitle:
            "أكثر من 12 قطاعاً يستخدمون ركاز يومياً لإدارة أعمالهم.",
          columns: 4,
          items: [
            {
              id: newId(),
              title: "النوادي الرياضية",
              category: "+1,200 ناد",
              imageUrl:
                "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
            },
            {
              id: newId(),
              title: "الصالونات",
              category: "+2,500 صالون",
              imageUrl:
                "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80",
            },
            {
              id: newId(),
              title: "العيادات",
              category: "+900 عيادة",
              imageUrl:
                "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
            },
            {
              id: newId(),
              title: "مغاسل السيارات",
              category: "+650 مغسلة",
              imageUrl:
                "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&q=80",
            },
            {
              id: newId(),
              title: "الاستوديوهات",
              category: "+400 استوديو",
              imageUrl:
                "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80",
            },
            {
              id: newId(),
              title: "المنتجعات",
              category: "+300 منتجع",
              imageUrl:
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
            },
            {
              id: newId(),
              title: "الحضانات",
              category: "+220 حضانة",
              imageUrl:
                "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
            },
            {
              id: newId(),
              title: "الاستشاريون",
              category: "+1,000 مستشار",
              imageUrl:
                "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
            },
          ],
        },
      },

      // ─────────────────────────────────────────────────────── Pricing
      {
        id: newId(),
        type: "pricing",
        props: {
          eyebrow: "خطط مرنة",
          title: "اختر الخطة التي تناسب حجم مشروعك",
          subtitle:
            "ابدأ مجاناً، وارتقِ كلما نما عملك. لا عقود طويلة الأمد، ولا رسوم خفية.",
          plans: [
            {
              id: newId(),
              name: "البداية",
              price: "0 ريال",
              cadence: "/ شهرياً",
              features: [
                "حتى 50 حجز شهرياً",
                "موقع حجز كامل",
                "تذكيرات واتساب",
                "حساب موظف واحد",
              ],
              cta: "ابدأ مجاناً",
              highlighted: false,
            },
            {
              id: newId(),
              name: "النمو",
              price: "199 ريال",
              cadence: "/ شهرياً",
              features: [
                "حجوزات غير محدودة",
                "حتى 5 موظفين",
                "مدفوعات رقمية + تقسيط",
                "تقارير متقدمة",
                "دعم فني مخصص",
              ],
              cta: "جرّب 14 يوماً مجاناً",
              highlighted: true,
            },
            {
              id: newId(),
              name: "الأعمال",
              price: "499 ريال",
              cadence: "/ شهرياً",
              features: [
                "كل مميزات النمو",
                "موظفين غير محدودين",
                "متعدد الفروع",
                "API للتكاملات",
                "مدير حساب مخصص",
              ],
              cta: "تواصل معنا",
              highlighted: false,
            },
          ],
        },
      },

      // ─────────────────────────────────────────────────── Testimonials
      {
        id: newId(),
        type: "testimonials",
        props: {
          title: "آراء عملائنا",
          subtitle: "تقييم 4.9 من 5 من أكثر من 800 ألف اشتراك مُدار عبر ركاز.",
          columns: 3,
          items: [
            {
              id: newId(),
              name: "عبدالعزيز الشمري",
              role: "صاحب نادي رياضي",
              quote:
                "وفّر علي ركاز ساعات يومياً من تنظيم الجدول. الإيرادات ارتفعت 34% خلال 3 شهور فقط.",
              rating: 5,
            },
            {
              id: newId(),
              name: "ريم القحطاني",
              role: "مديرة صالون",
              quote:
                "العميلات يحجزن بدون اتصال، والتذكيرات تخلّص مشكلة الغياب. تجربة رهيبة.",
              rating: 5,
            },
            {
              id: newId(),
              name: "د. ماجد الزهراني",
              role: "طبيب أسنان",
              quote:
                "تطبيق الموظفين بسّط عمل العيادة كلها. كل واحد يشوف حجوزاته فقط، نظام احترافي.",
              rating: 5,
            },
          ],
        },
      },

      // ─────────────────────────────────────────────────────────────── CTA
      {
        id: newId(),
        type: "cta",
        props: {
          title: "جاهز تبدأ تستقبل حجوزاتك أونلاين؟",
          description:
            "ركّب موقع الحجز خلال 5 دقائق. بدون بطاقة ائتمان، بدون التزام، إلغاء في أي وقت.",
          button: { label: "أنشئ حسابي الآن", href: "/templates" },
          style: "gradient",
        },
      },

      // ─────────────────────────────────────────────────────────── Contact
      {
        id: newId(),
        type: "contact",
        props: {
          title: "تواصل معنا",
          subtitle: "فريقنا يجيب خلال أقل من ساعة في أيام العمل.",
          email: "hello@rekaz.io",
          phone: "+966 11 234 5678",
          address: "الرياض، المملكة العربية السعودية",
        },
      },

      // ──────────────────────────────────────────────────────────── Footer
      {
        id: newId(),
        type: "footer",
        props: {
          brand: {
            text: "ركاز",
            tagline: "منصة الحجوزات والاشتراكات للأعمال الناشئة",
          },
          columns: [
            {
              id: newId(),
              title: "المنتج",
              links: [
                { label: "الميزات", href: "#features" },
                { label: "الأسعار", href: "#pricing" },
                { label: "تطبيق الموظفين", href: "#" },
                { label: "API", href: "#" },
              ],
            },
            {
              id: newId(),
              title: "القطاعات",
              links: [
                { label: "النوادي الرياضية", href: "#" },
                { label: "الصالونات", href: "#" },
                { label: "العيادات", href: "#" },
                { label: "الاستوديوهات", href: "#" },
              ],
            },
            {
              id: newId(),
              title: "الشركة",
              links: [
                { label: "من نحن", href: "#" },
                { label: "الوظائف", href: "#" },
                { label: "المدونة", href: "#" },
                { label: "اتصل بنا", href: "#contact" },
              ],
            },
          ],
          socials: [
            { id: newId(), platform: "twitter", href: "https://twitter.com/rekaz" },
            { id: newId(), platform: "instagram", href: "https://instagram.com/rekaz" },
            { id: newId(), platform: "linkedin", href: "https://linkedin.com/company/rekaz" },
            { id: newId(), platform: "whatsapp", href: "https://wa.me/966112345678" },
          ],
          copyright: "© 2025 ركاز. جميع الحقوق محفوظة.",
        },
      },
  ];

  return { version: 1, sections };
}

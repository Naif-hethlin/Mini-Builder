import { ComingSoon } from "@/features/dashboard/ComingSoon";

export const metadata = { title: "نظرة عامة — ركاز" };

export default function DashboardOverviewPage() {
  return (
    <ComingSoon
      title="نظرة عامة"
      description="بطاقات إحصائيات سريعة (الزيارات، الحجوزات، حالة الموقع) تصل في المرحلة القادمة."
    />
  );
}

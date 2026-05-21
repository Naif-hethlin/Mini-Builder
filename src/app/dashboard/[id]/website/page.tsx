import { ComingSoon } from "@/features/dashboard/ComingSoon";

export const metadata = { title: "الموقع — ركاز" };

export default function DashboardWebsitePage() {
  return (
    <ComingSoon
      title="إدارة الموقع"
      description="تحرير الموقع، فتح المعاينة، وإجراء النشر — كلها مجمعة هنا."
    />
  );
}

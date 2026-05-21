// Mock data used by every dashboard sub-page. Realistic-enough values so the
// dashboard feels populated for the interview demo. No real analytics.

export const MOCK_ANALYTICS = {
  visits: {
    total: 1240,
    deltaPercent: 18,
    spark: [20, 32, 28, 45, 41, 60, 75, 70, 84, 92, 86, 105],
  },
  pageViews: 3458,
  conversionRate: 4.2, // percent
};

export type MockCustomer = {
  id: string;
  name: string;
  email: string;
  firstVisit: string;
  status: "نشط" | "غير نشط";
};

export const MOCK_CUSTOMERS: MockCustomer[] = [
  {
    id: "c-1",
    name: "نورة العمري",
    email: "noura@example.com",
    firstVisit: "2026-04-12",
    status: "نشط",
  },
  {
    id: "c-2",
    name: "خالد الزهراني",
    email: "khalid@example.com",
    firstVisit: "2026-04-18",
    status: "نشط",
  },
  {
    id: "c-3",
    name: "ريم القحطاني",
    email: "reem@example.com",
    firstVisit: "2026-04-22",
    status: "غير نشط",
  },
  {
    id: "c-4",
    name: "محمد الشمري",
    email: "mohammed@example.com",
    firstVisit: "2026-05-01",
    status: "نشط",
  },
  {
    id: "c-5",
    name: "سارة الدوسري",
    email: "sarah@example.com",
    firstVisit: "2026-05-05",
    status: "نشط",
  },
  {
    id: "c-6",
    name: "عبدالله الحربي",
    email: "abdullah@example.com",
    firstVisit: "2026-05-10",
    status: "غير نشط",
  },
];

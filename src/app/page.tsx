// Landing route: /
//
// Server component shell that mounts the interactive landing client.

import { AnimatedLanding } from "./_front/AnimatedLanding";

export const metadata = {
  title: "ركاز — منصة إنشاء مواقع الأعمال",
  description:
    "قوالب جاهزة، تخصيص مرن، وأدوات مبسطة لإدارة مشروعك — كل ذلك في منصة واحدة.",
};

export default function LandingPage() {
  return <AnimatedLanding />;
}

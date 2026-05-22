// /login is gone — the auth modal lives on /templates now. Anyone hitting
// the old URL gets bounced there with a `?auth=open` hint that prompts the
// overlay to surface even if the user previously skipped it.

import { redirect } from "next/navigation";

export default function LoginRedirectPage() {
  redirect("/templates?auth=open");
}

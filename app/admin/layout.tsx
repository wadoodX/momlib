import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/guards";

// Guards every /admin/* route at the layout level so admin chrome never renders
// for non-admins, regardless of whether a given page happens to call an
// admin-gated query first. requireAdmin() is React cache()-deduped, so pages that
// also call it (e.g. via getAdminTree) incur no extra getUser/profile read.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

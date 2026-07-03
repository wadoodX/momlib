import { requireUser } from "@/lib/auth/guards";
import { PageShell } from "@/components/student/page-shell";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";

function greeting(name: string) {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${part}, ${name}`;
}

export default async function DashboardPage() {
  const { user, profile } = await requireUser();
  const role = profile?.role ?? "student";
  const isAdmin = role === "admin";

  const firstName = (profile?.full_name?.trim().split(/\s+/)[0] || user.email?.split("@")[0] || "there");

  return (
    <PageShell
      eyebrow={isAdmin ? "Mission Control" : "Student area"}
      title={isAdmin ? `As-salamu alaykum, ${firstName}` : greeting(firstName)}
      description={
        isAdmin
          ? "Here's your library at a glance — what needs you, and what's working."
          : "Pick up where you left off, or explore something new."
      }
      role={role}
    >
      {isAdmin ? <TeacherDashboard /> : <StudentDashboard />}
    </PageShell>
  );
}

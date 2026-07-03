import { getStudentDashboardData } from "@/lib/db/content";
import { ResumeHero } from "@/components/dashboard/resume-hero";
import { ProgressPanel } from "@/components/dashboard/progress-panel";
import { ActivityCard } from "@/components/dashboard/activity-card";
import { CoursesRow } from "@/components/dashboard/courses-row";
import { DiscoverPanel } from "@/components/dashboard/discover-panel";
import { RecentPanel } from "@/components/dashboard/recent-panel";

// The student home: a personal bento hub. A full-width resume hero on top, then
// a dense overview (progress + activity, your courses, discover + recent). One
// column on mobile; a 12-column bento at lg. All cells are fed by one query
// (getStudentDashboardData) and degrade to warm empty states for new students.
export async function StudentDashboard() {
  const data = await getStudentDashboardData();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-12">
        <ResumeHero resume={data.resume} startHere={data.startHere} />
      </div>

      <div className="lg:col-span-7">
        <ProgressPanel overall={data.progress.overall} subjects={data.progress.subjects} />
      </div>
      <div className="lg:col-span-5">
        <ActivityCard activity={data.activity} />
      </div>

      <div className="lg:col-span-12">
        <CoursesRow courses={data.courses} />
      </div>

      <div className="lg:col-span-6">
        <DiscoverPanel items={data.newlyAdded} />
      </div>
      <div className="lg:col-span-6">
        <RecentPanel recent={data.recent} startHere={data.startHere} hasActivity={data.hasActivity} />
      </div>
    </div>
  );
}

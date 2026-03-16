"use client";

import { useStudyPlan } from "@/hooks/useStudyPlan";
import { SectionContainer } from "./SectionContainer";

interface StudyPlanProps {
  plan: string;
}

function StudyPlan({ plan }: StudyPlanProps) {
  const { studyPlan, isPending, error } = useStudyPlan(plan);

  console.log("StudyPlan render", { studyPlan, isPending, error });

  return (
    <div className="flex flex-col w-full min-h-screen bg-background font-song">
      {studyPlan && (
        <div className="py-8 px-4 md:px-8 border-b mb-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">{studyPlan.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href={studyPlan.src} target="_blank" rel="noopener noreferrer" className="hover:text-primary underline decoration-primary/30">
                查看原文
              </a>
              <span>•</span>
              <span>最後更新: {new Date(studyPlan.last_update).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 pb-20">
        <div className="flex flex-col gap-8">
          {studyPlan?.children.map((section) => (
            <SectionContainer key={section.title} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudyPlan;

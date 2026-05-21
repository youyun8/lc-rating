import { getStudyPlanCourseMaterial } from "@/data/studyPlanCourseMaterials";
import { TutorialMarkdownPanel } from "./MarkdownPanel";

interface CourseMaterialsProps {
  plan: string;
}

export function CourseMaterials({ plan }: CourseMaterialsProps) {
  const material = getStudyPlanCourseMaterial(plan);

  if (!material) {
    return null;
  }

  return (
    <TutorialMarkdownPanel
      title="競程課程講義"
      description="整理常見 pattern：題目訊號、推導方式、不變式、C++ 模板與練習重點。"
      badge="Course notes"
      content={material}
    />
  );
}

"use client";

import { CodeEditorPage } from "@/components/blocks/code-editor-page";

export default function ViewCodeEditorAsTeacherPage({ params }) {
  const classId = parseInt(params.classId, 10);
  const ogrenciId = parseInt(params.ogrenciId, 10);

  if (isNaN(classId) || isNaN(ogrenciId)) {
    return <b>Hata</b>;
  }

  return <CodeEditorPage classId={classId} studentId={ogrenciId} />;
}

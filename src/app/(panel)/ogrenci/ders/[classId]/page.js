"use client";

import { CodeEditorPage } from "@/components/blocks/code-editor-page";

export default function ViewCodeEditorPage({ params }) {
  const classId = params.classId;
  return <CodeEditorPage classId={classId} studentId={undefined} />;
}

"use client";

import { Code, ListTodo, User } from "lucide-react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { AppBreadcrumb } from "@/components/app-breadcrumb";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { COMMENT_LINES, LANGUAGE_DETAILS } from "@/lib/constants";

export const CodeEditorPage = ({ classId, studentId }) => {
  const editorRef = useRef();
  const [classInfo, setClassInfo] = useState(null);
  const [studentTask, setStudentTask] = useState(null);
  const [currentCode, setCurrentCode] = useState("");
  const [lastCodeUpdate, setLastCodeUpdate] = useState(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let directories = [
    {
      name: `${studentId ? "Öğretmen" : "Öğrenci"}`,
      link: `${studentId ? "/ogretmen" : "/ogrenci"}`,
    },
    {
      name: "Derslerim",
      link: `${studentId ? "/ogretmen" : "/ogrenci"}`,
    },
    {
      name: classInfo ? classInfo.class_name : "Yükleniyor...",
      link: `${studentId ? "/ogretmen" : "/ogrenci"}/ders/${classId}`,
    },
  ];

  if (studentId) {
    directories = [
      ...directories,
      {
        name: studentTask ? studentTask.student_name : "Yükleniyor...",
      },
    ];
  }

  useEffect(() => {
    async function fetchClassStudentInfo() {
      try {
        const response = await fetch(
          `http://localhost:8000/class/${
            studentId ? `${classId}/${studentId}` : `${classId}`
          }`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setClassInfo(data.class_info);
        setStudentTask(data.student_task);
        setCurrentCode(data.student_task.code);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchClassStudentInfo();
  }, [classId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        !loading &&
        currentCode &&
        lastCodeUpdate &&
        Date.now() - lastCodeUpdate <= 8000
      ) {
        analyzeTask(currentCode, true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastCodeUpdate, currentCode]);

  useEffect(() => {
    if (studentId) {
      const socketKey = Cookies.get("socket_key");

      if (socketKey) {
        const socket = io("http://localhost:8000");

        socket.on("connect", () => {
          console.log("Connected to the Socket.IO server");
          socket.emit("join_room", { room_id: socketKey });
        });

        socket.on("code_update", (data) => {
          if (data.class_id === classId && data.student_id == studentId) {
            setCurrentCode(data.code);
          }
        });

        return () => {
          socket.disconnect();
        };
      }
    }
  }, []);

  useEffect(() => {
    window.onmessage = function (e) {
      const action = e.data.action;
      const codePrompt = e.data.files[0].content;

      if (action === "codeUpdate") {
        setCurrentCode(codePrompt);
        setLastCodeUpdate(Date.now());
        analyzeTask(codePrompt, false);
      } else if (action === "runStart" && !studentId) {
        analyzeTask(codePrompt, true);
        setLastCodeUpdate(Date.now() - 10000);
      }
    };
  }, []);

  async function analyzeTask(code, summarize) {
    try {
      const response = await fetch(
        `http://localhost:8000/task/${classId}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            code,
            summarize,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (isIframeLoaded && editorRef.current) {
      editorRef.current.contentWindow.postMessage(
        {
          eventType: "populateCode",
          language: classInfo.task_language,
          files: [
            {
              name: `main.${
                LANGUAGE_DETAILS[classInfo.task_language]["extension"]
              }`,
              content:
                studentTask.code ||
                `${
                  COMMENT_LINES[classInfo.task_language]
                } Buraya kod yazabilirsiniz.`,
            },
          ],
        },
        "*"
      );
    }
  }, [isIframeLoaded, studentTask, editorRef.current]);

  return (
    <>
      <AppBreadcrumb directories={directories} />

      {loading && <div className="loader" />}
      {error && <p>Hata: {error}</p>}
      {!loading && (
        <>
          <h1 className="text-3xl font-bold mb-1">{classInfo.class_name}</h1>
          <h2 className="text-chart-3 font-semibold mb-2">
            {classInfo.university_name}
          </h2>

          <p className="flex items-center">
            <User className="inline-block mr-2" />
            {`${studentId ? "Öğrenci:" : "Eğitmen:"}`}
            <span className="ml-1 font-semibold">
              {studentId && studentTask.student_name}
              {!studentId && classInfo.teacher_name}
            </span>
          </p>

          <p className="flex items-center">
            <ListTodo className="inline-block mr-2" />
            {classInfo.task_description && "Mevcut Görevlendirme:"}
            <span
              className={`${
                classInfo.task_description && "ml-1"
              } font-semibold`}
            >
              {classInfo.task_description || (
                <span className="text-red-600">
                  Henüz bir görev verilmemiş.
                </span>
              )}
            </span>
          </p>

          <p className="flex items-center mb-4">
            <Code className="inline-block mr-2" />
            {classInfo.task_language && "Programlama Dili:"}
            <span
              className={`${classInfo.task_language && "ml-1"} font-semibold`}
            >
              {LANGUAGE_DETAILS[classInfo.task_language]?.name || (
                <span className="text-red-600">
                  Programlama dili belirtilmemiş.
                </span>
              )}
            </span>
          </p>

          {studentId &&
            classInfo.task_description &&
            classInfo.task_language && (
              <CodeEditor
                value={
                  currentCode ||
                  `${
                    COMMENT_LINES[classInfo.task_language]
                  } Öğrenci henüz kod yazmamış.`
                }
                language={
                  LANGUAGE_DETAILS[classInfo.task_language]["extension"]
                }
                padding={15}
                disabled
                style={{
                  backgroundColor: "#FAFAFA",
                  fontFamily:
                    "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                }}
                className="rounded-xl shadow"
              />
            )}

          {!studentId &&
            classInfo.task_description &&
            classInfo.task_language && (
              <iframe
                frameBorder="0"
                src="https://onecompiler.com/embed/csharp/?hideLanguageSelection=true&hideNew=true&hideNewFileOption=true&disableAutoComplete=true&hideTitle=true&listenToEvents=true&codeChangeEvent=true"
                className="flex-1 rounded-lg border"
                ref={editorRef}
                onLoad={() => {
                  setIsIframeLoaded(true);
                }}
              ></iframe>
            )}

          {(!classInfo.task_description || !classInfo.task_language) && (
            <p className="text-red-600">
              {studentId
                ? "Bir görevlendirme atadığınızda öğrencinin kod editörü burada gözükecek."
                : "Bir görevlendirme atandığında kod editörünüz burada gözükecek."}
            </p>
          )}
        </>
      )}
    </>
  );
};

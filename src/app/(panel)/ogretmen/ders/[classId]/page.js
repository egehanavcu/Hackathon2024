"use client";

import {
  CirclePlus,
  Code,
  ListTodo,
  Pencil,
  RefreshCcw,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import StudentCard from "@/components/blocks/student-card";

import { useEffect, useState } from "react";
import Link from "next/link";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { LANGUAGE_DETAILS } from "@/lib/constants";

export default function ClassPage({ params }) {
  const [studentsData, setStudentsData] = useState([]);
  const [classDetails, setClassDetails] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(false);
  const classId = parseInt(params.classId, 10);

  const updateInviteCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/class/${classId}/update-invite-code`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Davet kodu güncellenemedi");
      }

      const data = await response.json();
      setClassDetails((prev) => ({
        ...prev,
        invite_code: data.new_invite_code,
      }));
    } catch (error) {
      console.error("Failed to update invite code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedStudents = [...studentsData].sort((a, b) => {
    return sortOrder === "asc"
      ? a.progress - b.progress
      : b.progress - a.progress;
  });

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/class/${classId}/teacher`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setClassDetails(data);

        const preparedStudentsData = data.students.map((student) => ({
          userId: student.id,
          name: student.student_name,
          summary: student.summary,
          progress: student.progress_percentage,
        }));
        setStudentsData(preparedStudentsData);
      } catch (error) {
        console.error("Failed to fetch class details:", error);
      }
    };

    fetchClassDetails();
  }, [classId]);

  useEffect(() => {
    const socketKey = Cookies.get("socket_key");

    if (socketKey) {
      const socket = io("http://localhost:8000");

      socket.on("connect", () => {
        console.log("Connected to the Socket.IO server");
        socket.emit("join_room", { room_id: socketKey });
      });

      socket.on("code_analyze", (data) => {
        if (classId === data.class_id) {
          setStudentsData((prevStudentsData) =>
            prevStudentsData.map((student) =>
              student.userId === data.student_id
                ? {
                    ...student,
                    summary: data.summary,
                    progress: data.completion_percentage,
                  }
                : student
            )
          );
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  if (isNaN(classId)) {
    return <b>Hata</b>;
  }

  return (
    <>
      <AppBreadcrumb
        directories={[
          { name: "Öğretmen", link: "/ogretmen" },
          { name: "Derslerim", link: "/ogretmen" },
          {
            name: classDetails ? classDetails.class_name : "Yükleniyor...",
            link: `/ogretmen/ders/${classId}`,
          },
        ]}
      />

      {classDetails ? (
        <>
          <h1 className="text-3xl font-bold">{classDetails.class_name}</h1>
          <div className="flex items-center gap-2 text-2xl mb-2">
            <div>
              <span>Davet Kodu: </span>
              <span className="font-bold text-chart-2">
                {classDetails.invite_code}
              </span>
            </div>
            <RefreshCcw
              className={`cursor-pointer ${isLoading ? "animate-spin" : ""}`}
              onClick={updateInviteCode}
            />
          </div>

          {classDetails.task_description && classDetails.task_language ? (
            <Link href={`/ogretmen/ders/${classId}/gorevlendir`}>
              <Button className="mb-2 self-start" size="lg">
                <Pencil /> Görevlendirmeyi Düzenle
              </Button>
            </Link>
          ) : (
            <Link href={`/ogretmen/ders/${classId}/gorevlendir`}>
              <Button className="mb-2 self-start" size="lg">
                <CirclePlus /> Görevlendirme Ekle
              </Button>
            </Link>
          )}

          <p className="flex items-center">
            <ListTodo className="inline-block mr-2" />
            {classDetails.task_description && "Mevcut Görevlendirme:"}
            <span
              className={`${
                classDetails.task_description && "ml-1"
              } font-semibold`}
            >
              {classDetails.task_description || (
                <span className="text-red-600">
                  Henüz bir görev vermemişsiniz.
                </span>
              )}
            </span>
          </p>
          <p className="flex items-center">
            <Code className="inline-block mr-2" />
            {classDetails.task_language && "Programlama Dili:"}
            <span
              className={`${
                classDetails.task_language && "ml-1"
              } font-semibold`}
            >
              {LANGUAGE_DETAILS[classDetails.task_language]?.name || (
                <span className="text-red-600">
                  Henüz bir programlama dili belirtmemişsiniz.
                </span>
              )}
            </span>
          </p>

          <p className="flex items-center mb-4">
            <Users className="inline-block mr-2" />
            <span className="mr-1 font-semibold">
              {classDetails.students.length}
            </span>{" "}
            Öğrenci
          </p>

          {sortedStudents.length === 0 ? (
            <p className="text-red-600">Sınıfta öğrenci bulunmamakta.</p>
          ) : (
            <>
              <Select onValueChange={setSortOrder}>
                <SelectTrigger className="w-[180px] mb-2">
                  <SelectValue placeholder="İlerlemeye göre sırala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sıralama Türü</SelectLabel>
                    <SelectItem value="asc">Azdan çoka</SelectItem>
                    <SelectItem value="desc">Çoktan aza</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <StudentCard students={sortedStudents} classId={classId} />
            </>
          )}
        </>
      ) : (
        <div className="loader"></div>
      )}
    </>
  );
}

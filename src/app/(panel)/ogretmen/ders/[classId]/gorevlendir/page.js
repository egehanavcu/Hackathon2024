"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_DOMAIN } from "@/lib/constants";

export default function ClassAssignTaskPage({ params }) {
  const classId = params.classId;
  const [classDetails, setClassDetails] = useState(null);
  const [assignmentName, setAssignmentName] = useState("");
  const [taskLanguage, setTaskLanguage] = useState("");

  const router = useRouter();

  const handleAssignTask = async () => {
    const response = await fetch(`${BACKEND_DOMAIN}/task/${classId}/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        task_description: assignmentName,
        task_language: taskLanguage,
      }),
    });

    if (response.ok) {
      router.push(`/ogretmen/ders/${classId}`);
    } else {
      console.error("Error");
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      const response = await fetch(
        `${BACKEND_DOMAIN}/class/${classId}/teacher`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();

        setClassDetails(data);
        setAssignmentName(data.task_description);
        setTaskLanguage(data.task_language);
      } else {
        console.error("Error");
      }
    };

    fetchDetails();
  }, []);

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
          { name: "Görevlendir", link: "/ogretmen/ders/gorevlendir" },
        ]}
      />

      <h1 className="text-3xl font-bold mb-2">Öğrencileri Görevlendir</h1>

      <p className="mb-4">
        Kendi girdiğiniz bir konu ile öğrencilerinize ödev atayabilir ve
        öğrencilerin yazmasını tercih ettiğiniz programlama dilini
        seçebilirsiniz.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Sınıf Görevlendir</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="name">Ödev</Label>
            <Input
              id="name"
              placeholder="Sınıfı kodunu yazmakla görevlendireceğiniz konu. Örneğin: Levenshtein Algoritması."
              value={assignmentName}
              onChange={(e) => setAssignmentName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="username">Programlama Dili</Label>
            <Select
              value={taskLanguage}
              onValueChange={(value) => setTaskLanguage(value)}
            >
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="Programlama dili seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Programlama Dili Seçiniz</SelectLabel>
                  <SelectItem value="c">C</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                  <SelectItem value="lua">Lua</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="javascript">Javascript</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAssignTask}>Görevlendir</Button>
        </CardFooter>
      </Card>
    </>
  );
}

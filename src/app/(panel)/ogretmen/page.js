"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { ClassContainer } from "@/components/blocks/class-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AppBreadcrumb } from "@/components/app-breadcrumb";

import { UNIVERSITIES } from "@/lib/constants";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function TeacherHomePage() {
  const [classes, setClasses] = useState(undefined);
  const [newClassName, setNewClassName] = useState("");
  const [newUniversityName, setNewUniversityName] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [uniqueUniversities, setUniqueUniversities] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleCreateClass = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/class/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          class_name: newClassName,
          university_name: newUniversityName,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        const universities = [
          ...new Set(
            [{ university_name: newUniversityName }, ...classes].map(
              (cls) => cls.university_name
            )
          ),
        ];

        setClasses([
          {
            class_id: data.class_id,
            class_name: newClassName,
            university_name: newUniversityName,
            invite_code: data.invite_code,
            student_count: 0,
          },
          ...classes,
        ]);
        setUniqueUniversities(universities);
        setNewClassName("");
        setNewUniversityName("");
        setIsDialogOpen(false);
      } else {
        console.error("Error while creating class:", response.status);
      }
    } catch (error) {
      console.error("Error while creating class:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = selectedUniversity
    ? classes.filter((cls) => cls.university_name === selectedUniversity)
    : classes;

  useEffect(() => {
    async function fetchClasses() {
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:8000/class/all/teacher",
          {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setClasses(data);

          const universities = [
            ...new Set(data.map((cls) => cls.university_name)),
          ];
          setUniqueUniversities(universities);
        } else {
          console.error("Error while fetching classes:", response.status);
        }
      } catch (error) {
        console.error("Error while fetching classes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, []);

  return (
    <>
      <AppBreadcrumb
        directories={[
          { name: "Öğretmen", link: "/ogretmen" },
          { name: "Derslerim", link: "/ogretmen" },
        ]}
      />

      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-2">Ana Sayfa</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mb-2">
              <Plus /> Yeni Ders Oluştur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Ders Oluştur</DialogTitle>
              <DialogDescription>
                Yeni bir ders oluşturmak için dersin adını ve üniversitenin
                adını girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Dersin Adı
                </Label>
                <Input
                  id="name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="flex justify-between items-center gap-4 overflow-hidden">
                <Label htmlFor="university" className="text-right">
                  Üniversitenin Adı
                </Label>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isPopoverOpen}
                      className="w-full justify-between"
                    >
                      {newUniversityName
                        ? UNIVERSITIES.find(
                            (university) => university === newUniversityName
                          )
                        : "Üniversite seçiniz"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Üniversite seçiniz" />
                      <CommandList>
                        <CommandEmpty>
                          Aradığınız üniversite bulunamadı.
                        </CommandEmpty>
                        <CommandGroup>
                          {UNIVERSITIES.map((university) => (
                            <CommandItem
                              key={university}
                              value={university}
                              onSelect={(currentValue) => {
                                setNewUniversityName(university);
                                setIsPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newUniversityName === university
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {university}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleCreateClass}
                disabled={loading}
              >
                {loading ? "Yükleniyor..." : "Oluştur"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <p className="mb-4">
        Burada sahip olduğunuz ders sınıflarını görüntüleyebilir ve
        öğrencilerinizin ilerlemelerini yakından takip edebilirsiniz.
      </p>

      {loading && <div className="loader"></div>}
      {!loading && Array.isArray(classes) && classes.length === 0 && (
        <p className="text-red-600">
          Oluşturmuş olduğunuz bir ders bulunmamakta.
        </p>
      )}
      {!loading && Array.isArray(classes) && classes.length !== 0 && (
        <>
          <p className="text-sm font-semibold mb-1">
            Üniversitelere göre eğitimini verdiğin dersleri listele
          </p>

          <div className="flex flex-wrap gap-2 mb-2">
            <Badge
              className="text-md cursor-pointer"
              onClick={() => setSelectedUniversity("")}
              variant={selectedUniversity === "" ? undefined : "outline"}
            >
              Tümü
            </Badge>
            {uniqueUniversities.map((university) => (
              <Badge
                key={university}
                className={`text-md ${
                  selectedUniversity === university
                    ? undefined
                    : "hover:bg-primary/5"
                } cursor-pointer`}
                variant={
                  selectedUniversity === university ? undefined : "outline"
                }
                onClick={() => setSelectedUniversity(university)}
              >
                {university}
              </Badge>
            ))}
          </div>
          <ClassContainer
            items={filteredClasses}
            is_teacher={true}
            classes={classes}
            setClasses={setClasses}
            setUniqueUniversities={setUniqueUniversities}
          />
        </>
      )}
    </>
  );
}

import { Check, ChevronsUpDown, EllipsisVertical } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { UNIVERSITIES } from "@/lib/constants";

export const ClassEditDialog = ({
  item,
  classes,
  setClasses,
  setUniqueUniversities,
}) => {
  const [updatedClassName, setUpdatedClassName] = useState("");
  const [updatedUniversityName, setUpdatedUniversityName] = useState(
    item.university_name || ""
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleUpdateClass = async (class_id) => {
    try {
      const classToUpdate = classes.find((item) => item.class_id === class_id);
      const classNameToUpdate = updatedClassName || classToUpdate.class_name;
      const universityNameToUpdate =
        updatedUniversityName || classToUpdate.university_name;

      const response = await fetch(
        `http://localhost:8000/class/${class_id}/edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            class_name: classNameToUpdate,
            university_name: universityNameToUpdate,
          }),
        }
      );

      if (response.ok) {
        const updatedClasses = classes.map((item) =>
          item.class_id === class_id
            ? {
                ...item,
                class_name: classNameToUpdate,
                university_name: universityNameToUpdate,
              }
            : item
        );

        setClasses(updatedClasses);

        const universities = [
          ...new Set(updatedClasses.map((item) => item.university_name)),
        ];
        setUniqueUniversities(universities);

        setUpdatedClassName("");
        setUpdatedUniversityName("");
        setIsDialogOpen(false);
      } else {
        console.error("Error while updating class:", response.status);
      }
    } catch (error) {
      console.error("Error while updating class:", error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={(e) => {
            if (!e) var e = window.event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
          }}
        >
          <EllipsisVertical />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dersi Düzenle</DialogTitle>
          <DialogDescription>
            Dersin ve üniversitenin adını güncelleyerek sınıf bilgilerini güncel
            tutabilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Dersin Adı
            </Label>
            <Input
              id="name"
              defaultValue={item.class_name}
              onChange={(e) => setUpdatedClassName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="flex justify-between items-center gap-4 overflow-hidden">
            <Label htmlFor="university" className="text-right">
              Üniversite
            </Label>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isPopoverOpen}
                  className="w-full justify-between"
                >
                  {updatedUniversityName
                    ? UNIVERSITIES.find(
                        (university) => university === updatedUniversityName
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
                            setUpdatedUniversityName(university);
                            setIsPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              updatedUniversityName === university
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
            onClick={() => handleUpdateClass(item.class_id)}
          >
            Değişiklikleri kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

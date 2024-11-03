"use client";

import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClassContainer } from "@/components/blocks/class-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { Label } from "@/components/ui/label";

import { useEffect, useState } from "react";
import { BACKEND_DOMAIN } from "@/lib/constants";

export default function StudentHomePage() {
  const [classes, setClasses] = useState(undefined);
  const [inviteCode, setInviteCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function getClassesAsStudent() {
    const response = await fetch(`${BACKEND_DOMAIN}/class/all/student`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch classes");
    }

    return response.json();
  }

  async function joinClass(inviteCode) {
    const response = await fetch(`${BACKEND_DOMAIN}/class/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ invite_code: inviteCode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to join class");
    }

    return response.json();
  }

  const handleJoinClass = async () => {
    setLoading(true);
    try {
      await joinClass(inviteCode);
      setInviteCode("");
      setError("");
      setIsDialogOpen(false);
      await fetchClasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await getClassesAsStudent();
      setClasses(data);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <>
      <AppBreadcrumb
        directories={[
          { name: "Öğrenci", link: "/ogrenci" },
          { name: "Derslerim", link: "/ogrenci" },
        ]}
      />
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-2">Ana Sayfa</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mb-2">
              <Plus /> Yeni Derse Katıl
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Derse Katıl</DialogTitle>
              <DialogDescription>
                Katılmak istediğiniz yeni derse ait bağlantı kodunu girin.
                Bağlantı kodunu doğru bir şekilde girdiğinizde, ilgili derse
                erişim sağlayacak ve kod editöründe ilgili ödevlendirmelerde
                çalışmalarınıza başlayabileceksiniz.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="inviteCode" className="text-right">
                  Dersin Davet Kodu
                </Label>
                <Input
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="col-span-3"
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleJoinClass}
                disabled={loading}
              >
                {loading ? "Yükleniyor..." : "Katıl"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className="mb-4">
        Burada hesabınıza bağlı olan tüm dersleri görüntüleyebilir ve
        istediğiniz derse tıklayarak o derse ait kod editöründe sizden istenilen
        görevlendirme üzerinde çalışmaya başlayabilirsiniz.
      </p>

      {loading && <div className="loader"></div>}
      {!loading && Array.isArray(classes) && classes.length === 0 && (
        <p className="text-red-600">
          Katılmış olduğunuz bir ders bulunmamakta.
        </p>
      )}

      {!loading && Array.isArray(classes) && classes.length !== 0 && (
        <ClassContainer items={classes} is_teacher={false} />
      )}
    </>
  );
}

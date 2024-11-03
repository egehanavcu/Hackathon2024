"use client";

import "./globals.css";

import { Code, ListTodo } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import SparklesText from "@/components/ui/sparkles-text";
import { BorderBeam } from "@/components/ui/border-beam";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import CodeEditor from "@uiw/react-textarea-code-editor";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTypewriter } from "@/hooks/use-typewriter";
import { cn } from "@/lib/utils";
import { BACKEND_DOMAIN } from "@/lib/constants";

const codeSnippet = `#     Bubble sort

def bubbleSort(array):
  for i in range(len(array)):
    for j in range(0, len(array) - i - 1):
      if array[j] > array[j + 1]:
        temp = array[j]
        array[j] = array[j+1]
        array[j+1] = temp`;

export default function HomePage() {
  const code = useTypewriter(codeSnippet, 50);

  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const [response, setResponse] = useState("");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [registerResponse, setRegisterResponse] = useState("");

  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BACKEND_DOMAIN}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        setResponse(<span className="text-green-600">Giriş başarılı.</span>);
        if (data.is_teacher) {
          router.push("/ogretmen");
        } else {
          router.push("/ogrenci");
        }
      } else {
        setResponse(
          <span className="text-red-600">Yanlış kullanıcı bilgileri!</span>
        );
      }
    } catch (error) {
      console.error("Hata");
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${BACKEND_DOMAIN}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registerEmail,
          first_name: firstName,
          last_name: lastName,
          password: registerPassword,
          is_teacher: isTeacher,
        }),
      });

      if (response.ok) {
        setRegisterResponse(
          <span className="text-green-600">
            Kayıt başarılı! Lütfen giriş yapın.
          </span>
        );
        setIsLoggingIn(true);
      } else {
        setRegisterResponse(
          <span className="text-red-600">
            Kayıt başarısız. Bilgilerinizi kontrol edin!
          </span>
        );
      }
    } catch (error) {
      setRegisterResponse(
        <span className="text-red-600">
          Bir hata oluştu. Lütfen tekrar deneyin.
        </span>
      );
    }
  };

  useEffect(() => {
    for (const [index, timeout] of [2280, 4560, 6840, 9120, 12000].entries())
      setTimeout(() => {
        setProgressPercentage((index + 1) * 20);
      }, timeout);
  }, []);

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="hidden bg-muted lg:block p-24">
        <SparklesText text="TakımYıldız" className="mb-4" />
        <div className="mb-6">
          Bu platform, programlama derslerinizi daha verimli ve etkili bir
          şekilde yönetmenize yardımcı olmak için tasarlanmıştır. Öğretmenler,
          öğrencilerine kodlama görevleri atayabilir ve ilerlemelerini{" "}
          <AnimatedGradientText className="inline-block">
            <span
              className={cn(
                `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
              )}
            >
              yapay zeka
            </span>
          </AnimatedGradientText>{" "}
          sayesinde anlık olarak takip edebilirken; öğrenciler, derslere
          katılarak verilen görevler üzerinde çalışabilir. Derslerinize başlamak
          veya yeni bir sınıf oluşturmak için hemen giriş yapın ya da kaydolun!
        </div>
        <div className="relative p-6 rounded-3xl min-h-80">
          <BorderBeam />
          <p className="flex items-center">
            <ListTodo className="inline-block mr-2" />
            Mevcut Görevlendirme:
            <span className="ml-1 font-semibold">Bubble Sort Algoritması</span>
          </p>
          <p className="flex items-center mb-4">
            <Code className="inline-block mr-2" />
            Programlama Dili: <span className="ml-1 font-semibold">Python</span>
          </p>

          <div className="relative">
            <div className="absolute top-0 right-0 -translate-y-1/2">
              <AnimatedCircularProgressBar
                max={100}
                min={0}
                value={progressPercentage}
                gaugePrimaryColor="rgb(79 70 229)"
                gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
              />
            </div>
            <CodeEditor
              value={code}
              language="py"
              disabled
              padding={15}
              style={{
                fontSize: 12,
                fontFamily:
                  "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        {isLoggingIn && (
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">Giriş Yap</h1>
              <p className="text-balance text-muted-foreground">
                Giriş yapmak için bilgilerini gir
              </p>
            </div>
            {response}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-Posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Şifre</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="button" onClick={handleLogin} className="w-full">
                Giriş Yap
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Hesabın yok mu?{" "}
              <span
                className="underline cursor-pointer"
                onClick={() => {
                  setIsLoggingIn(false);
                }}
              >
                Kayıt ol
              </span>
            </div>
          </div>
        )}
        {!isLoggingIn && (
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">Kayıt Ol</h1>
              <p className="text-balance text-muted-foreground">
                Kayıt olmak için bilgilerini gir
              </p>
            </div>
            {registerResponse}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Ad</Label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Soyad</Label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-Posta</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="userType">Üyelik Türü</Label>
                <Select
                  onValueChange={(value) => setIsTeacher(value === "teacher")}
                  defaultValue={isTeacher ? "teacher" : "student"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Üyelik türünü seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Üyelik Türü</SelectLabel>
                      <SelectItem value="teacher">Öğretmen</SelectItem>
                      <SelectItem value="student">Öğrenci</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" onClick={handleRegister} className="w-full">
                Kayıt Ol
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Zaten hesabın var mı?{" "}
              <span
                className="underline cursor-pointer"
                onClick={() => {
                  setIsLoggingIn(true);
                }}
              >
                Giriş yap
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

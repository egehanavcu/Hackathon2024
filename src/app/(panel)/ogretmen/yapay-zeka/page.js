"use client";

import { LoaderCircle } from "lucide-react";
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
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TypingAnimation from "@/components/ui/typing-animation";
import { TextBlurEffect } from "@/components/ui/text-blur-effect";

import { useState, useEffect, useRef } from "react";

export default function AIChatPage() {
  const [isInputHidden, setIsInputHidden] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [conversationType, setConversationType] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClassLocked, setIsClassLocked] = useState(false);
  const [isConversationTypeLocked, setIsConversationTypeLocked] =
    useState(false);
  const [isStudentLocked, setIsStudentLocked] = useState(false);
  const [classData, setClassData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);

  const messagesEndRef = useRef(null);

  const handleClassSelect = (value) => {
    setSelectedClass(value);
    setConversationType(null);
    setSelectedStudent(null);
    setIsInputHidden(true);
    setIsClassLocked(true);

    fetch(`http://localhost:8000/class/${value}/teacher`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setStudentsData(data.students);
      })
      .catch((error) => {
        console.error("Error fetching class details:", error);
      });
  };

  const handleConversationTypeSelect = (value) => {
    setConversationType(value);
    setSelectedStudent(null);
    if (value === "class") {
      setIsInputHidden(false);
    } else {
      setIsInputHidden(true);
    }
    setIsConversationTypeLocked(true);
  };

  const handleStudentSelect = (value) => {
    setSelectedStudent(value);
    setIsInputHidden(false);
    setIsStudentLocked(true);
  };

  const handleMessageSubmit = async (event) => {
    event.preventDefault();
    let userMessage = event.target.elements[0].value;
    setMessages([...messages, { text: userMessage, sender: "user" }]);
    event.target.reset();
    setIsLoading(true);

    if (!conversationHistory.length) {
      userMessage =
        `All information related to the classes is within these JSONs:\n${JSON.stringify(
          classData
        )}\n${JSON.stringify(studentsData)}. ${
          selectedClass &&
          `I want to talk about the class with class_id ${selectedClass} ${
            selectedStudent ? `and the student with id ${selectedStudent}` : ""
          }. Let's continue the conversation from here:`
        }\n` + userMessage;
    }

    const response = await fetch("http://localhost:8000/chat-bot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        message: userMessage,
        conversation: conversationHistory,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setConversationHistory(data.conversation);
      setIsLoading(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.text, sender: "bot" },
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetch("http://localhost:8000/class/all/teacher", {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setClassData(data);
      })
      .catch((error) => {
        console.error("Error fetching classes:", error);
      });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <>
      <AppBreadcrumb
        directories={[
          { name: "Öğretmen", link: "/ogretmen" },
          { name: "Yapay Zeka Asistanı", link: "/ogretmen/yapay-zeka" },
        ]}
      />

      <div className="flex-1 flex flex-col justify-center items-center md:px-24">
        <TypingAnimation
          className="text-4xl font-semibold text-card-foreground mb-2"
          text="Nasıl yardımcı olabilirim?"
          duration={40}
        />

        <div className="flex gap-4 self-start py-2 px-4 bg-card text-card-foreground rounded-xl mb-4">
          <Avatar>
            <AvatarImage src="/gemini.webp" alt="@shadcn" />
            <AvatarFallback>TY</AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-2">
            <span>Sizin için hangi sınıf hakkında konuşmak istersiniz?</span>
            <Select onValueChange={handleClassSelect} disabled={isClassLocked}>
              <SelectTrigger className="max-w-min px-12">
                <SelectValue placeholder="Sınıf seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sınıflar</SelectLabel>
                  {classData.map((cls) => (
                    <SelectItem key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedClass && (
          <div className="flex gap-4 self-start py-2 px-4 bg-card text-card-foreground rounded-xl mb-4">
            <Avatar>
              <AvatarImage src="/gemini.webp" alt="@shadcn" />
              <AvatarFallback>TY</AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
              <span>
                Sınıfın genel durumu mu yoksa bir öğrenci hakkında mı bilgi
                almak istersiniz?
              </span>
              <Select
                onValueChange={handleConversationTypeSelect}
                disabled={isConversationTypeLocked}
              >
                <SelectTrigger className="max-w-min px-12">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Seçenekler</SelectLabel>
                    <SelectItem value="class">Sınıf durumu hakkında</SelectItem>
                    <SelectItem value="student">
                      Belirli bir öğrenci hakkında
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {conversationType === "student" && (
          <div className="flex gap-4 self-start py-2 px-4 bg-card text-card-foreground rounded-xl mb-4">
            <Avatar>
              <AvatarImage src="/gemini.webp" alt="@shadcn" />
              <AvatarFallback>TY</AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
              <span>
                Hangi öğrenciyi merak ediyorsunuz? Onunla ilgili konuşalım!
              </span>
              <Select
                onValueChange={handleStudentSelect}
                disabled={isStudentLocked}
              >
                <SelectTrigger className="max-w-min px-12">
                  <SelectValue placeholder="Öğrenci seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Öğrenciler</SelectLabel>
                    {studentsData.map((student) => (
                      <SelectItem key={student.id} value={student.student_name}>
                        {student.student_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`${
              message.sender !== "user" ? "flex gap-4" : null
            } self-${
              message.sender === "user" ? "end" : "start"
            } py-2 px-4 bg-card text-card-foreground ${
              message.sender === "user" ? "shadow" : null
            } rounded-xl mb-4 ${
              message.sender === "user" ? "self-end" : "self-start"
            }`}
          >
            {message.sender === "bot" ? (
              <>
                <Avatar>
                  <AvatarImage src="/gemini.webp" alt="@shadcn" />
                  <AvatarFallback>TY</AvatarFallback>
                </Avatar>
                <TextBlurEffect words={message.text} />
              </>
            ) : (
              message.text
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 self-start py-2 px-4 bg-card text-card-foreground rounded-xl mb-4">
            <Avatar>
              <AvatarImage src="/gemini.webp" alt="@shadcn" />
              <AvatarFallback>TY</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <span>
                <LoaderCircle className="animate-spin" />
              </span>
            </div>
          </div>
        )}

        {!isInputHidden && (
          <PlaceholdersAndVanishInput
            placeholders={[
              "Öğrencilere ne ödev vereceğine emin değil misin?",
              "Ödevlendirme için yardıma mı ihtiyacın var?",
            ]}
            onChange={() => {}}
            onSubmit={handleMessageSubmit}
          />
        )}

        <div ref={messagesEndRef} />
      </div>
    </>
  );
}

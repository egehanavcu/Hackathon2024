"use client";

import { AnimatePresence, motion } from "framer-motion";
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOutsideClick } from "@/hooks/use-outside-click";
import bbcode from "bbcodejs";

export default function StudentCard({ students, classId }) {
  const [active, setActive] = useState(null);
  const ref = useRef(null);

  const router = useRouter();
  const parser = new bbcode.Parser();

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.userId}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-background rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.userId}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <div className="flex justify-center items-center p-4">
                <motion.h3
                  layoutId={`user-${active.userId}`}
                  className="font-medium text-neutral-700 dark:text-neutral-200 text-xl"
                >
                  {active.name}
                </motion.h3>
              </div>

              <motion.div layoutId={`image-${active.userId}`}>
                <AnimatedCircularProgressBar
                  max={100}
                  min={0}
                  value={active.progress}
                  gaugePrimaryColor="rgb(79 70 229)"
                  gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                  className="mx-auto"
                />
              </motion.div>
              <div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base max-h-40 pb-10 overflow-x-hidden whitespace-pre-line dark:text-neutral-400 [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {active.summary ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: parser.toHTML(active.summary),
                        }}
                      />
                    ) : (
                      <b>Henüz gösterilecek bir özet yok.</b>
                    )}
                  </motion.div>
                </div>

                <div className="flex items-start p-4">
                  <motion.span
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white cursor-pointer select-none"
                    onClick={() => {
                      router.push(`/ogretmen/ders/${classId}/${active.userId}`);
                    }}
                  >
                    Kod Editörüne Git
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="mx-auto w-full grid grid-cols-1 md:grid-cols-3 items-start gap-4">
        {students.map((student, index) => (
          <motion.div
            layoutId={`card-${student.userId}`}
            key={index}
            onClick={() => setActive(student)}
            className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 border rounded-xl cursor-pointer"
          >
            <div className="flex gap-4 flex-col w-full">
              <div className="flex justify-center items-center flex-col">
                <motion.h3
                  layoutId={`user-${student.userId}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base"
                >
                  {student.name}
                </motion.h3>
              </div>

              <motion.div layoutId={`image-${student.userId}`}>
                <AnimatedCircularProgressBar
                  max={100}
                  min={0}
                  value={student.progress}
                  gaugePrimaryColor="rgb(79 70 229)"
                  gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                  className="mx-auto"
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

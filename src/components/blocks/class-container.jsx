import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ClassEditDialog } from "./class-edit-dialog";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const ClassContainer = ({
  items,
  classes,
  setClasses,
  setUniqueUniversities,
  is_teacher,
  className,
}) => {
  let [hoveredIndex, setHoveredIndex] = useState(null);
  const router = useRouter();

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.class_id}
          className="relative group block p-2 h-full w-full cursor-pointer"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => {
            router.push(
              `${
                is_teacher
                  ? `/ogretmen/ders/${item.class_id}`
                  : `/ogrenci/ders/${item.class_id}`
              }`
            );
          }}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-neutral-100 dark:bg-slate-800/[0.8] block rounded-2xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <div className="flex justify-between items-center gap-6">
              <CardTitle>{item.class_name}</CardTitle>
              {is_teacher && (
                <ClassEditDialog
                  item={item}
                  classes={classes}
                  setClasses={setClasses}
                  setUniqueUniversities={setUniqueUniversities}
                />
              )}
            </div>
            <CardDescription>
              {item.university_name}
              <br />
              {is_teacher ? (
                <span>
                  Davet Kodu: <b>{item.invite_code}</b>
                </span>
              ) : (
                <span>
                  Öğretmen: <b>{item.teacher_name}</b>
                </span>
              )}

              <div className="flex justify-end mt-2">
                <Badge variant="outline">{item.student_count} Öğrenci</Badge>
              </div>
            </CardDescription>
          </Card>
        </div>
      ))}
    </div>
  );
};

export const Card = ({ className, children }) => {
  return (
    <div
      className={cn(
        "rounded-xl h-full w-full p-4 overflow-hidden bg-white border border-transparent shadow dark:border-white/[0.2] group-hover:border-neutral-400 relative z-20",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
export const CardTitle = ({ className, children }) => {
  return (
    <h4 className={cn("font-semibold tracking-wide mt-4", className)}>
      {children}
    </h4>
  );
};
export const CardDescription = ({ className, children }) => {
  return (
    <p className={cn("mt-8 tracking-wide leading-relaxed text-sm", className)}>
      {children}
    </p>
  );
};

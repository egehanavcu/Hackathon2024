"use client";

import bbcode from "bbcodejs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextBlurEffect = ({ words, className, duration = 0.5 }) => {
  const parser = new bbcode.Parser();

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration }}
      className={cn("dark:text-white text-black", className)}
      dangerouslySetInnerHTML={{
        __html: parser.toHTML(words),
      }}
    />
  );
};

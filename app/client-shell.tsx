"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCtlPage = pathname?.startsWith("/ctl");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={isCtlPage ? "" : "flex-1"}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AnimatedCTA() {
  return (
    <div className="mt-8 flex justify-center text-gray-500">
      <Link href="/analytics">
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            skewX: [0, -1, 0],
            // boxShadow: [
            //   "0 0 0 rgba(59,130,246,0.0)",
            //   "0 0 20px rgba(59,130,246,0.35)",
            //   "0 0 0 rgba(59,130,246,0.0)",
            // ],
          }}
          transition={{
            duration: 2.2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          whileHover={{ scale: 1.08 }}
          className="rounded-xl border border-blue-500/40"
        >
          <Button
            size="lg"
            className="gap-2 cursor-pointer text-blue-600 bg-transparent hover:bg-transparent"
          >
            Open Analytics <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </Link>
    </div>
  );
}

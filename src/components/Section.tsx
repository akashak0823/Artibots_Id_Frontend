import React from "react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

interface SectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export const Section: React.FC<SectionProps> = ({ title, children, className, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={cn("bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-6 border border-white/20 mb-6", className)}
        >
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 border-gray-200/50">
                {title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {children}
            </div>
        </motion.div>
    );
};

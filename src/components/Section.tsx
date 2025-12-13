import React from "react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

interface SectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    delay?: number;
    icon?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, icon, children, className }) => {
    return (
        <div className={cn("bg-white p-8 rounded-2xl shadow-sm border border-cyan-100", className)}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyan-800 border-b border-cyan-50 pb-2">
                <span className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
                    {icon}
                </span>
                {title}
            </h3>
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
};

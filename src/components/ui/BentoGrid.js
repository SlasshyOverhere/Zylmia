import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export const BentoGrid = ({ className, children }) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto px-4 pb-20",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    href,
}) => {
    return (
        <Link
            to={href}
            className={cn(
                "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 bg-neutral-900 border border-white/10 justify-between flex flex-col space-y-4 overflow-hidden relative",
                className
            )}
        >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-violet-500/0 to-violet-500/10 group-hover/bento:from-violet-500/5 group-hover/bento:to-violet-500/20 transition-all duration-500" />

            <div className="group-hover/bento:translate-x-2 transition duration-200 relative z-10">
                <div className="mb-2 mt-2 text-violet-500">
                    {icon}
                </div>
                <div className="font-bold text-neutral-200 mb-2 mt-2 text-xl">
                    {title}
                </div>
                <div className="font-normal text-neutral-400 text-sm">
                    {description}
                </div>
            </div>
            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden relative group-hover/bento:scale-105 transition-transform duration-300">
                {header}
                <div className="absolute inset-0 bg-black/20 group-hover/bento:bg-transparent transition-colors" />
            </div>
        </Link>
    );
};

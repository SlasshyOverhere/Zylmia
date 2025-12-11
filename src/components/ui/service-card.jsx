import * as React from "react";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { cn } from "../../utils/cn";

// CVA for card variants
const cardVariants = cva(
    "relative flex flex-col justify-between w-full p-6 overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 ease-in-out group hover:shadow-lg cursor-pointer",
    {
        variants: {
            variant: {
                default: "bg-card text-card-foreground",
                violet: "bg-violet-900/40 text-white border border-violet-500/20",
                blue: "bg-blue-900/40 text-white border border-blue-500/20",
                pink: "bg-pink-900/40 text-white border border-pink-500/20",
                emerald: "bg-emerald-900/40 text-white border border-emerald-500/20",
                orange: "bg-orange-900/40 text-white border border-orange-500/20",
                indigo: "bg-indigo-900/40 text-white border border-indigo-500/20",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

// Icon background gradient variants
const iconVariants = {
    violet: "from-violet-600 to-purple-600",
    blue: "from-blue-500 to-cyan-500",
    pink: "from-pink-500 to-rose-500",
    emerald: "from-emerald-500 to-teal-500",
    orange: "from-orange-500 to-amber-500",
    indigo: "from-indigo-500 to-violet-500",
};

/**
 * @typedef {Object} ServiceCardProps
 * @property {string} title - The main title of the card.
 * @property {string} description - The description text below the title.
 * @property {string} href - The URL the card's link should point to.
 * @property {React.ElementType} icon - Lucide icon component to display.
 * @property {'violet' | 'blue' | 'pink' | 'emerald' | 'orange' | 'indigo'} [variant] - Color variant of the card.
 * @property {string} [className] - Additional CSS classes.
 */

const ServiceCard = React.forwardRef(
    ({ className, variant = "violet", title, description, href, icon: Icon, onClick, ...props }, ref) => {

        // Animation variants for Framer Motion
        const cardAnimation = {
            hover: {
                scale: 1.02,
                transition: { duration: 0.3 },
            },
        };

        const iconAnimation = {
            hover: {
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.3, ease: "easeInOut" },
            },
        };

        const arrowAnimation = {
            hover: {
                x: 5,
                transition: { duration: 0.3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" },
            }
        };

        const handleClick = (e) => {
            if (onClick) {
                onClick(e);
            }
        };

        return (
            <motion.div
                className={cn(cardVariants({ variant, className }))}
                ref={ref}
                variants={cardAnimation}
                whileHover="hover"
                onClick={handleClick}
                {...props}
            >
                {/* Gradient glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${iconVariants[variant] || iconVariants.violet} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />

                {/* Subtle gradient overlay at bottom-right */}
                <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${iconVariants[variant] || iconVariants.violet} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-500`} />

                <div className="relative z-10 flex flex-col h-full">
                    {/* Icon */}
                    <motion.div
                        variants={iconAnimation}
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconVariants[variant] || iconVariants.violet} flex items-center justify-center mb-4 shadow-lg`}
                    >
                        {Icon && <Icon className="w-6 h-6 text-white" />}
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-xl font-bold tracking-tight text-white mb-2">{title}</h3>

                    {/* Description */}
                    <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{description}</p>

                    {/* CTA Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onClick) onClick(e);
                        }}
                        aria-label={`Explore ${title}`}
                        className="mt-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold text-white transition-all duration-300 w-fit group-hover:scale-105"
                    >
                        <span>EXPLORE NOW</span>
                        <motion.div variants={arrowAnimation}>
                            <ArrowRight className="h-4 w-4" />
                        </motion.div>
                    </button>
                </div>
            </motion.div>
        );
    }
);

ServiceCard.displayName = "ServiceCard";

export { ServiceCard };

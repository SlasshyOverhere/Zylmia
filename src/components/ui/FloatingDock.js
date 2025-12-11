import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export const FloatingDock = ({ items, desktopClassName, mobileClassName }) => {
    return (
        <>
            <FloatingDockDesktop items={items} className={desktopClassName} />
            <FloatingDockMobile items={items} className={mobileClassName} />
        </>
    );
};

const FloatingDockMobile = ({ items, className }) => {
    return (
        <div className={cn("relative block md:hidden", className)}>
            <motion.div
                layoutId="nav"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-neutral-900/90 backdrop-blur-2xl border border-white/10 px-4 py-3 rounded-2xl shadow-2xl z-50 overflow-x-auto max-w-[90vw] scrollbar-hide"
            >
                {items.map((item) => (
                    <Link to={item.href} key={item.title} className="relative group p-2">
                        <IconContainer mouseX={null} {...item} isMobile />
                    </Link>
                ))}
            </motion.div>
        </div>
    );
};

const FloatingDockDesktop = ({ items, className }) => {
    let mouseX = useMotionValue(Infinity);

    return (
        <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className={cn(
                "mx-auto hidden md:flex h-16 gap-4 items-end rounded-2xl bg-neutral-900/40 backdrop-blur-md border border-white/5 px-4 pb-3",
                className
            )}
        >
            {items.map((item) => (
                <Link to={item.href} key={item.title}>
                    <IconContainer mouseX={mouseX} {...item} />
                </Link>
            ))}
        </motion.div>
    );
};

function IconContainer({ mouseX, title, icon, href, isMobile }) {
    let ref = useRef(null);
    let defaultMouseX = useMotionValue(Infinity);
    let effectiveMouseX = mouseX || defaultMouseX;

    let distance = useTransform(effectiveMouseX, (val) => {
        let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

    let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
    let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

    let width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
    let height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });

    let widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });
    let heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });

    const [hovered, setHovered] = React.useState(false);

    if (isMobile) {
        return (
            <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10">
                    {icon}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            ref={ref}
            style={{ width, height }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="aspect-square rounded-full bg-neutral-800/80 border border-white/10 flex items-center justify-center relative shadow-lg shadow-violet-500/5 group"
        >
            <motion.div
                style={{ width: widthIcon, height: heightIcon }}
                className="flex items-center justify-center text-white"
            >
                {icon}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10, x: "-50%" }}
                animate={{ opacity: hovered ? 1 : 0, y: hovered ? -50 : 10, x: "-50%" }}
                className="absolute left-1/2 top-0 -translate-x-1/2 px-2 py-0.5 whitespace-pre rounded-md bg-neutral-900 border border-white/10 text-white text-xs font-medium"
            >
                {title}
            </motion.div>
        </motion.div>
    );
}

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- FlipCard Component (Interactive) ---
const IMG_WIDTH = 80;
const IMG_HEIGHT = 120;

function FlipCard({ src, title, index, target, isInteractive, item, onCardClick, rating, year }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            animate={{
                x: target.x,
                y: target.y,
                rotate: target.rotation,
                scale: target.scale,
                opacity: target.opacity,
            }}
            transition={{
                type: "spring",
                stiffness: 45,
                damping: 14,
            }}
            style={{
                position: "absolute",
                width: IMG_WIDTH,
                height: IMG_HEIGHT,
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            className={isInteractive ? "cursor-pointer" : "pointer-events-none"}
            onMouseEnter={() => isInteractive && setIsHovered(true)}
            onMouseLeave={() => isInteractive && setIsHovered(false)}
            onClick={() => isInteractive && onCardClick && onCardClick(item)}
        >
            <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: isHovered ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-2xl bg-neutral-800"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <img
                        src={src}
                        alt={title || `card-${index}`}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-[9px] font-semibold text-white truncate text-center">{title}</p>
                    </div>
                    {/* Hover glow effect */}
                    {isInteractive && (
                        <motion.div
                            className="absolute inset-0 rounded-xl"
                            animate={{ boxShadow: isHovered ? '0 0 30px rgba(139, 92, 246, 0.6)' : '0 0 0px rgba(139, 92, 246, 0)' }}
                            transition={{ duration: 0.3 }}
                        />
                    )}
                </div>

                {/* Back Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-2xl bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 flex flex-col items-center justify-between p-2 border border-violet-500/30"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    {/* Rating Badge */}
                    <div className="w-full flex justify-center">
                        <div className="flex items-center gap-1 bg-black/40 rounded-full px-2 py-0.5">
                            <span className="text-yellow-400 text-[10px]">★</span>
                            <span className="text-[10px] font-bold text-white">{rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Title & Year */}
                    <div className="text-center flex-1 flex flex-col justify-center">
                        <p className="text-[10px] font-semibold text-white line-clamp-2 leading-tight mb-1">{title}</p>
                        {year && (
                            <p className="text-[9px] text-violet-300 font-medium">{year}</p>
                        )}
                    </div>

                    {/* Click Prompt */}
                    <div className="w-full">
                        <div className="bg-violet-500/30 rounded-lg py-1 px-2 border border-violet-400/40">
                            <p className="text-[7px] text-violet-200 font-medium text-center uppercase tracking-wider">
                                Tap to explore
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

/**
 * PageIntroAnimation - Interactive intro for category pages with trending content
 */
export default function PageIntroAnimation({
    categoryLabel = "Content",
    categoryDescription = "",
    gradient = "from-violet-600 via-purple-600 to-indigo-600",
    trendingItems = [],
    onEnter,
    onCardClick
}) {
    const [phase, setPhase] = useState("scatter");
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);
    const [isInteractive, setIsInteractive] = useState(false);

    // Generate images array from trending items
    const items = useMemo(() => {
        if (trendingItems && trendingItems.length > 0) {
            return trendingItems.slice(0, 10).map(item => {
                // Extract year from release_date (movies) or first_air_date (TV)
                const releaseDate = item.release_date || item.first_air_date;
                const year = releaseDate ? releaseDate.split('-')[0] : null;

                return {
                    src: item.poster_path
                        ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                        : 'https://via.placeholder.com/300x450?text=No+Image',
                    title: item.title || item.name || 'Unknown',
                    rating: item.vote_average,
                    year: year,
                    originalItem: item
                };
            });
        }
        return [];
    }, [trendingItems]);

    const TOTAL_ITEMS = items.length || 10;

    // --- Container Size ---
    useEffect(() => {
        if (!containerRef.current) return;

        const handleResize = (entries) => {
            for (const entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);

        setContainerSize({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
        });

        return () => observer.disconnect();
    }, []);

    // --- Animation Sequence ---
    useEffect(() => {
        const timer1 = setTimeout(() => setPhase("line"), 100);
        const timer2 = setTimeout(() => setPhase("circle"), 800);
        const timer3 = setTimeout(() => {
            setPhase("arc");
            setTimeout(() => setIsInteractive(true), 500);
        }, 2000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    // --- Random Scatter Positions ---
    const scatterPositions = useMemo(() => {
        return Array(TOTAL_ITEMS).fill(null).map(() => ({
            x: (Math.random() - 0.5) * 1400,
            y: (Math.random() - 0.5) * 900,
            rotation: (Math.random() - 0.5) * 200,
            scale: 0.3,
            opacity: 0,
        }));
    }, [TOTAL_ITEMS]);

    // Calculate card positions based on phase
    const getCardTarget = (index) => {
        switch (phase) {
            case "scatter":
                return scatterPositions[index];

            case "line": {
                const lineSpacing = 95;
                const lineTotalWidth = TOTAL_ITEMS * lineSpacing;
                const lineX = index * lineSpacing - lineTotalWidth / 2 + lineSpacing / 2;
                return {
                    x: lineX,
                    y: 0,
                    rotation: 0,
                    scale: 0.9,
                    opacity: 1
                };
            }

            case "circle": {
                const radius = Math.min(containerSize.width * 0.32, containerSize.height * 0.32, 250);
                const angle = (index / TOTAL_ITEMS) * 360;
                const rad = (angle * Math.PI) / 180;
                return {
                    x: Math.cos(rad) * radius,
                    y: Math.sin(rad) * radius,
                    rotation: angle + 90,
                    scale: 1,
                    opacity: 1,
                };
            }

            case "arc": {
                // Form a beautiful rainbow arc at bottom - ORIGINAL positioning
                const isMobile = containerSize.width < 768;
                const arcRadius = Math.min(containerSize.width * 0.85, 650);
                const spreadAngle = isMobile ? 90 : 130;
                const startAngle = -90 - (spreadAngle / 2);
                const step = spreadAngle / (TOTAL_ITEMS - 1);
                const arcAngle = startAngle + (index * step);
                const arcRad = (arcAngle * Math.PI) / 180;

                const arcCenterY = containerSize.height * 0.55;

                return {
                    x: Math.cos(arcRad) * arcRadius,
                    y: Math.sin(arcRad) * arcRadius + arcCenterY,
                    rotation: arcAngle + 90,
                    scale: isMobile ? 1.3 : 1.6,
                    opacity: 1,
                };
            }

            default:
                return { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };
        }
    };

    const handleCardClick = (item) => {
        if (onCardClick && item.originalItem) {
            onCardClick(item.originalItem);
        }
    };

    return (
        <motion.div
            ref={containerRef}
            className="fixed inset-0 z-[200] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Dark backdrop */}
            <div className="absolute inset-0 bg-neutral-950" />

            <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase !== "scatter" ? 1 : 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className={`absolute inset-0 bg-gradient-to-br from-neutral-950 via-violet-950/30 to-neutral-950`} />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse" />
            </motion.div>

            {/* Cards Container */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative" style={{ width: '100%', height: '100%' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {items.map((item, i) => (
                            <FlipCard
                                key={i}
                                src={item.src}
                                title={item.title}
                                index={i}
                                target={getCardTarget(i)}
                                isInteractive={isInteractive}
                                item={item}
                                onCardClick={handleCardClick}
                                rating={item.rating}
                                year={item.year}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* "Today's Trending" text - positioned at TOP */}
            <AnimatePresence>
                {phase === "arc" && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="absolute inset-x-0 top-0 flex flex-col items-center text-center pointer-events-none z-10 pt-[8%]"
                    >
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="text-sm md:text-lg text-violet-400 font-semibold tracking-widest uppercase"
                        >
                            🔥 Today's Trending
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Title, Description & Button - positioned at BOTTOM */}
            <AnimatePresence>
                {phase === "arc" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center pointer-events-none z-10 pb-[6%]"
                    >
                        {/* Glow backdrop */}
                        <div className={`absolute w-80 h-60 bg-gradient-to-r ${gradient} blur-[80px] opacity-25 rounded-full`} />

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="relative"
                        >
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-neutral-400 tracking-tight mb-2">
                                {categoryLabel}
                            </h1>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="text-sm md:text-base text-neutral-400 font-medium tracking-wide max-w-md mb-6"
                        >
                            {categoryDescription}
                        </motion.p>

                        {/* Enter Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0, duration: 0.5 }}
                            onClick={onEnter}
                            className={`pointer-events-auto group relative px-10 py-4 rounded-full bg-gradient-to-r ${gradient} text-white font-bold text-lg tracking-wide overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] active:scale-95`}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Enter the Universe
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    →
                                </motion.span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </motion.button>

                        {/* Hint text */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.3, duration: 0.5 }}
                            className="mt-4 text-xs text-neutral-500"
                        >
                            Hover over cards to see what's trending today
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}


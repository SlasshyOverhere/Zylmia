"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

// --- FlipCard Component ---
const IMG_WIDTH = 80;
const IMG_HEIGHT = 120;

function FlipCard({ src, index, target }) {
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
                stiffness: 50,
                damping: 15,
            }}
            style={{
                position: "absolute",
                width: IMG_WIDTH,
                height: IMG_HEIGHT,
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            className="pointer-events-none"
        >
            <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Front Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-2xl bg-neutral-800"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <img
                        src={src}
                        alt={`card-${index}`}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
            </motion.div>
        </motion.div>
    );
}

// Helper for linear interpolation
const lerp = (start, end, t) => start * (1 - t) + end * t;

/**
 * DetailIntroAnimation - Animated intro for movie/series details
 * @param {Object} props
 * @param {Object} props.item - The movie/series item with poster_path, backdrop_path
 * @param {string} props.type - 'movie' or 'tv'
 * @param {Array} props.similarItems - Array of similar movies/shows for the animation
 * @param {Function} props.onAnimationComplete - Callback when intro animation finishes
 * @param {Function} props.onSkip - Callback to skip the animation
 */
export default function DetailIntroAnimation({
    item,
    type = 'movie',
    similarItems = [],
    onAnimationComplete,
    onSkip
}) {
    const [phase, setPhase] = useState("scatter"); // scatter -> converge -> reveal
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);
    const [showContent, setShowContent] = useState(false);

    // Generate images array - use similar items or stock images
    const images = useMemo(() => {
        const baseImages = [];

        // Add the main item's poster first
        if (item?.poster_path) {
            baseImages.push(`https://image.tmdb.org/t/p/w300${item.poster_path}`);
        }

        // Add similar items
        if (similarItems && similarItems.length > 0) {
            similarItems.slice(0, 15).forEach(similar => {
                if (similar.poster_path) {
                    baseImages.push(`https://image.tmdb.org/t/p/w300${similar.poster_path}`);
                }
            });
        }

        // Fill with stock images if needed
        const stockImages = [
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&q=80",
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80",
            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300&q=80",
            "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&q=80",
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&q=80",
            "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&q=80",
            "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&q=80",
            "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&q=80",
        ];

        while (baseImages.length < 12) {
            baseImages.push(stockImages[baseImages.length % stockImages.length]);
        }

        return baseImages.slice(0, 12);
    }, [item, similarItems]);

    const TOTAL_IMAGES = images.length;

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
        // Phase 1: Scatter (initial) -> Converge (0.5s)
        const timer1 = setTimeout(() => setPhase("converge"), 100);

        // Phase 2: Converge -> Circle (1s)
        const timer2 = setTimeout(() => setPhase("circle"), 600);

        // Phase 3: Circle -> Reveal (2s)
        const timer3 = setTimeout(() => setPhase("reveal"), 1800);

        // Phase 4: Show content (2.5s)
        const timer4 = setTimeout(() => {
            setShowContent(true);
        }, 2200);

        // Phase 5: Complete animation (3s)
        const timer5 = setTimeout(() => {
            if (onAnimationComplete) onAnimationComplete();
        }, 2800);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
            clearTimeout(timer5);
        };
    }, [onAnimationComplete]);

    // --- Random Scatter Positions ---
    const scatterPositions = useMemo(() => {
        return images.map(() => ({
            x: (Math.random() - 0.5) * 1200,
            y: (Math.random() - 0.5) * 800,
            rotation: (Math.random() - 0.5) * 180,
            scale: 0.3,
            opacity: 0,
        }));
    }, [images]);

    // Calculate card positions based on phase
    const getCardTarget = (index) => {
        const centerX = 0;
        const centerY = 0;

        switch (phase) {
            case "scatter":
                return scatterPositions[index];

            case "converge": {
                // Converge to a line
                const lineSpacing = 90;
                const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
                const lineX = index * lineSpacing - lineTotalWidth / 2 + lineSpacing / 2;
                return {
                    x: lineX,
                    y: 0,
                    rotation: 0,
                    scale: 0.8,
                    opacity: 1
                };
            }

            case "circle": {
                // Form a circle
                const radius = Math.min(containerSize.width, containerSize.height) * 0.3;
                const angle = (index / TOTAL_IMAGES) * 360;
                const rad = (angle * Math.PI) / 180;
                return {
                    x: Math.cos(rad) * radius,
                    y: Math.sin(rad) * radius,
                    rotation: angle + 90,
                    scale: 1,
                    opacity: 1,
                };
            }

            case "reveal": {
                // Explode outward and fade
                const radius = Math.min(containerSize.width, containerSize.height) * 0.6;
                const angle = (index / TOTAL_IMAGES) * 360;
                const rad = (angle * Math.PI) / 180;
                return {
                    x: Math.cos(rad) * radius,
                    y: Math.sin(rad) * radius,
                    rotation: angle + 90,
                    scale: 0.5,
                    opacity: 0,
                };
            }

            default:
                return { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };
        }
    };

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-50 overflow-hidden"
            onClick={onSkip}
        >
            {/* Dark backdrop */}
            <motion.div
                className="absolute inset-0 bg-neutral-950"
                initial={{ opacity: 1 }}
                animate={{ opacity: showContent ? 0 : 1 }}
                transition={{ duration: 0.5 }}
            />

            {/* Animated gradient background */}
            <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === "circle" ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-purple-950/50 to-fuchsia-950/50" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
            </motion.div>

            {/* Cards Container */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative" style={{ width: containerSize.width, height: containerSize.height }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {images.map((src, i) => (
                            <FlipCard
                                key={i}
                                src={src}
                                index={i}
                                target={getCardTarget(i)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Center content - Title reveal */}
            <AnimatePresence>
                {phase === "circle" && !showContent && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10"
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-3xl md:text-5xl font-bold text-white mb-4 px-8 max-w-2xl"
                        >
                            {item?.title || item?.name || 'Loading...'}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-sm text-violet-300/80 font-medium tracking-widest uppercase"
                        >
                            {type === 'movie' ? 'Movie' : 'TV Series'}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Skip button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (onSkip) onSkip();
                }}
                className="absolute bottom-6 right-6 px-4 py-2 text-xs font-medium text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all z-20"
            >
                Skip Intro
            </motion.button>
        </div>
    );
}

import React from 'react';
import { motion } from 'framer-motion';

export const HeroSection = ({ onEnter }) => {
    return (
        <div className="relative h-[80vh] w-full flex flex-col items-center justify-center overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-neutral-950 to-neutral-950" />

            {/* 3D Grid Floor */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[50vh] opacity-30"
                style={{
                    background: 'linear-gradient(to bottom, transparent, var(--color-primary))',
                    maskImage: 'linear-gradient(to bottom, transparent, black)',
                    perspective: '1000px',
                    transform: 'rotateX(80deg) translateZ(-100px)'
                }}
            >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 text-center px-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="mb-6 relative inline-block"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-pink-600 to-blue-600 rounded-full blur opacity-25 animate-pulse" />
                    <span className="relative px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-violet-200 font-medium">
                        Welcome to the Future of Streaming
                    </span>
                </motion.div>

                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 mb-6 drop-shadow-2xl">
                    <img
                        src="/logo.png"
                        alt="Zylmia"
                        className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-4 rounded-2xl shadow-2xl shadow-violet-500/40"
                    />
                    ZYLMIA <br /> UNIVERSE
                </h1>

                <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Experience cinema like never before. Immerse yourself in a world of
                    <span className="text-violet-400"> infinite entertainment</span> and visual splendor.
                </p>

                <motion.div
                    className="flex flex-col md:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {/* We can add primary CTA here if needed, but the dock handles nav */}
                    <div className="flex -space-x-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-neutral-800 flex items-center justify-center text-xs text-white">
                                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full rounded-full" />
                            </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-black bg-violet-600 flex items-center justify-center text-xs text-white font-bold pl-1">
                            +2M
                        </div>
                    </div>
                    <span className="text-sm text-neutral-400">users joined this week</span>
                </motion.div>
            </motion.div>
        </div>
    );
};

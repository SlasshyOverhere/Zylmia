"use client";

import DisplayCards from "../ui/display-cards";
import { Sparkles, Calendar, Bell, PlayCircle, Clock, Film } from "lucide-react";

/**
 * Feature Cards showcasing Zylmia app capabilities
 * Customized for movie/show tracking features
 */
const zylmiaFeatureCards = [
    {
        icon: <Calendar className="w-4 h-4 text-violet-300" />,
        title: "Release Tracking",
        description: "Never miss upcoming releases",
        date: "Track your favorites",
        iconClassName: "bg-violet-800",
        titleClassName: "text-violet-400",
        className:
            "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
        icon: <Bell className="w-4 h-4 text-pink-300" />,
        title: "Episode Alerts",
        description: "New episodes, instantly notified",
        date: "Smart countdown timers",
        iconClassName: "bg-pink-800",
        titleClassName: "text-pink-400",
        className:
            "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
        icon: <PlayCircle className="w-4 h-4 text-cyan-300" />,
        title: "Latest Releases",
        description: "Stream the newest content",
        date: "Updated daily",
        iconClassName: "bg-cyan-800",
        titleClassName: "text-cyan-400",
        className:
            "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
    },
];

function DisplayCardsDemo() {
    return (
        <div className="flex min-h-[400px] w-full items-center justify-center py-20">
            <div className="w-full max-w-3xl">
                <DisplayCards cards={zylmiaFeatureCards} />
            </div>
        </div>
    );
}

export { DisplayCardsDemo, zylmiaFeatureCards };

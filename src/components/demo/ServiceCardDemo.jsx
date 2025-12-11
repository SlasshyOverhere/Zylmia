import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Tv, Sparkles, Heart, Calendar, Bookmark } from 'lucide-react';
import { ServiceCard } from '../ui/service-card';

/**
 * Demo component showcasing the ServiceCard component
 * This can be used as a reference for implementing ServiceCard in other parts of the app
 */
const ServiceCardDemo = () => {
    const navigate = useNavigate();

    const services = [
        {
            title: "Movies",
            description: "Discover blockbusters, classics, and hidden gems from around the world.",
            href: "/movies",
            icon: Film,
            variant: "violet",
        },
        {
            title: "TV Shows",
            description: "Binge-worthy series and limited editions, all in one place.",
            href: "/tvshows",
            icon: Tv,
            variant: "blue",
        },
        {
            title: "Anime",
            description: "Japanese animation masterpieces and trending anime series.",
            href: "/anime",
            icon: Sparkles,
            variant: "pink",
        },
        {
            title: "K-Drama",
            description: "Korean drama sensations that captivate audiences worldwide.",
            href: "/kdrama",
            icon: Heart,
            variant: "emerald",
        },
        {
            title: "Upcoming Releases",
            description: "Stay ahead with personalized upcoming movie recommendations.",
            href: "/upcoming",
            icon: Calendar,
            variant: "orange",
        },
        {
            title: "Watchlist",
            description: "Track your favorite shows with smart episode countdown.",
            href: "/watchlist",
            icon: Bookmark,
            variant: "indigo",
        },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <h2 className="text-2xl font-bold text-white mb-6">Explore Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <ServiceCard
                        key={service.title}
                        title={service.title}
                        description={service.description}
                        href={service.href}
                        icon={service.icon}
                        variant={service.variant}
                        onClick={() => navigate(service.href)}
                        className="min-h-[180px]"
                    />
                ))}
            </div>
        </div>
    );
};

export default ServiceCardDemo;

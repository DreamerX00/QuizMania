"use client";

import React, {
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  SiLinkedin,
  SiInstagram,
  SiDiscord,
  SiX,
  SiFacebook,
  SiReddit,
  SiTelegram,
  SiYoutube,
} from "react-icons/si";
import {
  FiDownload,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiCode,
  FiStar,
  FiAward,
  FiTrendingUp,
} from "react-icons/fi";
import { FaShopify, FaWhatsapp } from "react-icons/fa";
import { FaXmark, FaTerminal, FaCopy } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PinContainer } from "@/components/ui/3d-pin";
import ProfileCard from "@/reactBitBlocks/Components/ProfileCard/ProfileCard";

// Lazy load heavy components
const ThreeDScene = lazy(() => import("./components/ThreeDScene"));
const InteractiveTimeline = lazy(
  () => import("./components/InteractiveTimeline")
);

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Hero Section Component
function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Play/Pause handler
  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Unmute when playing
        if (isMuted) {
          audioRef.current.muted = false;
          setIsMuted(false);
        }
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
      setIsPlaying(false);
    }
  };

  // Mute/Unmute handler
  const handleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle audio errors
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      console.log("Audio can play");
    };

    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("play", () => setIsPlaying(true));

    return () => {
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", () => setIsPlaying(false));
      audio.removeEventListener("pause", () => setIsPlaying(false));
      audio.removeEventListener("play", () => setIsPlaying(true));
    };
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-900 pt-20">
      {/* 3D Background - Lazy loaded */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="w-full h-full bg-slate-900" />}>
          <ThreeDScene />
        </Suspense>
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} loop preload="metadata" style={{ display: "none" }}>
        <source src="/about.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="space-y-8"
        >
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight"
            animate={{
              textShadow: [
                "0 0 20px rgba(34, 211, 238, 0.5)",
                "0 0 40px rgba(59, 130, 246, 0.5)",
                "0 0 20px rgba(34, 211, 238, 0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            About Me
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Crafting digital experiences with cutting-edge technology and
            boundless creativity
          </motion.p>

          {/* Audio Controls */}
          <motion.div
            className="flex items-center justify-center space-x-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePlayPause}
              className="text-white hover:text-cyan-400 transition-colors"
            >
              {isPlaying ? (
                <FiPause className="w-6 h-6" />
              ) : (
                <FiPlay className="w-6 h-6" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleMute}
              className="text-white hover:text-cyan-400 transition-colors"
            >
              {isMuted ? (
                <FiVolumeX className="w-6 h-6" />
              ) : (
                <FiVolume2 className="w-6 h-6" />
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

// Floating Quotes Component
function FloatingQuotes() {
  const quotes = [
    "The best way to predict the future is to invent it. - Alan Kay",
    "Design is not just what it looks like and feels like. Design is how it works. - Steve Jobs",
    "The web is not just a technology, it&apos;s a canvas for human creativity. - Unknown",
    "Code is poetry in motion. - Anonymous",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-40 max-w-sm"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 2 }}
    >
      <Card className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20">
        <CardContent className="p-4">
          <motion.p
            key={currentQuote}
            className="text-white text-sm italic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            &ldquo;{quotes[currentQuote]}&rdquo;
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Profile Card Component
function ProfileCardSection() {
  return (
    <section className="py-24 bg-linear-to-b from-slate-900 to-slate-800 flex justify-center">
      <ProfileCard
        avatarUrl="/profile.png"
        name="Akash Singh"
        handle="Akash08"
        title="Full-Stack Developer & Content Creator"
        status="Online"
        contactText="Contact"
        showUserInfo={true}
        enableTilt={true}
        onContactClick={() =>
          window.open("https://www.linkedin.com/in/akashs08/", "_blank")
        }
        className="max-w-[350px]"
      />
    </section>
  );
}

// Social Media Grid Component
function SocialMediaGrid() {
  const socialPlatforms = [
    {
      name: "LinkedIn",
      icon: SiLinkedin,
      followers: "500+",
      color: "hover:text-blue-400",
      link: "https://linkedin.com/in/akashs08",
    },
    {
      name: "Ayuzera VitaGlow",
      icon: FaShopify,
      followers: "Health Shop",
      color: "hover:text-green-400",
      link: "https://ayuzera.com/VitaGlow",
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      followers: "Channel",
      color: "hover:text-green-400",
      link: "https://whatsapp.com/channel/0029VaAIhmSHwXbFP8mSGy2R",
    },
    {
      name: "Instagram",
      icon: SiInstagram,
      followers: "Chat with ME",
      color: "hover:text-pink-400",
      link: "https://instagram.com/akash.ni.008",
    },
    {
      name: "Discord",
      icon: SiDiscord,
      followers: "Joine My Galaxy",
      color: "hover:text-indigo-400",
      link: "https://discord.gg/QJWmh3hVdu",
    },
    {
      name: "Twitter",
      icon: SiX,
      followers: "Updates an More",
      color: "hover:text-blue-400",
      link: "https://twitter.com/XDreamer0",
    },
    {
      name: "Education",
      icon: SiYoutube,
      followers: "@DreamerBhai",
      color: "hover:text-red-400",
      link: "https://www.youtube.com/@DreamerBhai",
    },
    {
      name: "Gaming",
      icon: SiYoutube,
      followers: "@DreamerX0",
      color: "hover:text-red-400",
      link: "https://www.youtube.com/@DreamerX0",
    },
    {
      name: "Vlogs",
      icon: SiYoutube,
      followers: "@DreamerXVlogs",
      color: "hover:text-red-400",
      link: "https://www.youtube.com/@DreamerXVlogs",
    },
    {
      name: "Facebook",
      icon: SiFacebook,
      followers: "Page",
      color: "hover:text-blue-600",
      link: "https://facebook.com/people/Dreamers-Void/61558241585828",
    },
    {
      name: "Reddit",
      icon: SiReddit,
      followers: "r/DreamersGalaxy",
      color: "hover:text-orange-400",
      link: "https://reddit.com/r/DreamersGalaxy",
    },
    {
      name: "Telegram",
      icon: SiTelegram,
      followers: "t.me/DreamerBros",
      color: "hover:text-blue-400",
      link: "https://t.me/DreamerBros",
    },
  ];

  return (
    <section className="py-24 bg-linear-to-b from-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center text-white mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Connect With Me
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
          {socialPlatforms.map((platform, index) => (
            <motion.a
              key={platform.name}
              href={platform.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-cyan-400/50 transition-all duration-300 h-full">
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <div className="text-4xl mb-4 text-white group-hover:scale-110 transition-transform duration-300">
                    <platform.icon
                      className={`w-12 h-12 md:w-14 md:h-14 ${platform.color}`}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {platform.name}
                  </h3>
                  <p className="text-cyan-400 font-mono text-sm">
                    {platform.followers}
                  </p>
                </div>
              </Card>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

// Projects Showcase Component
function ProjectsShowcase() {
  const projects = [
    {
      title: "QuizMania",
      description:
        "The Ultimate Quiz Platform - Create, Attempt & Explore Quizzes with AI-powered features, earn points & badges, and monetize your knowledge",
      tech: ["Next.js", "Prisma", "PostgreSQL", "WebSocket", "AI Integration"],
      stars: 0,
      demo: "https://quiz-mania-flame.vercel.app/",
      github: "https://github.com/DreamerX00/QuizMania",
    },
    {
      title: "Numa E-Commerce",
      description:
        "A Full Scaled E-Commerce Website Completely Made For Selling Jewellery Online",
      tech: ["Next.js", "Prisma", "MongoDB", "PhonePe API", "Tailwind And 3js"],
      stars: 0,
      demo: "https://numaiin.vercel.app/",
      github: "https://github.com/DreamerX00/numa",
    },
    {
      title: "Dreamer Academy",
      description:
        "A Feature Rich E-Learning Platform Built For Providing Free Learning Resources To Students",
      tech: ["Next.js", "Prisma", "PostgreSQL", "TailwindCSS"],
      stars: 0,
      demo: "https://dreamer-academy.vercel.app/",
      github: "https://github.com/DreamerX00/my-course-managment-webiste",
    },
    {
      title: "Jeevan Full Stack",
      description:
        "Medical Application And Website - Includes All Features Of Medical/Fitness/Pharma/Diet Applications With Simplified UI",
      tech: ["JavaScript", "React", "Node.js", "Express", "PostgreSQL"],
      stars: 4,
      demo: "https://github.com/DreamerX00/Jeevan_Full_Stack",
      github: "https://github.com/DreamerX00/Jeevan_Full_Stack",
    },
  ];

  return (
    <section className="py-24 bg-linear-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center text-white mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Featured Projects
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="h-full"
            >
              <Card className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-cyan-400/50 transition-all duration-300 h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-xl md:text-2xl">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-base">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="bg-cyan-400/20 text-cyan-400 border-cyan-400/30 text-sm"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <FiStar className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {project.stars}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/20"
                        asChild
                      >
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FiCode className="w-4 h-4 mr-1" />
                          Code
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        className="bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600"
                        asChild
                      >
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FiPlay className="w-4 h-4 mr-1" />
                          Demo
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// YouTube Gallery Component
function YouTubeGallery() {
  const videos = [
    {
      id: "nNnc1gLUgp4",
      title: "C Programming Tutorial",
      views: "15.2K",
      description: "Dive In The World Of Programming With Core Fundamentals",
    },
    {
      id: "OCMbcdl4vNg",
      title: "Computer Basics You Should Know",
      views: "8.7K",
      description: "Time To Unlock Your Mind And Dive In Deeper",
    },
    {
      id: "xyiVom983EE",
      title: "Computer Works Like Magic ?",
      views: "12.3K",
      description: "How They Work Exactly Have Your Ever Wondered?",
    },
    {
      id: "jHNb0HRiPf0",
      title: "Do Not Download Every APP",
      views: "9.1K",
      description: "Windows 11 Knows What You Need Then Why Go Extra",
    },
    {
      id: "xxDsq32CZxM",
      title: "Shortcut Keys Used In Industry",
      views: "6.8K",
      description: "Increase Your Productivity 100X faster",
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
            Video Content
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore my latest tutorials and tech insights on YouTube
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-1">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="my-1"
            >
              <PinContainer
                title={`Watch ${video.title}`}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-72 h-64 flex flex-col justify-between">
                  <div className="relative mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-1 px-1">
                    <h3 className="text-white font-semibold text-base leading-tight">
                      {video.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-cyan-400 text-xs font-medium">
                        {video.views} views
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-red-400 text-xs">Free</span>
                      </div>
                    </div>
                  </div>
                </div>
              </PinContainer>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Tech Stack Component
function TechStack() {
  const skills = [
    { name: "JAVA", level: 95, color: "#61DAFB" },
    { name: "SpringBoot", level: 40, color: "#3178C6" },
    { name: "PostGre SQL", level: 88, color: "#339933" },
    { name: "Kotlin", level: 85, color: "#000000" },
    { name: "Next.js", level: 92, color: "#ff5733" },
    { name: "Prisma", level: 87, color: "#7609e4" },
  ];

  return (
    <section className="py-24 bg-linear-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center text-white mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Skills & Expertise
        </motion.h2>

        <div className="max-w-4xl mx-auto space-y-8">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold text-lg">
                  {skill.name}
                </span>
                <span className="text-cyan-400 font-mono text-lg">
                  {skill.level}%
                </span>
              </div>
              <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: skill.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Stats Component
function Stats() {
  const stats = [
    { label: "Projects Completed", value: 5, icon: FiCode },
    { label: "Years Experience", value: 2, icon: FiTrendingUp },
    { label: "GitHub Stars", value: 128, icon: FiStar },
    { label: "Awards Won", value: 12, icon: FiAward },
  ];

  return (
    <section className="py-24 bg-linear-to-b from-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center text-white mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Achievements & Stats
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 text-center h-full">
                <CardContent className="p-6 md:p-8">
                  <motion.div
                    className="text-4xl text-cyan-400 mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="w-12 h-12 md:w-14 md:h-14 mx-auto" />
                  </motion.div>
                  <motion.div
                    className="text-3xl md:text-4xl font-bold text-white mb-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  >
                    {stat.value}+
                  </motion.div>
                  <p className="text-gray-300 text-sm md:text-base">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Mission & Vision Component
function MissionVision() {
  return (
    <section className="py-24 bg-linear-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="text-5xl mb-6">🎯</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Mission
            </h2>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
              To create digital experiences that not only solve problems but
              also inspire and delight users. I believe in pushing the
              boundaries of what&apos;s possible on the web, combining
              cutting-edge technology with thoughtful design to build the future
              of digital interaction.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge
                variant="secondary"
                className="bg-cyan-400/20 text-cyan-400 border-cyan-400/30 text-sm md:text-base px-3 py-1"
              >
                Innovation
              </Badge>
              <Badge
                variant="secondary"
                className="bg-blue-400/20 text-blue-400 border-blue-400/30 text-sm md:text-base px-3 py-1"
              >
                Excellence
              </Badge>
              <Badge
                variant="secondary"
                className="bg-purple-400/20 text-purple-400 border-purple-400/30 text-sm md:text-base px-3 py-1"
              >
                Creativity
              </Badge>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="text-5xl mb-6">🔮</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Vision
            </h2>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
              Envisioning a world where technology seamlessly integrates with
              human experience, creating immersive, accessible, and meaningful
              digital environments. I strive to be at the forefront of this
              transformation, building bridges between imagination and reality.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge
                variant="secondary"
                className="bg-green-400/20 text-green-400 border-green-400/30 text-sm md:text-base px-3 py-1"
              >
                Future
              </Badge>
              <Badge
                variant="secondary"
                className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 text-sm md:text-base px-3 py-1"
              >
                Impact
              </Badge>
              <Badge
                variant="secondary"
                className="bg-pink-400/20 text-pink-400 border-pink-400/30 text-sm md:text-base px-3 py-1"
              >
                Connection
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Easter Egg Component - LEGENDARY MASTERPLAN
const SECRET_TEXT = `Welcome Commander Dreamer...

So Here's A Little Secret:

I Built This Website With My
Creativity, Vision, Prompt Mastery, 
And A Deep Passion For Tech.

But I Didn't Write A Single Line Of Code.

This Project Took 4 Months,
Refining Every Prompt With Precision.

This Is Prompt-Engineering At Its Peak.

People Fear AI, But The Real Power 
Lies With Those Who Master It.

You're Not Replaced By AI...
You're Replaced By Someone Using AI Better.

Now You Know The Truth. 
If You Cleared The Challenge You Will Get 10,000 ₹ Rupees If You Are Indian But If You Are Not Then  You'll Get 10,000$`;

const ENCRYPTED_MESSAGE = "QEB NRFZH YOLTK CLU GRJMP LSBO QEB IXWV ALD";
const DECRYPTED_MESSAGE = "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG";

// Game prompts that will fall
const GAME_PROMPTS = [
  // Programming Languages
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Ruby",
  "Kotlin",
  "Swift",
  "PHP",
  "Scala",
  "Dart",
  "Perl",
  "Haskell",
  "R",
  "Elixir",

  // Frontend Frameworks / Libraries
  "React",
  "Next.js",
  "Vue",
  "Nuxt",
  "Svelte",
  "SvelteKit",
  "Angular",
  "SolidJS",
  "Preact",
  "Alpine.js",
  "Lit",
  "Astro",
  "Qwik",

  // Backend Frameworks
  "Node.js",
  "Express",
  "NestJS",
  "Fastify",
  "Koa",
  "Django",
  "Flask",
  "Spring Boot",
  "Ruby on Rails",
  "Laravel",
  "ASP.NET",
  "Phoenix",
  "Fiber",
  "Actix",

  // UI/UX & Styling
  "Tailwind",
  "Bootstrap",
  "Material UI",
  "Chakra UI",
  "Framer",
  "Motion",
  "Ant Design",
  "Radix UI",
  "ShadCN",
  "Styled Components",
  "Emotion",

  // Databases
  "Prisma",
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "MongoDB",
  "Redis",
  "Supabase",
  "Firebase",
  "PlanetScale",
  "CockroachDB",
  "Neo4j",
  "Cassandra",
  "DynamoDB",

  // DevOps & Infra
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "Vagrant",
  "Nginx",
  "Apache",
  "CI/CD",
  "Jenkins",
  "GitHub Actions",
  "GitLab CI",
  "Travis CI",

  // AI / ML / DS
  "AI",
  "Prompt",
  "Engineering",
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "Scikit-learn",
  "LangChain",
  "HuggingFace",
  "Keras",
  "OpenCV",
  "Pandas",
  "NumPy",
  "Data Science",
  "LLM",
  "ChatGPT",
  "Transformers",
  "YOLO",
  "Whisper",
  "OpenAI",
  "RAG",

  // Web Graphics / 3D
  "Three.js",
  "WebGL",
  "Babylon.js",
  "Canvas",
  "SVG",
  "PixiJS",
  "GSAP",
  "Shader",
  "GLSL",
  "WebGPU",

  // Game Dev
  "Unity",
  "Unreal",
  "Godot",
  "Cocos2d",
  "Phaser",
  "GameMaker",
  "CryEngine",

  // Mobile & Desktop
  "React Native",
  "Flutter",
  "SwiftUI",
  "Jetpack Compose",
  "Electron",
  "Capacitor",
  "Tauri",
  "Ionic",
  "NativeScript",

  // Cloud & SaaS
  "AWS",
  "Azure",
  "GCP",
  "Vercel",
  "Netlify",
  "Railway",
  "Heroku",
  "Render",
  "Cloudflare",
  "DigitalOcean",
  "Firebase Hosting",
  "Supabase Edge",

  // Blockchain
  "Web3",
  "Solidity",
  "Ethereum",
  "Hardhat",
  "Metamask",
  "Polygon",
  "IPFS",
  "Ethers.js",
  "Wagmi",
  "RainbowKit",
  "Foundry",
  "Chainlink",

  // Testing
  "Jest",
  "Vitest",
  "Cypress",
  "Playwright",
  "Mocha",
  "Chai",
  "Testing Library",

  // Others
  "Vite",
  "Webpack",
  "Bun",
  "Parcel",
  "ESLint",
  "Prettier",
  "Zod",
  "tRPC",
  "GraphQL",
  "REST",
  "gRPC",
  "OAuth",
  "JWT",
  "WebSockets",
  "SEO",
  "PWA",
  "i18n",
  "Babel",
  "Monorepo",
  "Nx",
  "Turborepo",
  "Lint",
  "Codegen",
  "DevTools",
  "CLI",
  "Debugger",
  "Hooks",
  "Context",
  "State",
  "Signals",
  "Middleware",

  // Creative / Meta
  "Creative",
  "Tech",
  "Innovation",
  "Future",
  "Code",
  "Development",
  "Frontend",
  "Backend",
  "Fullstack",
  "Design",
  "UX",
  "UI",
];

interface FallingPrompt {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
  color: string;
}

function EasterEgg() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStage, setCurrentStage] = useState<
    "puzzle" | "voice" | "game" | "complete"
  >("puzzle");
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showGlitch, setShowGlitch] = useState(false);
  const [timer, setTimer] = useState(30);
  const [gameScore, setGameScore] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Game state
  const [fallingPrompts, setFallingPrompts] = useState<FallingPrompt[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [gameTime, setGameTime] = useState(120); // 2 minutes for 1200 points
  const [highScore, setHighScore] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [spawnRate, setSpawnRate] = useState(0.3);
  const gameCanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "m") {
        setIsVisible((prev) => !prev);
        setCurrentStage("puzzle");
        setUserInput("");
        setIsCorrect(null);
        setShowGlitch(false);
        setTimer(30);
        setGameScore(0);
        setIsSpeaking(false);
        setFallingPrompts([]);
        setGameActive(false);
        setGameTime(120);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isVisible && currentStage === "puzzle" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setShowGlitch(true);
            setTimeout(() => {
              setIsVisible(false);
              setCurrentStage("puzzle");
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isVisible, currentStage, timer]);

  // Game functions
  const startGame = useCallback(() => {
    setGameActive(true);
    setGameTime(120);
    setGameScore(0);
    setGameSpeed(1);
    setSpawnRate(0.3);
    setFallingPrompts([]);
  }, []);

  const endGame = useCallback(() => {
    setGameActive(false);
    if (gameScore > highScore) {
      setHighScore(gameScore);
    }
  }, [gameScore, highScore]);

  // Game logic
  useEffect(() => {
    if (currentStage === "game" && !gameActive) {
      startGame();
    }
  }, [currentStage, gameActive, startGame]);

  useEffect(() => {
    if (gameActive && gameTime > 0) {
      const interval = setInterval(() => {
        setGameTime((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameActive, gameTime, endGame]);

  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(() => {
        setFallingPrompts((prev) => {
          // Move existing prompts down with current game speed
          const updated = prev
            .map((prompt) => ({
              ...prompt,
              y: prompt.y + prompt.speed * gameSpeed,
            }))
            .filter((prompt) => {
              // Game over if any prompt touches the floor
              if (prompt.y >= 350) {
                endGame();
                return false;
              }
              return prompt.y < 400; // Remove prompts that fall off screen
            });

          // Add new prompt randomly based on current spawn rate
          if (Math.random() < spawnRate) {
            const randomText =
              GAME_PROMPTS[Math.floor(Math.random() * GAME_PROMPTS.length)] ||
              "Quiz";
            const colors = [
              "#00ff88",
              "#ff0088",
              "#0088ff",
              "#ffff00",
              "#ff8800",
              "#ff00ff",
            ];
            const randomColor =
              colors[Math.floor(Math.random() * colors.length)] || "#00ff88";

            const newPrompt: FallingPrompt = {
              id: Date.now() + Math.random(),
              text: randomText,
              x: Math.random() * (gameCanvasRef.current?.clientWidth || 600), // Full width random position
              y: -50,
              speed: 1 + Math.random() * 2,
              color: randomColor,
            };
            return [...updated, newPrompt];
          }
          return updated;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameActive, gameSpeed, spawnRate, endGame]);

  const handlePromptClick = (promptId: number) => {
    setFallingPrompts((prev) => prev.filter((p) => p.id !== promptId));
    setGameScore((prev) => {
      const newScore = prev + 10;

      // Check for ultimate victory - ONLY 1200 points triggers completion
      if (newScore >= 1200) {
        setTimeout(() => {
          setCurrentStage("complete");
          // Epic confetti for ultimate victory
          if (typeof window !== "undefined" && window.confetti) {
            window.confetti({
              particleCount: 500,
              spread: 360,
              origin: { x: 0.5, y: 0.5 },
              colors: [
                "#ff0000",
                "#00ff00",
                "#0000ff",
                "#ffff00",
                "#ff00ff",
                "#00ffff",
              ],
            });
          }
        }, 1000);
        return newScore;
      }

      // Increase difficulty every 30 points
      if (newScore % 30 === 0) {
        setGameSpeed((current) => Math.min(current + 0.5, 6)); // Max speed of 6 for ultimate mode
        setSpawnRate((current) => Math.min(current + 0.1, 1.0)); // Max spawn rate of 1.0
      }

      return newScore;
    });

    // Add visual feedback
    if (typeof window !== "undefined" && window.confetti) {
      window.confetti({
        particleCount: 20,
        spread: 30,
        origin: { x: 0.5, y: 0.8 },
      });
    }
  };

  const handleDecrypt = () => {
    if (userInput.trim().toUpperCase() === DECRYPTED_MESSAGE) {
      setIsCorrect(true);
      setShowGlitch(false);
      setTimeout(() => {
        setCurrentStage("voice");
        // Trigger confetti
        if (typeof window !== "undefined" && window.confetti) {
          window.confetti({
            particleCount: 200,
            spread: 180,
            origin: { y: 0.6 },
          });
        }
      }, 1500);
    } else {
      setIsCorrect(false);
      setShowGlitch(true);
      setTimeout(() => {
        setIsCorrect(null);
        setShowGlitch(false);
      }, 2000);
    }
  };

  const handleVoiceRead = () => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true);

      // Get available voices and select a better one
      const voices = speechSynthesis.getVoices();
      const selectedVoice =
        voices.find(
          (voice) =>
            voice.name.includes("Google") ||
            voice.name.includes("Samantha") ||
            voice.name.includes("Alex") ||
            voice.name.includes("Microsoft David") ||
            voice.name.includes("Microsoft Zira")
        ) ||
        voices[0] ||
        null;

      const utterance = new SpeechSynthesisUtterance(SECRET_TEXT);

      // Voice customization
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = 0.85; // Slightly slower for better clarity
      utterance.pitch = 1.2; // Slightly higher pitch for more engaging tone
      utterance.volume = 0.9;

      // Enhanced text with pauses and emphasis
      const enhancedText = `Welcome! You found the secret component, but the ultimate message lies ahead which requires high skills and passion. So be ready... Muahahahha!`;

      utterance.text = enhancedText;

      utterance.onend = () => {
        setIsSpeaking(false);
        setTimeout(() => setCurrentStage("game"), 1000);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setTimeout(() => setCurrentStage("game"), 1000);
      };

      speechSynthesis.speak(utterance);
    } else {
      setCurrentStage("game");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(SECRET_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleDecrypt();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-9999 flex items-center justify-center bg-linear-to-br from-black/95 to-slate-900/95 backdrop-blur-md"
          onClick={() => setIsVisible(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`relative w-[95%] md:w-[800px] max-w-7xl border rounded-xl shadow-2xl overflow-hidden p-6 md:p-10 ${
              showGlitch
                ? "border-red-500/60 bg-linear-to-br from-red-900/20 to-black animate-pulse"
                : "border-cyan-500/40 bg-linear-to-br from-black to-slate-800"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition text-xl z-10"
              title="Close"
            >
              <FaXmark />
            </button>

            {/* Stage 1: Decryption Puzzle */}
            {currentStage === "puzzle" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400"
              >
                {/* Terminal Header */}
                <div className="flex items-center gap-2 mb-4">
                  <FaTerminal className="text-cyan-400 text-lg animate-pulse" />
                  <h2 className="text-2xl md:text-3xl font-bold text-cyan-400">
                    SYSTEM ACCESS REQUIRED
                  </h2>
                </div>

                {/* Timer */}
                <div className="text-red-400 text-sm mb-4 font-mono">
                  ⏰ TIME REMAINING: {timer}s
                </div>

                {/* Encrypted Message */}
                <div className="bg-black/70 rounded p-4 text-yellow-400 font-mono text-sm md:text-base mb-6 shadow-inner scanlines">
                  <p className="text-lg font-bold mb-2">
                    🔐 ENCRYPTED MESSAGE:
                  </p>
                  <p className="text-xl tracking-wider">{ENCRYPTED_MESSAGE}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Hint: Caesar Cipher (Shift -3)
                  </p>
                </div>

                {/* Input Field */}
                <div className="space-y-4">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Enter decrypted message..."
                    className="w-full p-4 bg-black/50 border border-cyan-500/50 rounded text-green-400 font-mono text-lg focus:border-cyan-400 focus:outline-none"
                  />

                  <div className="flex gap-4">
                    <button
                      onClick={handleDecrypt}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded font-bold transition"
                    >
                      🔓 DECRYPT
                    </button>

                    {isCorrect === false && (
                      <span className="text-red-400 font-mono text-sm flex items-center">
                        ❌ ACCESS DENIED
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stage 2: Voice AI Assistant */}
            {currentStage === "voice" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400"
              >
                {/* AI Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <h2 className="text-2xl md:text-3xl font-bold text-green-400">
                    AI ASSISTANT ACTIVATED
                  </h2>
                </div>

                {/* Voice Wave Animation */}
                <div className="bg-black/70 rounded p-6 mb-6 shadow-inner">
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-green-400 rounded-full"
                        animate={{
                          height: isSpeaking ? [20, 60, 20] : 20,
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: isSpeaking ? Infinity : 0,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>

                  <p className="text-center text-green-400 font-mono">
                    {isSpeaking
                      ? "🎤 Speaking..."
                      : "Ready to read the secret message"}
                  </p>
                </div>

                <button
                  onClick={handleVoiceRead}
                  disabled={isSpeaking}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded font-bold transition"
                >
                  {isSpeaking ? "🔊 Speaking..." : "🎤 Listen to Secret"}
                </button>
              </motion.div>
            )}

            {/* Stage 3: Secret Game */}
            {currentStage === "game" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🎮</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-green-400">
                    CATCH THE PROMPTS
                  </h2>
                </div>

                {/* Game Stats */}
                <div className="flex justify-between items-center mb-4 text-sm">
                  <div className="text-yellow-400 font-bold">
                    Score: {gameScore}
                  </div>
                  <div className="text-red-400 font-bold">
                    Time: {gameTime}s
                  </div>
                  <div className="text-cyan-400 font-bold">
                    High Score: {highScore}
                  </div>
                </div>

                {/* Difficulty Indicator */}
                {gameActive && (
                  <div className="flex justify-center mb-2">
                    <div className="text-center">
                      <div className="text-purple-400 font-bold text-sm">
                        Difficulty: {Math.floor((gameSpeed - 1) * 2) + 1}/6
                      </div>
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-green-400 to-red-500 transition-all duration-300"
                          style={{ width: `${(gameSpeed / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Game Canvas */}
                <div
                  ref={gameCanvasRef}
                  className="relative w-full h-[400px] bg-black/70 rounded border border-green-500/30 overflow-hidden mb-4"
                >
                  {/* Falling Prompts */}
                  {fallingPrompts.map((prompt) => (
                    <motion.div
                      key={prompt.id}
                      initial={{ y: -50 }}
                      animate={{ y: prompt.y }}
                      style={{
                        position: "absolute",
                        left: prompt.x,
                        color: prompt.color,
                      }}
                      className="cursor-pointer font-bold text-lg px-3 py-1 bg-black/50 rounded border border-current hover:scale-110 transition-transform"
                      onClick={() => handlePromptClick(prompt.id)}
                    >
                      {prompt.text}
                    </motion.div>
                  ))}

                  {/* Game Instructions */}
                  {!gameActive && gameTime === 120 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center text-green-400">
                        <p className="text-xl font-bold mb-2">
                          🎯 Click the falling prompts!
                        </p>
                        <p className="text-sm mb-4">Each prompt = 10 points</p>

                        {/* Ultimate Challenge Requirements */}
                        <div className="mb-4 space-y-2">
                          <div className="text-red-400 text-xs">
                            <p>🎯 Goal: Score 1200 points</p>
                            <p>⏰ Time: 2 minutes</p>
                            <p>💀 Game Over if any prompt touches the floor!</p>
                          </div>
                        </div>

                        <button
                          onClick={startGame}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-bold transition"
                        >
                          🚀 Start Ultimate Challenge
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Game Over */}
                  {!gameActive && gameTime === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center text-green-400">
                        <p className="text-xl font-bold mb-2">🏁 Game Over!</p>
                        <p className="text-lg mb-2">Final Score: {gameScore}</p>

                        {/* Ultimate Mode - Only show completion at 1200+ points */}
                        {gameScore >= 1200 && (
                          <p className="text-cyan-400 font-bold text-lg mb-4">
                            🏆 ULTIMATE LEGENDARY BADGE UNLOCKED!
                          </p>
                        )}

                        {/* Ultimate Mode - Show failure if less than 1200 */}
                        {gameScore < 1200 && (
                          <p className="text-red-400 font-bold text-lg mb-4">
                            ❌ Ultimate Challenge Failed! Need 1200 points to
                            win.
                          </p>
                        )}

                        <button
                          onClick={() => setCurrentStage("complete")}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-bold transition"
                        >
                          🎉 Complete Mission
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Game Controls */}
                {gameActive && (
                  <div className="text-center text-sm text-gray-400">
                    Click the falling prompts to score points! 🎯
                  </div>
                )}
              </motion.div>
            )}

            {/* Stage 4: Complete */}
            {currentStage === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🏆</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-cyan-400">
                    MISSION ACCOMPLISHED
                  </h2>
                </div>

                {/* Final Stats */}
                <div className="bg-black/70 rounded p-4 mb-6 shadow-inner">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-yellow-400 font-bold text-lg">
                        Final Score
                      </p>
                      <p className="text-2xl font-bold text-green-400">
                        {gameScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-cyan-400 font-bold text-lg">
                        High Score
                      </p>
                      <p className="text-2xl font-bold text-green-400">
                        {highScore}
                      </p>
                    </div>
                  </div>

                  {/* Badge Display */}
                  <div className="text-center mt-4">
                    {gameScore >= 1200 && (
                      <div className="text-cyan-400 font-bold text-lg mb-2">
                        🏆 ULTIMATE LEGENDARY PROMPT ENGINEER BADGE EARNED!
                      </div>
                    )}
                    {gameScore < 1200 && (
                      <div className="text-red-400 font-bold text-lg mb-2">
                        ❌ Ultimate Challenge Failed! You needed 1200 points to
                        win.
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Secret Message */}
                <div className="bg-black/70 rounded p-4 text-green-400 font-mono text-sm md:text-base h-[260px] overflow-auto shadow-inner scanlines glitch mb-6">
                  <pre className="text-xs">{SECRET_TEXT}</pre>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleCopy}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm px-4 py-2 rounded flex items-center gap-2 transition"
                  >
                    <FaCopy />
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>

                  <p className="text-xs text-cyan-300">
                    🎉 You&apos;ve completed the legendary Easter Egg!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Vibe FX */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent blur-3xl" />
            </div>

            <style jsx>{`
              .scanlines {
                background-image: repeating-linear-gradient(
                  to bottom,
                  rgba(255, 255, 255, 0.02),
                  rgba(255, 255, 255, 0.02) 1px,
                  transparent 1px,
                  transparent 2px
                );
              }
              .glitch {
                animation: glitch 3s infinite linear alternate-reverse;
              }
              @keyframes glitch {
                2% {
                  transform: translate(2px, 0);
                }
                4% {
                  transform: translate(-2px, 0);
                }
                6% {
                  transform: translate(2px, 0);
                }
                8% {
                  transform: translate(-2px, 0);
                }
                10% {
                  transform: translate(0, 0);
                }
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Futuristic Footer Component
function FuturisticFooter() {
  return (
    <footer className="relative py-24 bg-linear-to-b from-slate-900 to-black overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Get In Touch
            </h3>
            <div className="space-y-3 text-gray-300 text-base md:text-lg">
              <p>📍 Delhi, INDIA</p>
              <p>📧 akashsinghaa008@gmail.com</p>
              <p>📱 +91 8851819851</p>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Quick Links
            </h3>
            <div className="space-y-3">
              <a
                href="#"
                className="block text-gray-300 hover:text-cyan-400 transition-colors text-base md:text-lg"
              >
                Portfolio
              </a>
              <a
                href="#"
                className="block text-gray-300 hover:text-cyan-400 transition-colors text-base md:text-lg"
              >
                Blog
              </a>
              <a
                href="https://www.fiverr.com/dreamerx890?public_mode=true"
                target="_blank"
                className="block text-gray-300 hover:text-cyan-400 transition-colors text-base md:text-lg"
              >
                Services
              </a>
              <a
                href="#"
                className="block text-gray-300 hover:text-cyan-400 transition-colors text-base md:text-lg"
              >
                Contact
              </a>
            </div>
          </motion.div>

          {/* AI Assistant */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              AI Assistant
            </h3>
            <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm md:text-base">
                  Online
                </span>
              </div>
              <p className="text-gray-300 text-sm md:text-base mb-4 leading-relaxed">
                Need help? Chat with my AI assistant for instant support.
              </p>
              <Button
                size="sm"
                className="bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600"
              >
                Start Chat
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-white/20 mt-16 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="text-gray-400 text-base md:text-lg">
            © 2025 Akash Singh (DreamerX) ~ Developer. Built with ❤️ using
            Next.js, Three.js, and lots of coffee.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <span className="text-cyan-400 text-2xl">⚡</span>
            <span className="text-blue-400 text-2xl">🚀</span>
            <span className="text-purple-400 text-2xl">🔮</span>
            <span className="text-green-400 text-2xl">✨</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

// Resume Download Component
function ResumeDownload() {
  const handleDownload = () => {
    // Open resume in new tab
    window.open(
      "https://drive.google.com/file/d/1ICuNqtaM2zf_R5-RumkrSeezfm_Bh6TU/view?usp=sharing",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section className="py-24 bg-linear-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Work Together?
          </h2>
          <p className="text-gray-300 mb-8 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Download my resume to learn more about my experience and skills
          </p>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleDownload}
                  size="lg"
                  className="bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold px-8 py-6 text-lg md:text-xl shadow-lg hover:shadow-cyan-400/25 transition-all duration-300"
                >
                  <FiDownload className="w-6 h-6 mr-3" />
                  Download Resume
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to download my resume</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      </div>
    </section>
  );
}

// Main About Page Component
export default function AboutPage() {
  return (
    <>
      <HeroSection />
      <FloatingQuotes />
      <ProfileCardSection />
      <SocialMediaGrid />
      <ProjectsShowcase />
      <YouTubeGallery />
      <TechStack />
      <Stats />
      <Suspense
        fallback={
          <div className="py-24 bg-linear-to-b from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-white text-xl">Loading timeline...</div>
          </div>
        }
      >
        <InteractiveTimeline />
      </Suspense>
      <MissionVision />
      <ResumeDownload />
      <FuturisticFooter />
      <EasterEgg />
    </>
  );
}

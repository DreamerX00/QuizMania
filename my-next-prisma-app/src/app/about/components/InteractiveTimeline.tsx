"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function InteractiveTimeline() {
  const timelineData = [
    {
      year: "2024",
      title: "Top Graduate of the Year",
      description:
        "I began my journey in 2021 with no prior experience in tech. By 2024, I graduated as the highest scorer, having gained extensive knowledge across various domains.",
      icon: "🎓",
    },
    {
      year: "Nov 2024",
      title: "Java Developer",
      description:
        "Took my passion for Java to the next level by building foundational applications and mastering core concepts of object-oriented programming.",
      icon: "💻",
    },
    {
      year: "Jan 2025",
      title: "Exploring Android with Kotlin",
      description:
        "Dove into Android development using Kotlin and Jetpack Compose, crafting intuitive mobile apps and sharpening my UI/UX skills.",
      icon: "🚀",
    },
    {
      year: "April 2025",
      title: "Creative Technologist",
      description:
        "Ventured into 3D graphics, WebGL, and immersive web experiences. Simultaneously leveled up in creative tools like Canva, Premiere Pro, and Filmora.",
      icon: "🎨",
    },
    {
      year: "July 2025",
      title: "Launched This Website",
      description:
        "Built this very website by blending my technical skills with creative vision. With a touch of AI and the right mindset, I proved that possibilities are limitless.",
      icon: "🤖",
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
          My Journey
        </motion.h2>

        <div className="max-w-5xl mx-auto relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-linear-to-b from-cyan-400 to-blue-500"></div>

          {timelineData.map((item, index) => (
            <motion.div
              key={item.year}
              className={`flex items-center mb-12 ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div
                className={`w-1/2 ${
                  index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
                }`}
              >
                <Card className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-cyan-400/50 transition-all duration-300 h-full">
                  <CardContent className="p-6 md:p-8">
                    <div className="text-3xl mb-4">{item.icon}</div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 text-sm md:text-base mb-4 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="text-cyan-400 font-bold text-lg md:text-xl">
                      {item.year}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Dot */}
              <div className="relative z-10 w-8 h-8 md:w-10 md:h-10 bg-cyan-400 rounded-full border-4 border-white shadow-lg"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


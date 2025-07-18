'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Sparkles, 
  Users, 
  Trophy, 
  BookOpen, 
  Target, 
  ArrowRight,
  Play,
  Star,
  Globe,
  CheckCircle,
  Swords
} from 'lucide-react';
import { BackgroundBeams } from '../../components/ui/background-beams';
import { Card3DEffect } from '../../components/ui/3d-card-effect';
import { AnimatedTestimonials } from '../../components/ui/animated-testimonials';
import { Spotlight } from '../../components/ui/spotlight';
import { GlowingEffect } from '../../components/ui/glowing-effect';
import { Sparkles as SparklesComponent } from '../../components/ui/sparkles';
import { HeroHighlight } from '../../components/ui/hero-highlight';
import ScrollFloat from './ScrollFloat';
import CountUp from "@/reactBitBlocks/TextAnimations/CountUp/CountUp";
import { TextEffect } from '../../components/motion-primitives/text-effect';
import { Typewriter } from 'react-simple-typewriter';

export default function HomePage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Generation',
      description: 'Create quizzes instantly using advanced AI models',
      color: 'from-cyan-400 to-blue-500'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of learners worldwide',
      color: 'from-emerald-400 to-teal-500'
    },
    {
      icon: Trophy,
      title: 'Competitive Leaderboards',
      description: 'Compete and track your progress',
      color: 'from-violet-400 to-purple-500'
    },
    {
      icon: Zap,
      title: 'Real-time Results',
      description: 'Get instant feedback and analytics',
      color: 'from-pink-400 to-rose-500'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'Quizzes Created', value: '50,000+', icon: BookOpen },
    { label: 'Questions Answered', value: '2M+', icon: Target },
    { label: 'Countries', value: '150+', icon: Globe }
  ];

  const benefits = [
    "AI-powered quiz generation",
    "Real-time analytics and insights",
    "Global community of learners",
    "Competitive leaderboards",
    "Customizable quiz templates",
    "Mobile-responsive design"
  ];

  const testimonials = [
    {
      quote: "QuizMania is just awesome! The AI quizzes are so accurate, I feel like I'm actually learning something new every day.",
      name: "Tanisha Sahu",
      designation: "MCA Student",
      src: "https://media.licdn.com/dms/image/v2/D5603AQGtV1mE6n2M3Q/profile-displayphoto-scale_400_400/B56ZeVy7vfHoAk-/0/1750564848545?e=1758153600&v=beta&t=NLshKM2A83o16PzvD5CW-_e72nsWWx3mdesE9vGIjCM"
    },
    {
      quote: "Yaar, pehle padhai boring lagti thi, ab toh maza aa gaya! Leaderboard pe naam aane ka alag hi feel hai.",
      name: "Priya Singh",
      designation: "MBA Aspirant",
      src: "https://images.unsplash.com/photo-1745468504065-9a00f0844f97?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      quote: "The best part is ki quizzes har subject ke liye mil jaate hain. Revision ke liye perfect hai!",
      name: "Rohan Verma",
      designation: "CA Finalist",
      src: "https://images.unsplash.com/photo-1581581911147-772c259e7eec?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      quote: "I love how easy it is to create my own quizzes and share with friends. Bahut hi user-friendly hai!",
      name: "Sneha Patel",
      designation: "School Teacher",
      src: "https://plus.unsplash.com/premium_photo-1664478244612-d4b3238abd81?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      quote: "Honestly, QuizMania ne meri preparation next level pe le gayi. Analytics feature is super helpful!",
      name: "Vikram Mehra",
      designation: "UPSC Aspirant",
      src: "https://plus.unsplash.com/premium_photo-1722682239201-21c8173e776b?q=80&w=1143&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      quote: "I was able to crack my campus placement aptitude round thanks to the practice quizzes here.",
      name: "Kunal Raidas",
      designation: "MCA Student",
      src: "https://media.licdn.com/dms/image/v2/D4D35AQE9Yr3n-om2Tw/profile-framedphoto-shrink_400_400/B4DZav67G7HsAc-/0/1746708181814?e=1753293600&v=beta&t=7jEcNd_YB1c_nhS5SG2WPwF6mQbpjGSBn09WGDHH9zM"
    },
    {
      quote: "QuizMania pe quizzes dena matlab time ka best use. Fun bhi hai aur learning bhi!",
      name: "Soni Kumari",
      designation: "Aspiring Developer",
      src: "https://media.licdn.com/dms/image/v2/D5635AQEbbBIQFQ0HqQ/profile-framedphoto-shrink_400_400/B56ZgNcrimG0Ac-/0/1752572279443?e=1753293600&v=beta&t=6tkOK1zze7tVe0igEx8J0Wu6ho0LEfw7aF94V8oaMsk"
    },
    {
      quote: "The interface is so smooth and modern. Mere friends bhi ab yahi use karte hain!",
      name: "Bhawna Sharma",
      designation: "Aspiring Software Developer",
      src: "https://media.licdn.com/dms/image/v2/D5635AQGt83llZpLYfw/profile-framedphoto-shrink_400_400/profile-framedphoto-shrink_400_400/0/1718551576382?e=1753293600&v=beta&t=wO8hdC0Kny7M_vyKKNgiHpgfaF_FJFY1xuvYxhaWIaI"
    },
   
    {
      quote: "The leaderboard keeps me on my toes. Roz check karta hoon ki kaun top pe hai!",
      name: "Siddharth Jain",
      designation: "Banking Aspirant",
      src: "https://plus.unsplash.com/premium_photo-1682092105693-1a2566cf2ee1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fEJhbmslMjBtYW5hZ2VyJTIwaW5kaWFufGVufDB8fDB8fHww"
    },
    {
      quote: "I use QuizMania to prepare for my interviews. The mock tests are very close to real ones.",
      name: "Neha Pillai",
      designation: "Job Seeker",
      src: "https://plus.unsplash.com/premium_photo-1664910500054-608d23c060f8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Q29sbGVnZSUyMGdpcmwlMjBpbmRpYW58ZW58MHx8MHx8fDA%3D"
    },
    {
      quote: "Mujhe sabse zyada pasand hai ki app bilkul free hai aur ads bhi nahi aate!",
      name: "Amitabh Chatterjee",
      designation: "Graduate",
      src: "https://plus.unsplash.com/premium_photo-1734026668803-4ab767f3de76?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDI3fHx8ZW58MHx8fHx8"
    },

    {
      quote: "Bahut hi helpful platform hai, especially jab quick revision karna ho before exams.",
      name: "Tarun Sethi",
      designation: "B.Sc Student",
      src: "https://images.unsplash.com/flagged/photo-1571367034861-e6729ad9c2d5?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
  
    {
      quote: "I recommended QuizMania to my entire study group. Sabko bahut pasand aaya!",
      name: "Kishor Bharti",
      designation: "Geek",
      src: "https://media.licdn.com/dms/image/v2/D4D03AQGGalqYxAzT-A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1708356722670?e=1758153600&v=beta&t=7pVh0Vw7UoGGHL_tPKpkkx2J03i11GkT2H5tabi4LYI"
    },
    {
      quote: "The instant feedback after every quiz helps me track my progress. Bahut motivating hai!",
      name: "Saurabh Khera",
      designation: "APS Head IEEE BVICAM Student Branch",
      src: "https://media.licdn.com/dms/image/v2/D5603AQFIJ3aOD5dCBw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1723625088579?e=1758153600&v=beta&t=jdvTTMq2KXKa_eNhc8HbfMpcTG4-zk7dBWcgwk87K1c"
    }
  ];

  function TextEffectSpeed() {
    return (
      <TextEffect
        preset='fade-in-blur'
        speedReveal={1.1}
        speedSegment={0.3}
        className="block text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-cyan-100 mb-8 leading-relaxed mx-auto text-center"
      >
        Experience the next generation of interactive learning with AI-powered quizzes, real-time analytics, and a global community of knowledge seekers.
      </TextEffect>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section with Background Beams */}
      <section className="relative overflow-hidden py-20">
        <BackgroundBeams className="absolute inset-0" />
        
        <div className="container mx-auto px-2 sm:px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <SparklesComponent className="mb-6">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  <span className="text-slate-800 dark:text-cyan-100 text-sm font-medium">Welcome to the Future of Learning</span>
                </div>
              </SparklesComponent>
              
              <HeroHighlight className="mb-6">
                <div className="w-full flex justify-center items-center">
                  <h1
                    className="w-full max-w-5xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x bg-clip-text text-transparent text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center mx-auto"
                  >
                    <Typewriter
                      words={[
                        'QuizMania',
                        'Made By DreamerX',
                        'Innovation of Akash And Tanisha'
                      ]}
                      loop={0}
                      cursor
                      cursorStyle="_"
                      typeSpeed={120}
                      deleteSpeed={80}
                      delaySpeed={1500}
                    />
                  </h1>
                </div>
              </HeroHighlight>
              
              <TextEffectSpeed />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <GlowingEffect>
                <Link href="/generate-random-quiz">
                  <button className="flex items-center space-x-2 w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold focus:outline-none transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md hover:from-cyan-600 hover:to-blue-600">
                    <Brain className="w-5 h-5" />
                    <span>Generate AI Quiz</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </GlowingEffect>
              
              <Spotlight>
                <Link href="/explore">
                  <button className="flex items-center space-x-2 w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold focus:outline-none transition-all duration-300 bg-cyan-500/10 border border-cyan-500/20 text-slate-700 dark:text-cyan-100 shadow-md hover:bg-cyan-500/20">
                    <Play className="w-5 h-5" />
                    <span>Explore Quizzes</span>
                  </button>
                </Link>
              </Spotlight>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section with 3D Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              // Assign a unique color for each stat
              const iconColors = [
                'text-cyan-400',    // Active Users
                'text-emerald-400', // Quizzes Created
                'text-violet-400',  // Questions Answered
                'text-pink-400',    // Countries
              ];
              // Parse the number for CountUp
              let to = 0;
              let suffix = '';
              if (stat.value.includes('M')) {
                to = parseFloat(stat.value) * 2;
                suffix = 'M+';
              } else if (stat.value.includes('K')) {
                to = parseFloat(stat.value) * 1_000;
                suffix = 'K+';
              } else if (stat.value.includes('+')) {
                to = parseInt(stat.value.replace(/[^\d]/g, ''));
                suffix = '+';
              } else {
                to = parseInt(stat.value.replace(/[^\d]/g, ''));
              }
              return (
                <Card3DEffect key={index} className="futuristic-card p-6 text-center">
                  <IconComponent 
                    className={`w-8 h-8 mx-auto mb-3 ${iconColors[index % iconColors.length]} drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]`} 
                  />
                  <div className="text-2xl font-bold text-slate-800 dark:text-cyan-100 mb-1">
                    <CountUp to={to} duration={2} separator="," />{suffix}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-cyan-200/60">{stat.label}</div>
                </Card3DEffect>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features : Main Options Section with Spotlight */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollFloat
            animationDuration={1}
            ease='back.inOut(2)'
            scrollStart='center bottom+=50%'
            scrollEnd='bottom bottom-=40%'
            stagger={0.03}
            textClassName="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x bg-clip-text text-transparent font-bold"
            containerClassName="text-4xl md:text-5xl mb-6 text-center"
          >
            Features
          </ScrollFloat>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            <Spotlight>
              <Link href="/multiplayer-arena">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="futuristic-card p-6 text-center group cursor-pointer min-h-[260px]"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Swords className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-cyan-100 mb-3">Multiplayer Arena</h3>
                  <p className="text-slate-600 dark:text-cyan-200/70 leading-relaxed">Challenge friends and players in real-time quiz battles</p>
                </motion.div>
              </Link>
            </Spotlight>
            <Spotlight>
              <Link href="/create-quiz/guide">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="futuristic-card p-6 text-center group cursor-pointer min-h-[260px]"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-cyan-100 mb-3">Create Quiz</h3>
                  <p className="text-slate-600 dark:text-cyan-200/70 leading-relaxed">Design your own quizzes</p>
                </motion.div>
              </Link>
            </Spotlight>
            <Spotlight>
              <Link href="/generate-random-quiz">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="futuristic-card p-6 text-center group cursor-pointer min-h-[260px]"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-cyan-100 mb-3">AI Generate</h3>
                  <p className="text-slate-600 dark:text-cyan-200/70 leading-relaxed">Let AI create quizzes for you</p>
                </motion.div>
              </Link>
            </Spotlight>
            <Spotlight>
              <Link href="/leaderboard">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="futuristic-card p-6 text-center group cursor-pointer min-h-[260px]"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-cyan-100 mb-3">Leaderboard</h3>
                  <p className="text-slate-600 dark:text-cyan-200/70 leading-relaxed">See top performers</p>
                </motion.div>
              </Link>
            </Spotlight>
          </div>
        </div>
      </section>

      {/* Benefits Section with Glowing Effects */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollFloat
            animationDuration={1}
            ease='back.inOut(2)'
            scrollStart='center bottom+=50%'
            scrollEnd='bottom bottom-=40%'
            stagger={0.03}
            textClassName="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x bg-clip-text text-transparent font-bold"
            containerClassName="text-4xl md:text-5xl mb-6 text-center"
          >
            Why Choose QuizMania?
          </ScrollFloat>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <GlowingEffect key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="futuristic-card p-6 text-center group cursor-pointer h-full min-h-[300px] flex flex-col justify-center"
                  >
                    <div className="flex-1 flex flex-col justify-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-cyan-100 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 dark:text-cyan-200/70 leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                </GlowingEffect>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits List Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollFloat
            animationDuration={1}
            ease='back.inOut(2)'
            scrollStart='center bottom+=50%'
            scrollEnd='bottom bottom-=40%'
            stagger={0.03}
            textClassName="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x bg-clip-text text-transparent font-bold"
            containerClassName="text-4xl md:text-5xl mb-6 text-center"
          >
            Everything You Need
          </ScrollFloat>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-4 p-4 bg-cyan-500/5 backdrop-blur-sm border border-cyan-500/10 rounded-xl"
                >
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-cyan-100 text-lg">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center mb-2">
          <Sparkles className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mr-2" />
          <ScrollFloat
            animationDuration={1}
            ease='back.inOut(2)'
            scrollStart='center bottom+=50%'
            scrollEnd='bottom bottom-=40%'
            stagger={0.03}
            textClassName="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x bg-clip-text text-transparent font-bold"
            containerClassName="text-4xl md:text-5xl mb-4 text-center"
          >
            What Our Users Say
          </ScrollFloat>
        </div>
        <p className="text-xl text-slate-600 dark:text-cyan-100 max-w-2xl mx-auto">Join thousands of satisfied learners who have transformed their learning experience</p>
      </div>
      <AnimatedTestimonials
        testimonials={testimonials}
        autoplay={true}
      />

      {/* CTA Section with Glowing Effect */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <GlowingEffect className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="futuristic-card p-12 text-center"
            >
              <SparklesComponent>
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Star className="w-10 h-10 text-white" />
                </div>
              </SparklesComponent>
              <h2 className="text-3xl md:text-4xl font-bold futuristic-title mb-4">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl text-slate-600 dark:text-cyan-100 mb-8 max-w-2xl mx-auto">
                Join thousands of learners who are already experiencing the future of education with QuizMania
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GlowingEffect>
                  <Link href="/signup">
                    <button className="futuristic-button text-lg px-8 py-4">
                      Get Started Free
                    </button>
                  </Link>
                </GlowingEffect>
              </div>
            </motion.div>
          </GlowingEffect>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-cyan-500/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold futuristic-title">QuizMania</span>
          </div>
          <p className="text-slate-600 dark:text-cyan-200/60">
            © QuizMania. The future of learning is here.
          </p>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Gem, ShieldCheck, Globe, MessageCircle, Sparkles, 
  MapPin, Award, ChevronRight, Star, Diamond,
  Bot, Eye, Heart, Zap, CheckCircle
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Scroll animations
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  
  // Refs for scroll animations
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const whyRef = useRef(null);
  
  const aboutInView = useInView(aboutRef, { once: true, margin: "-100px" });
  const servicesInView = useInView(servicesRef, { once: true, margin: "-100px" });
  const whyInView = useInView(whyRef, { once: true, margin: "-100px" });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const services = [
    {
      icon: Gem,
      title: "Authentic Ceylon Gems",
      description: "100% natural and unheated Ceylon Blue Sapphires, Padparadscha, Rubies, and more.",
      color: "from-blue-600 to-blue-700"
    },
    {
      icon: Sparkles,
      title: "Expert Lapidary Services",
      description: "Masterful gem cutting and polishing services to maximize brilliance and value of every rough stone.",
      color: "from-purple-600 to-indigo-700"
    },
    {
      icon: Award,
      title: "NGJA Certified",
      description: "Every high-value gem comes with government-approved certification guaranteeing its quality and origin.",
      color: "from-emerald-600 to-emerald-700"
    },
    {
      icon: Globe,
      title: "Global & Local Trading",
      description: "A secure platform for local sellers to showcase their gems and global buyers to purchase with confidence.",
      color: "from-slate-600 to-slate-700"
    },
    {
      icon: Bot,
      title: "AI Virtual Gemologist",
      description: "Experience our cutting-edge AI technology that provides preliminary gemstone identification instantly.",
      color: "from-indigo-600 to-indigo-700"
    }
  ];

  const whyChooseUs = [
    {
      icon: ShieldCheck,
      title: "Trust & Transparency",
      description: "Fully registered and licensed by the National Gem and Jewellery Authority (NGJA)."
    },
    {
      icon: MapPin,
      title: "Direct from Source",
      description: "Ethically sourced directly from Eheliyagoda mines with no middlemen."
    },
    {
      icon: MessageCircle,
      title: "Secure Negotiations",
      description: "Utilize our advanced Direct Admin Chat and Bidding System for completely secure and transparent transactions."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const heroVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-sans">
      {/* Premium Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ y: heroY }}
      >
        {/* Background with glassmorphism effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full filter blur-3xl opacity-20" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-200 rounded-full filter blur-3xl opacity-20" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-slate-200 rounded-full filter blur-3xl opacity-30" />
        </div>
        
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto px-6 text-center"
          initial="hidden"
          animate="visible"
          variants={heroVariants}
        >
          {/* Floating gem icon with premium animation */}
          <motion.div
            className="mb-8 inline-flex"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1, 1.05],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <Diamond className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          
          {/* Premium typography */}
          <motion.h1 
            className="text-5xl md:text-7xl font-serif font-bold text-slate-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover Finest Ceylon Gems
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              from Heart of Eheliyagoda
            </span>
          </motion.h1>
          
          {/* Enhanced subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-slate-600 mb-10 max-w-4xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Welcome to Pinnawala Gems & Lapidary. We bring you the most authentic, ethically sourced, and perfectly cut precious stones directly from the "City of Gems", Sri Lanka.
          </motion.p>
          
          {/* Premium CTA buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -15px rgba(26, 35, 126, 0.15)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/marketplace')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 text-lg flex items-center gap-3 group"
            >
              Explore Our Collection
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02, borderColor: "#3b82f6", color: "#3b82f6" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/messages')}
              className="px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 text-lg flex items-center gap-3 group"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Admin
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Premium Services Section */}
      <motion.section 
        ref={servicesRef}
        className="py-24 px-6 bg-white"
        variants={containerVariants}
        initial="hidden"
        animate={servicesInView ? "visible" : "hidden"}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={itemVariants}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-8">
              Our Services & Features
            </h2>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                variants={itemVariants}
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.15)"
                }}
                onClick={() => service.title === "AI Virtual Gemologist" && navigate('/ai-engine')}
                className={`bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/20 border border-slate-100 hover:border-blue-200 transition-all duration-300 group ${
                  service.title === "AI Virtual Gemologist" ? "cursor-pointer" : ""
                }`}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-slate-600 leading-relaxed font-light">
                  {service.description}
                </p>
                {service.title === "AI Virtual Gemologist" && (
                  <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700 transition-colors">
                    Try Now <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Premium Why Choose Us Section */}
      <motion.section 
        ref={whyRef}
        className="py-24 px-6 bg-gradient-to-br from-slate-50 to-white"
        variants={containerVariants}
        initial="hidden"
        animate={whyInView ? "visible" : "hidden"}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Why Choose Us?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full" />
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Gem className="w-6 h-6 text-white" />
                </div>
                Pinnawala Gems & Lapidary
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Your trusted source for authentic Ceylon gems directly from the heart of Sri Lanka's gem capital.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Location</h4>
              <div className="space-y-2 text-slate-400">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Eheliyagoda, Ratnapura, Sri Lanka
                </p>
                <p className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  NGJA Licensed Gem Dealer
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/marketplace')}
                  className="block text-slate-400 hover:text-white transition-colors text-left"
                >
                  Explore Collection
                </button>
                <button
                  onClick={() => navigate('/messages')}
                  className="block text-slate-400 hover:text-white transition-colors text-left"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="block text-slate-400 hover:text-white transition-colors text-left"
                >
                  Become a Seller
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Pinnawala Gems & Lapidary. All rights reserved.</p>
            <p className="mt-2 text-sm">NGJA Licensed | Sri Lankan Gem Authority Certified</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
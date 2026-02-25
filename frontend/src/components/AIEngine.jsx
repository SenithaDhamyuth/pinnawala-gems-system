import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, ArrowLeft, Scan, Loader2, Sparkles, 
  AlertCircle, Palette, Hexagon, Award, Info, CheckCircle2, XCircle,
  Zap, Database, Eye, TrendingUp, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- 💎 THE EXPANDED GEMS DATABASE ---
const gemDatabase = {
  "Blue Sapphire": {
    localName: "නිල් මැණික් (Ceylon Blue Sapphire)",
    description: "Sri Lanka's pride. World-renowned for unmatched clarity and deep 'cornflower' or 'royal' blue color saturation.",
    colors: ["Cornflower Blue", "Royal Blue", "Pastel Blue", "Peacock Blue"],
    shapes: ["Oval Mixed Cut", "Cushion", "Round Faceted"],
    grade: "Premium value for 'Unheated' (ස්වභාවික) stones with VVS clarity."
  },
  "Pink Sapphire": {
    localName: "රෝස මැණික් (Ceylon Pink Sapphire)",
    description: "A highly sought-after variety of corundum in Sri Lanka, offering a stunning alternative to rubies with delicate to vibrant pink hues.",
    colors: ["Hot Pink", "Pastel Pink", "Purplish Pink", "Baby Pink"],
    shapes: ["Oval", "Cushion", "Round Brilliant"],
    grade: "Vivid 'Hot Pink' unheated stones with excellent clarity command premium prices."
  },
  "Yellow Sapphire": {
    localName: "පුෂ්පරාග (Ceylon Yellow Sapphire)",
    description: "A bright and cheerful corundum variety, highly valued in astrology and as a vibrant jewelry centerpiece.",
    colors: ["Canary Yellow", "Lemon Yellow", "Golden Yellow"],
    shapes: ["Oval", "Cushion", "Emerald Cut"],
    grade: "Natural, unheated stones with strong saturation and no brown/green tints are most valuable."
  },
  "White Sapphire": {
    localName: "සුදු මැණික් (Ceylon White Sapphire)",
    description: "A pure, colorless corundum often used as an excellent, durable alternative to diamonds.",
    colors: ["Colorless", "Faint Blue/Yellow Tint"],
    shapes: ["Round Brilliant", "Oval", "Cushion"],
    grade: "Completely colorless (VVS) stones are the highest grade."
  },
  "Ruby": {
    localName: "රතු කැට (Ceylon Ruby)",
    description: "Famous for bright, lively pinkish-red hues. Ceylon rubies are highly luminous compared to darker counterparts.",
    colors: ["Pinkish Red", "Vivid Red", "Purplish Red"],
    shapes: ["Oval", "Cushion", "Pear"],
    grade: "High value for transparent stones with minimal silk inclusions."
  },
  "Padparadscha": {
    localName: "පද්මරාග (Padparadscha Sapphire)",
    description: "The rarest sapphire. Named after the lotus blossom, featuring a delicate balance of pink and orange.",
    colors: ["Pinkish-Orange (Sunset)", "Salmon", "Peachy Pink"],
    shapes: ["Oval", "Cushion", "Radiant"],
    grade: "Extremely high value. A perfect 50/50 pink-orange balance commands the highest premium."
  },
  "Tourmaline": {
    localName: "තෝරමල්ලි (Ceylon Tourmaline)",
    description: "A versatile gem found in abundance in Sri Lanka, known for a wide and vivid spectrum of colors.",
    colors: ["Canary Yellow", "Mint Green", "Pink", "Bi-color"],
    shapes: ["Emerald Cut", "Octagon", "Oval"],
    grade: "Valued based on color intensity and 'open' (non-dark) color."
  },
  "Spinel": {
    localName: "කිරිංචි (Ceylon Spinel)",
    description: "Historically mistaken for rubies. Spinels are brilliant, singly refractive gems requiring no treatment.",
    colors: ["Cobalt Blue", "Vivid Red", "Neon Pink", "Greyish Blue"],
    shapes: ["Cushion", "Oval", "Round"],
    grade: "Red and Cobalt Blue spinels hold immense market value today."
  },
  "Zircon": {
    localName: "ජාගොන් (Ceylon Zircon)",
    description: "Known for its incredibly high refractive index, giving it a diamond-like fire and brilliance.",
    colors: ["Colorless (Matara Diamond)", "Blue", "Greenish-Yellow", "Brown"],
    shapes: ["Round Brilliant", "Oval"],
    grade: "Blue zircons and internally flawless colorless zircons are highly prized."
  }
};

// --- ✨ PARTICLE BACKGROUND COMPONENT ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, i) => {
        particle.update();
        particle.draw();

        // Draw connections
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-40 z-0"
    />
  );
};

// --- 🎯 GLOWING ORB COMPONENT ---
const GlowingOrb = ({ size = 400, color = "blue", position = "top-right" }) => {
  const positionClasses = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className={`absolute ${positionClasses[position]} w-[${size}px] h-[${size}px] pointer-events-none`}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`w-full h-full bg-${color}-500/20 rounded-full blur-[120px]`}
      />
    </motion.div>
  );
};

const AIEngine = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); 
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await fetch("http://localhost:8000/api/predict-gem", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Server error!");

      const data = await response.json();
      
      // Simulate final progress
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

      if (data.error) {
        alert("AI Error: " + data.error);
      } else {
        setResult({
          gemType: data.gem_type,
          confidence: data.confidence,
          description: data.description
        });
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Backend Connection Failed. Make sure FastAPI is running on Port 8000.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- 🛡️ THE BULLETPROOF MATCHER ---
  const getGemData = (apiGemName) => {
    if (!apiGemName) return null;
    const cleanApiName = String(apiGemName).replace(/[^a-zA-Z]/g, '').toLowerCase();

    for (const [dbKey, dbData] of Object.entries(gemDatabase)) {
      const cleanDbKey = dbKey.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (cleanApiName.includes(cleanDbKey) || cleanDbKey.includes(cleanApiName)) {
        return dbData;
      }
    }
    return null; 
  };

  const gemDetails = result ? getGemData(result.gemType) : null;
  const isErrorOrNotGem = result && (result.gemType === "Unrecognized Gem" || result.gemType === "Not_a_Gem");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      
      {/* Particle Background */}
      <ParticleBackground />

      {/* Glowing Orbs */}
      <GlowingOrb size={600} color="blue" position="top-right" />
      <GlowingOrb size={500} color="cyan" position="bottom-left" />
      
      {/* Top Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center px-6 lg:px-12 py-6 border-b border-white/10 bg-slate-950/40 backdrop-blur-2xl sticky top-0 z-50 relative"
      >
        <motion.button 
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-all duration-300 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full border border-white/10 hover:border-blue-500/50 backdrop-blur-sm"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" /> 
          <span className="font-semibold">Dashboard</span>
        </motion.button>
        
        <div className="mx-auto flex items-center gap-4">
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30 backdrop-blur-sm"
          >
            <Sparkles className="text-blue-400" size={22} />
            <div className="absolute inset-0 bg-blue-400 blur-xl opacity-30"></div>
          </motion.div>
          <div>
            <span className="text-2xl font-black tracking-[0.25em] text-white uppercase block">Neural Engine</span>
            <span className="text-xs text-blue-400 tracking-widest uppercase">MobileNetV2 Architecture</span>
          </div>
        </div>
        
        <div className="w-32 hidden md:flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-500"
          />
          <span className="text-xs text-slate-400">System Online</span>
        </div>
      </motion.nav>

      <main className="max-w-[1500px] mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT PANEL */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col gap-8"
          >
            {/* Header Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-slate-900/90 to-blue-950/50 p-8 rounded-3xl border border-blue-500/20 shadow-2xl relative overflow-hidden backdrop-blur-xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 shadow-lg shadow-blue-500/50"></div>
              <motion.div
                className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="text-blue-400" size={28} />
                  <h2 className="text-3xl font-black text-white tracking-tight">Specimen Upload</h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">Deploy advanced computer vision analysis powered by MobileNetV2 deep learning architecture.</p>
                
                <div className="mt-6 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-slate-400">224x224 Input</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                    <span className="text-slate-400">9 Classes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-slate-400">Real-time</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Upload Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="bg-gradient-to-br from-slate-900/90 to-blue-950/50 p-6 rounded-3xl border border-blue-500/20 shadow-2xl relative overflow-hidden backdrop-blur-xl"
            >
              <div className="relative border-2 border-dashed border-blue-500/30 hover:border-blue-400/60 transition-all duration-500 rounded-3xl bg-slate-950/50 cursor-pointer overflow-hidden min-h-[450px] flex flex-col justify-center items-center group backdrop-blur-sm">
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                />
                
                <AnimatePresence mode="wait">
                  {!previewUrl ? (
                    <motion.div
                      key="upload-prompt"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center z-10 pointer-events-none"
                    >
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-28 h-28 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-6 border border-blue-500/30 backdrop-blur-sm relative"
                      >
                        <UploadCloud size={48} className="text-blue-400" />
                        <motion.div
                          className="absolute inset-0 rounded-full bg-blue-500/20"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>
                      <p className="text-2xl font-bold text-slate-200 mb-2">Initiate Neural Uplink</p>
                      <p className="text-sm text-slate-400 text-center max-w-[280px] leading-relaxed">
                        Drag & drop your gemstone specimen or click to browse local storage
                      </p>
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mt-6 text-blue-400/60"
                      >
                        <Zap size={20} />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative w-full h-full min-h-[450px]"
                    >
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                      />
                      
                      {/* Scanning Effect */}
                      <AnimatePresence>
                        {isAnalyzing && (
                          <>
                            <motion.div 
                              initial={{ top: "0%" }} 
                              animate={{ top: "100%" }} 
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
                              className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_#3b82f6] z-10"
                            >
                              <div className="absolute inset-0 bg-blue-400 blur-md"></div>
                            </motion.div>
                            
                            {/* Corner Indicators */}
                            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                              <motion.div
                                key={corner}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className={`absolute w-6 h-6 border-2 border-blue-400 ${
                                  corner.includes('top') ? 'top-4' : 'bottom-4'
                                } ${
                                  corner.includes('left') ? 'left-4' : 'right-4'
                                } ${
                                  corner.includes('top') && corner.includes('left') ? 'border-r-0 border-b-0' :
                                  corner.includes('top') && corner.includes('right') ? 'border-l-0 border-b-0' :
                                  corner.includes('bottom') && corner.includes('left') ? 'border-r-0 border-t-0' :
                                  'border-l-0 border-t-0'
                                }`}
                              />
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                      
                      {/* Overlay Effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none"></div>
                      
                      {/* Change Image Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-900 text-slate-300 px-4 py-2 rounded-full text-xs font-semibold border border-white/10 hover:border-blue-500/50 transition-all backdrop-blur-sm z-20"
                      >
                        Change Image
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress Bar */}
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="bg-slate-950/50 rounded-full p-1 border border-blue-500/20">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full relative overflow-hidden"
                      >
                        <motion.div
                          animate={{ x: ["0%", "100%"] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                      </motion.div>
                    </div>
                    <div className="flex justify-between items-center mt-2 px-1">
                      <span className="text-xs text-slate-400">Processing Neural Matrix</span>
                      <span className="text-xs text-blue-400 font-bold">{Math.round(progress)}%</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analyze Button */}
              <motion.button 
                disabled={!selectedImage || isAnalyzing} 
                onClick={handleAnalyze}
                whileHover={selectedImage && !isAnalyzing ? { scale: 1.02, y: -2 } : {}}
                whileTap={selectedImage && !isAnalyzing ? { scale: 0.98 } : {}}
                className={`w-full mt-6 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden ${
                  !selectedImage 
                    ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-white/5' 
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] border border-blue-500/50'
                }`}
              >
                {selectedImage && !isAnalyzing && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                )}
                
                <span className="relative z-10 flex items-center gap-3">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin" size={24} /> 
                      Executing Neural Scan
                    </>
                  ) : (
                    <>
                      <Scan size={24} /> 
                      {selectedImage ? "Analyze Specimen" : "Awaiting Image Upload"}
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* RIGHT PANEL */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.3, duration: 0.7 }}
            className="lg:col-span-7 bg-gradient-to-br from-slate-900/90 to-blue-950/50 rounded-3xl border border-blue-500/20 shadow-2xl relative overflow-hidden min-h-[700px] flex flex-col backdrop-blur-xl"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>

            <AnimatePresence mode="wait">
              {!isAnalyzing && !result && (
                <motion.div
                  key="standby"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex-1 flex flex-col items-center justify-center p-12 text-center relative z-10"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    }}
                  >
                    <Hexagon size={120} strokeWidth={1} className="text-blue-500/30 mb-8" />
                  </motion.div>
                  
                  <motion.h3 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-3xl font-light tracking-[0.3em] text-slate-300 uppercase mb-3"
                  >
                    System Standby
                  </motion.h3>
                  
                  <p className="text-slate-400 max-w-md leading-relaxed">
                    Upload a gemstone specimen to retrieve comprehensive market intelligence and gemological analysis
                  </p>

                  <div className="mt-12 grid grid-cols-3 gap-6 w-full max-w-xl">
                    {[
                      { icon: Eye, label: "Visual Analysis" },
                      { icon: Database, label: "Database Match" },
                      { icon: TrendingUp, label: "Market Data" }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col items-center gap-3 p-4 bg-slate-900/50 rounded-2xl border border-blue-500/10"
                      >
                        <item.icon className="text-blue-400" size={24} />
                        <span className="text-xs text-slate-400 text-center">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {isAnalyzing && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center p-12 relative z-10"
                >
                  <div className="relative w-40 h-40 mb-12">
                    {/* Outer Ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-slate-800 rounded-full"
                    />
                    
                    {/* Spinning Ring */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-2 border-4 border-blue-500 rounded-full border-t-transparent border-r-transparent"
                    />
                    
                    {/* Inner Glow */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-8 bg-blue-500/30 rounded-full blur-xl"
                    />
                    
                    {/* Center Icon */}
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <Sparkles className="text-blue-400" size={48} />
                    </motion.div>
                  </div>
                  
                  <motion.h3 
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-4xl font-black text-white mb-3 tracking-tight"
                  >
                    Processing Data Matrix
                  </motion.h3>
                  
                  <p className="text-slate-400 font-light mb-8 text-center max-w-md">
                    Cross-referencing neural output with Sri Lankan gemological database
                  </p>

                  {/* Processing Steps */}
                  <div className="space-y-3 w-full max-w-md">
                    {[
                      { label: "Image Preprocessing", delay: 0 },
                      { label: "Feature Extraction", delay: 0.5 },
                      { label: "Classification", delay: 1 },
                      { label: "Database Matching", delay: 1.5 },
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: step.delay }}
                        className="flex items-center gap-3 bg-slate-950/50 px-4 py-3 rounded-xl border border-blue-500/10"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: step.delay }}
                          className="w-2 h-2 rounded-full bg-blue-500"
                        />
                        <span className="text-sm text-slate-300">{step.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative z-10 p-8 sm:p-12 overflow-y-auto max-h-[700px] custom-scrollbar"
                >
                  {/* Result Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
                    <div className="flex-1">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm"
                      >
                        {isErrorOrNotGem ? <XCircle size={16}/> : <CheckCircle2 size={16} />}
                        {isErrorOrNotGem ? "Analysis Failed" : "Match Verified"}
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-blue-400"
                        />
                      </motion.div>
                      
                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-4 tracking-tighter uppercase leading-none"
                      >
                        {result.gemType.replace(/_/g, ' ')}
                      </motion.h2>
                      
                      {gemDetails && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-2xl text-blue-400 font-medium tracking-wide"
                        >
                          {gemDetails.localName}
                        </motion.p>
                      )}
                    </div>
                    
                    {/* Confidence Score */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-slate-950/80 to-blue-950/40 p-6 rounded-3xl border border-blue-500/20 text-center min-w-[160px] shadow-xl backdrop-blur-sm relative overflow-hidden"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-500/20 blur-2xl"
                      />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Shield className="text-blue-400" size={18} />
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Confidence</p>
                        </div>
                        <motion.p 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          className={`text-5xl font-black ${
                            result.confidence > 90 ? 'text-green-400' : 
                            result.confidence > 70 ? 'text-blue-400' : 
                            'text-amber-400'
                          }`}
                        >
                          {result.confidence}%
                        </motion.p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Divider */}
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mb-10"
                  />

                  {isErrorOrNotGem ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl"></div>
                      <AlertCircle className="text-red-400 mb-4" size={36} />
                      <h3 className="text-2xl font-bold text-red-200 mb-3">Review Required</h3>
                      <p className="text-red-200/70 text-lg leading-relaxed">{result.description}</p>
                    </motion.div>
                  ) : (
                    gemDetails ? (
                      <div className="space-y-6">
                        {/* Description Card */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="bg-gradient-to-br from-slate-950/80 to-blue-950/40 border border-blue-500/20 p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300"
                        >
                          <motion.div
                            className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                          />
                          
                          <div className="flex items-center gap-3 mb-5 text-blue-400 relative z-10">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                              <Info size={22} />
                            </div>
                            <span className="font-bold uppercase tracking-widest text-sm">Market Overview</span>
                          </div>
                          
                          <p className="text-slate-300 leading-relaxed text-lg font-light relative z-10">
                            {gemDetails.description}
                          </p>
                        </motion.div>

                        {/* Colors & Shapes Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Colors Card */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gradient-to-br from-slate-950/80 to-pink-950/20 border border-pink-500/20 p-8 rounded-3xl hover:border-pink-500/40 transition-all duration-300 group backdrop-blur-sm relative overflow-hidden"
                          >
                            <motion.div
                              className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"
                              animate={{
                                scale: [1, 1.3, 1],
                              }}
                              transition={{ duration: 4, repeat: Infinity }}
                            />
                            
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                              <motion.div 
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.5 }}
                                className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300"
                              >
                                <Palette size={22} />
                              </motion.div>
                              <span className="font-bold text-slate-200 uppercase tracking-widest text-sm">Ceylon Colors</span>
                            </div>
                            
                            <ul className="space-y-3 relative z-10">
                              {gemDetails.colors.map((color, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.7 + i * 0.1 }}
                                  className="text-slate-300 flex items-center gap-3 font-light group/item"
                                >
                                  <motion.span 
                                    whileHover={{ scale: 1.5 }}
                                    className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-pink-400"
                                  />
                                  <span className="group-hover/item:text-pink-300 transition-colors">{color}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>

                          {/* Shapes Card */}
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gradient-to-br from-slate-950/80 to-purple-950/20 border border-purple-500/20 p-8 rounded-3xl hover:border-purple-500/40 transition-all duration-300 group backdrop-blur-sm relative overflow-hidden"
                          >
                            <motion.div
                              className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"
                              animate={{
                                scale: [1, 1.3, 1],
                              }}
                              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                            />
                            
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                              <motion.div 
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.5 }}
                                className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300"
                              >
                                <Hexagon size={22} />
                              </motion.div>
                              <span className="font-bold text-slate-200 uppercase tracking-widest text-sm">Common Shapes</span>
                            </div>
                            
                            <ul className="space-y-3 relative z-10">
                              {gemDetails.shapes.map((shape, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.7 + i * 0.1 }}
                                  className="text-slate-300 flex items-center gap-3 font-light group/item"
                                >
                                  <motion.span 
                                    whileHover={{ scale: 1.5 }}
                                    className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-400"
                                  />
                                  <span className="group-hover/item:text-purple-300 transition-colors">{shape}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>
                        </div>

                        {/* Grade Card */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="bg-gradient-to-br from-amber-500/10 via-slate-950/80 to-slate-950/80 border border-amber-500/30 p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300"
                        >
                          <motion.div
                            className="absolute -bottom-10 -right-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                          />
                          
                          <div className="flex items-center gap-3 mb-5 text-amber-400 relative z-10">
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Award size={28} />
                            </motion.div>
                            <span className="font-bold uppercase tracking-widest text-sm">Quality & Valuation</span>
                          </div>
                          
                          <p className="text-amber-100/80 leading-relaxed text-lg font-light relative z-10">
                            {gemDetails.grade}
                          </p>
                        </motion.div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-blue-500/5 p-8 rounded-3xl border border-blue-500/20 text-center backdrop-blur-sm"
                      >
                        <Database className="text-blue-400 mx-auto mb-4" size={40} />
                        <p className="text-slate-300 text-lg mb-2">Specimen identified, but detailed market data is currently unavailable.</p>
                        <p className="text-slate-500 text-sm">Database sync pending for: <span className="text-blue-400 font-semibold">{result.gemType}</span></p>
                      </motion.div>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AIEngine;
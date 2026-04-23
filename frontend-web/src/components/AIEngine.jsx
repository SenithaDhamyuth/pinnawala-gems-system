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

// --- ✨ SUBTLE PARTICLE BACKGROUND COMPONENT ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const particleCount = 30;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.12 + 0.04;
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
        ctx.fillStyle = `rgba(30, 64, 175, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle, i) => {
        particle.update();
        particle.draw();
        particles.slice(i + 1).forEach(other => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(30, 64, 175, ${0.04 * (1 - dist / 180)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });
      requestAnimationFrame(animate);
    };

    animate();
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.6 }} />;
};

// --- GEOMETRIC ACCENT COMPONENT ---
const GeometricAccent = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.03]"
      style={{
        background: 'radial-gradient(circle at 70% 30%, #1e3a8a 0%, transparent 65%)',
      }}
    />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.04]"
      style={{
        background: 'radial-gradient(circle at 30% 70%, #1d4ed8 0%, transparent 65%)',
      }}
    />
    {/* Subtle grid pattern */}
    <div className="absolute inset-0" style={{
      backgroundImage: `linear-gradient(rgba(30,64,175,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(30,64,175,0.025) 1px, transparent 1px)`,
      backgroundSize: '60px 60px'
    }} />
  </div>
);

// --- CERTIFICATE WATERMARK ---
const CertificateWatermark = () => (
  <div className="absolute bottom-8 right-8 opacity-[0.035] pointer-events-none select-none flex flex-col items-end">
    <div className="text-[80px] font-serif font-bold text-blue-900 leading-none tracking-widest">GIA</div>
    <div className="text-xs font-bold text-blue-900 tracking-[0.4em] uppercase">Ceylon Gemological Authority</div>
  </div>
);

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
          if (prev >= 95) { clearInterval(interval); return 95; }
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
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));
      if (data.error) {
        alert("AI Error: " + data.error);
      } else {
        setResult({ gemType: data.gem_type, confidence: data.confidence, description: data.description });
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
      if (cleanApiName.includes(cleanDbKey) || cleanDbKey.includes(cleanApiName)) return dbData;
    }
    return null;
  };

  const gemDetails = result ? getGemData(result.gemType) : null;
  const isErrorOrNotGem = result && (result.gemType === "Unrecognized Gem" || result.gemType === "Not_a_Gem");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden relative"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      <ParticleBackground />
      <GeometricAccent />

      {/* ── NAVIGATION ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80"
        style={{ boxShadow: '0 1px 0 0 rgba(30,64,175,0.06), 0 4px 16px 0 rgba(0,0,0,0.04)' }}
      >
        <div className="max-w-[1500px] mx-auto flex items-center px-6 lg:px-12 py-4">
          <motion.button
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-800 transition-colors duration-200 text-sm font-medium tracking-wide"
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            <ArrowLeft size={16} />
            <span>Return</span>
          </motion.button>

          <div className="mx-auto flex items-center gap-4">
            {/* Logo mark */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-sm overflow-hidden">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-20"
                style={{ background: 'conic-gradient(from 0deg, #1d4ed8, #60a5fa, #1d4ed8)' }}
              />
              <Sparkles className="text-blue-700 relative z-10" size={18} />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-950 tracking-wide leading-tight" style={{ letterSpacing: '0.06em' }}>
                NEURAL VALUATION
              </div>
              <div className="text-[9px] text-slate-400 tracking-[0.3em] uppercase" style={{ fontFamily: 'system-ui, sans-serif' }}>
                Ceylon Gemological Institute · System v2.4.0
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2" style={{ fontFamily: 'system-ui, sans-serif' }}>
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
            />
            <span className="text-[10px] font-semibold text-slate-400 tracking-widest hidden sm:block">ONLINE</span>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-[1500px] mx-auto px-6 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ──────────────────────────────────────────
              LEFT PANEL
          ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Header Info Card */}
            <motion.div
              whileHover={{ y: -1 }}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden relative"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(30,64,175,0.05)' }}
            >
              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400" />
              <div className="p-7">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Database size={18} className="text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-950 tracking-wide leading-tight mb-1">Specimen Analysis</h2>
                    <p className="text-slate-500 text-sm leading-relaxed" style={{ fontFamily: 'system-ui, sans-serif' }}>
                      Upload a clear photograph of your gemstone. Our AI cross-references refractive properties with the Ceylon database.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 pt-4 border-t border-slate-100" style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {[
                    { dot: 'bg-blue-500', label: '224×224 Input' },
                    { dot: 'bg-cyan-500', label: '9 Gem Classes' },
                    { dot: 'bg-emerald-500', label: 'Real-time' },
                  ].map(({ dot, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      <span className="text-[11px] text-slate-400 font-medium tracking-wide">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 relative overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(30,64,175,0.05)' }}
            >
              {/* Drop zone */}
              <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors duration-300 rounded-xl bg-slate-50/60 cursor-pointer overflow-hidden min-h-[420px] flex flex-col justify-center items-center group">
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
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center z-10 pointer-events-none px-6 text-center"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-20 h-20 bg-white border-2 border-blue-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm relative overflow-hidden"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="absolute inset-0 bg-blue-50"
                        />
                        <UploadCloud size={32} className="text-blue-500 relative z-10" />
                      </motion.div>

                      <p className="text-lg font-bold text-blue-950 mb-1.5 tracking-wide">Upload Specimen</p>
                      <p className="text-sm text-slate-400 max-w-[260px] leading-relaxed" style={{ fontFamily: 'system-ui, sans-serif' }}>
                        Drag & drop your gemstone image, or click to browse
                      </p>
                      <p className="mt-3 text-[11px] text-slate-300 tracking-widest uppercase" style={{ fontFamily: 'system-ui, sans-serif' }}>
                        JPG · PNG · WEBP
                      </p>

                      {/* Subtle decorative diamonds */}
                      <div className="mt-8 flex items-center gap-3 opacity-30">
                        {[8, 12, 8].map((size, i) => (
                          <motion.div
                            key={i}
                            animate={{ rotate: 45, scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            className="bg-blue-300 rounded-sm"
                            style={{ width: size, height: size }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative w-full h-full min-h-[420px]"
                    >
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover rounded-xl"
                      />

                      {/* Clean scan line for light theme */}
                      <AnimatePresence>
                        {isAnalyzing && (
                          <>
                            <motion.div
                              initial={{ top: "0%" }}
                              animate={{ top: "100%" }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                              className="absolute left-0 w-full h-px z-10"
                              style={{
                                background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.8), rgba(147,197,253,1), rgba(59,130,246,0.8), transparent)',
                                boxShadow: '0 0 12px 2px rgba(59,130,246,0.4)'
                              }}
                            />
                            {/* Corner brackets */}
                            {[
                              ['top-3 left-3', 'border-t-2 border-l-2'],
                              ['top-3 right-3', 'border-t-2 border-r-2'],
                              ['bottom-3 left-3', 'border-b-2 border-l-2'],
                              ['bottom-3 right-3', 'border-b-2 border-r-2'],
                            ].map(([pos, border], i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                className={`absolute w-5 h-5 ${pos} ${border} border-blue-400`}
                              />
                            ))}
                          </>
                        )}
                      </AnimatePresence>

                      {/* Light vignette overlay */}
                      <div className="absolute inset-0 rounded-xl" style={{
                        background: 'linear-gradient(to top, rgba(255,255,255,0.5) 0%, transparent 40%, rgba(255,255,255,0.25) 100%)'
                      }} />

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:border-blue-300 transition-all shadow-sm z-20"
                        style={{ fontFamily: 'system-ui, sans-serif' }}
                      >
                        Change
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
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="bg-slate-100 rounded-full p-0.5 border border-slate-200" style={{ fontFamily: 'system-ui, sans-serif' }}>
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        className="h-1.5 rounded-full relative overflow-hidden"
                        style={{ background: 'linear-gradient(90deg, #1e40af, #3b82f6, #93c5fd)' }}
                      >
                        <motion.div
                          animate={{ x: ["0%", "100%"] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 w-1/3 bg-white/40"
                        />
                      </motion.div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[11px] text-slate-400 tracking-wide">Processing Neural Matrix</span>
                      <span className="text-[11px] text-blue-600 font-bold">{Math.round(progress)}%</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analyze Button */}
              <motion.button
                disabled={!selectedImage || isAnalyzing}
                onClick={handleAnalyze}
                whileHover={selectedImage && !isAnalyzing ? { y: -1 } : {}}
                whileTap={selectedImage && !isAnalyzing ? { scale: 0.98 } : {}}
                className={`w-full mt-4 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all duration-300 tracking-wide relative overflow-hidden ${
                  !selectedImage
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
                    : 'text-white border border-blue-700/30'
                }`}
                style={selectedImage && !isAnalyzing ? {
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
                  boxShadow: '0 4px 14px rgba(30,64,175,0.3), 0 1px 3px rgba(30,64,175,0.2)',
                  fontFamily: 'system-ui, sans-serif'
                } : { fontFamily: 'system-ui, sans-serif' }}
              >
                {selectedImage && !isAnalyzing && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {isAnalyzing ? (
                    <><Loader2 className="animate-spin" size={20} /> Executing Neural Scan</>
                  ) : (
                    <><Scan size={20} /> {selectedImage ? "Analyse Specimen" : "Awaiting Image Upload"}</>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* ──────────────────────────────────────────
              RIGHT PANEL — CERTIFICATE
          ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 relative overflow-hidden min-h-[680px] flex flex-col"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 16px 48px rgba(30,64,175,0.07)' }}
          >
            {/* Certificate header band */}
            <div className="h-1.5 bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 flex-shrink-0" />

            {/* Watermark */}
            <CertificateWatermark />

            {/* Certificate top label */}
            <div className="px-8 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0" style={{ fontFamily: 'system-ui, sans-serif' }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-900 rounded flex items-center justify-center">
                  <div className="w-3 h-3 border border-white/60 rotate-45 rounded-sm" />
                </div>
                <span className="text-[11px] font-bold text-blue-900 tracking-[0.25em] uppercase">Gemological Analysis Report</span>
              </div>
              <span className="text-[10px] text-slate-300 tracking-widest uppercase">Ceylon Registry</span>
            </div>

            <AnimatePresence mode="wait">
              {/* ── IDLE STATE ── */}
              {!isAnalyzing && !result && (
                <motion.div
                  key="standby"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center p-12 text-center relative z-10"
                >
                  {/* Decorative gem icon */}
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="mb-8 opacity-10"
                  >
                    <Hexagon size={100} strokeWidth={0.8} className="text-blue-900" />
                  </motion.div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mb-8">
                    <div className="w-16 h-16 border border-blue-100 rounded-full flex items-center justify-center bg-blue-50/50">
                      <div className="w-8 h-8 border border-blue-200 rotate-45 rounded-sm flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-300 rounded-full" />
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 text-[11px] font-bold tracking-[0.4em] uppercase mb-3 mt-20" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    Awaiting Specimen
                  </p>
                  <p className="text-slate-400 max-w-xs leading-relaxed text-sm" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    Upload a gemstone photograph to generate a complete gemological analysis certificate.
                  </p>

                  <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-md">
                    {[
                      { icon: Eye, label: "Visual Analysis", sub: "CNN Classification" },
                      { icon: Database, label: "Database Match", sub: "Ceylon Registry" },
                      { icon: TrendingUp, label: "Market Data", sub: "Live Valuation" }
                    ].map(({ icon: Icon, label, sub }, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100"
                        style={{ fontFamily: 'system-ui, sans-serif' }}
                      >
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Icon className="text-blue-600" size={16} />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 text-center leading-tight">{label}</span>
                        <span className="text-[10px] text-slate-300 text-center">{sub}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── ANALYZING STATE ── */}
              {isAnalyzing && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center p-12 relative z-10"
                >
                  {/* Clean spinner for light theme */}
                  <div className="relative w-28 h-28 mb-10">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-slate-100"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-3 rounded-full border-2 border-blue-200"
                    />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-6 rounded-full border-2 border-blue-500 border-t-transparent"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Sparkles className="text-blue-600" size={22} />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-bold text-blue-950 mb-2 tracking-wide">Processing Data Matrix</h3>
                  <p className="text-slate-400 text-sm mb-8 text-center max-w-xs" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    Cross-referencing neural output with Sri Lankan gemological database
                  </p>

                  <div className="space-y-2.5 w-full max-w-sm" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    {[
                      { label: "Image Preprocessing", delay: 0 },
                      { label: "Feature Extraction", delay: 0.4 },
                      { label: "Classification Engine", delay: 0.8 },
                      { label: "Database Matching", delay: 1.2 },
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: step.delay }}
                        className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: step.delay }}
                          className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"
                        />
                        <span className="text-sm text-slate-500 font-medium">{step.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── RESULTS STATE — CERTIFICATE LAYOUT ── */}
              {result && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 p-8 overflow-y-auto max-h-[680px]"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
                >
                  {/* ── STATUS BADGE ── */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mb-6"
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                  >
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border ${
                      isErrorOrNotGem
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isErrorOrNotGem
                        ? <XCircle size={12} />
                        : <CheckCircle2 size={12} />
                      }
                      {isErrorOrNotGem ? "Analysis Failed" : "Specimen Identified"}
                    </div>
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] text-slate-300 tracking-widest" style={{ fontFamily: 'system-ui, sans-serif' }}>
                      REF·{Date.now().toString(36).toUpperCase()}
                    </span>
                  </motion.div>

                  {/* ── GEM NAME HEADER ── */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-8">
                    <div className="flex-1 min-w-0">
                      <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl font-bold text-blue-950 tracking-tight leading-tight mb-2 uppercase"
                        style={{ letterSpacing: '-0.01em' }}
                      >
                        {result.gemType.replace(/_/g, ' ')}
                      </motion.h2>

                      {gemDetails && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-blue-500 font-medium text-base"
                          style={{ fontFamily: 'system-ui, sans-serif' }}
                        >
                          {gemDetails.localName}
                        </motion.p>
                      )}
                    </div>

                    {/* Confidence Score Card */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 }}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center flex-shrink-0 min-w-[140px]"
                      style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <Shield size={12} className="text-slate-400" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Confidence</p>
                      </div>
                      <motion.p
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                        className={`text-4xl font-black leading-none ${
                          result.confidence > 90 ? 'text-emerald-600' :
                          result.confidence > 70 ? 'text-blue-600' :
                          'text-amber-500'
                        }`}
                      >
                        {result.confidence}%
                      </motion.p>
                      <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            result.confidence > 90 ? 'bg-emerald-500' :
                            result.confidence > 70 ? 'bg-blue-500' :
                            'bg-amber-400'
                          }`}
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* Divider with ornament */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex items-center gap-3 mb-7"
                  >
                    <div className="flex-1 h-px bg-slate-200" />
                    <div className="w-2 h-2 rotate-45 bg-blue-300 rounded-sm flex-shrink-0" />
                    <div className="flex-1 h-px bg-slate-200" />
                  </motion.div>

                  {/* ── ERROR STATE ── */}
                  {isErrorOrNotGem ? (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-red-50 border border-red-100 p-6 rounded-xl"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="text-red-400 flex-shrink-0" size={22} />
                        <h3 className="text-lg font-bold text-red-800">Review Required</h3>
                      </div>
                      <p className="text-red-600 leading-relaxed" style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.9rem' }}>
                        {result.description}
                      </p>
                    </motion.div>
                  ) : gemDetails ? (
                    <div className="space-y-5">

                      {/* ── DESCRIPTION / OVERVIEW ── */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-blue-50/60 border border-blue-100 rounded-xl p-6"
                      >
                        <div className="flex items-center gap-2 mb-3" style={{ fontFamily: 'system-ui, sans-serif' }}>
                          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Info size={13} className="text-blue-600" />
                          </div>
                          <span className="text-[11px] font-bold text-blue-700 tracking-[0.2em] uppercase">Market Overview</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-sm" style={{ fontFamily: 'system-ui, sans-serif' }}>
                          {gemDetails.description}
                        </p>
                      </motion.div>

                      {/* ── COLORS + SHAPES GRID ── */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Colors */}
                        <motion.div
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-pink-200 transition-colors duration-300 group"
                          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                        >
                          <div className="flex items-center gap-2 mb-4" style={{ fontFamily: 'system-ui, sans-serif' }}>
                            <div className="w-7 h-7 bg-pink-50 rounded-lg flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                              <Palette size={14} className="text-pink-500" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 tracking-[0.18em] uppercase">Ceylon Colors</span>
                          </div>
                          <ul className="space-y-2" style={{ fontFamily: 'system-ui, sans-serif' }}>
                            {gemDetails.colors.map((color, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.55 + i * 0.07 }}
                                className="flex items-center gap-2.5 text-slate-600 text-sm"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 flex-shrink-0" />
                                {color}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>

                        {/* Shapes */}
                        <motion.div
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-violet-200 transition-colors duration-300 group"
                          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                        >
                          <div className="flex items-center gap-2 mb-4" style={{ fontFamily: 'system-ui, sans-serif' }}>
                            <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                              <Hexagon size={14} className="text-violet-500" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 tracking-[0.18em] uppercase">Common Shapes</span>
                          </div>
                          <ul className="space-y-2" style={{ fontFamily: 'system-ui, sans-serif' }}>
                            {gemDetails.shapes.map((shape, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.55 + i * 0.07 }}
                                className="flex items-center gap-2.5 text-slate-600 text-sm"
                              >
                                <span className="w-1.5 h-1.5 rounded-sm rotate-45 bg-violet-400 flex-shrink-0" style={{ display: 'inline-block' }} />
                                {shape}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      </div>

                      {/* ── QUALITY & VALUATION ── */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        className="bg-white border border-amber-200 rounded-xl p-6 hover:border-amber-300 transition-colors duration-300 relative overflow-hidden group"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(245,158,11,0.06)' }}
                      >
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 opacity-60" />
                        <div className="flex items-center gap-2 mb-3" style={{ fontFamily: 'system-ui, sans-serif' }}>
                          <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                            <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                              <Award size={14} className="text-amber-500" />
                            </motion.div>
                          </div>
                          <span className="text-[11px] font-bold text-amber-700 tracking-[0.18em] uppercase">Quality & Valuation</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-sm" style={{ fontFamily: 'system-ui, sans-serif' }}>
                          {gemDetails.grade}
                        </p>
                      </motion.div>

                      {/* ── CERTIFICATE FOOTER ── */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center justify-between pt-4 border-t border-slate-100"
                        style={{ fontFamily: 'system-ui, sans-serif' }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-900 rounded flex items-center justify-center">
                            <div className="w-2 h-2 border border-white/60 rotate-45 rounded-sm" style={{ transform: 'rotate(45deg)' }} />
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold tracking-[0.25em] uppercase">Ceylon Gemological Institute</span>
                        </div>
                        <span className="text-[10px] text-slate-300 tracking-widest">
                          {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </motion.div>
                    </div>
                  ) : (
                    /* No matching DB entry */
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center"
                      style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                      <Database className="text-blue-300 mx-auto mb-3" size={32} />
                      <p className="text-slate-500 text-sm mb-1.5">Specimen identified, but detailed market data is currently unavailable.</p>
                      <p className="text-slate-400 text-xs">Database sync pending for: <span className="text-blue-600 font-semibold">{result.gemType}</span></p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AIEngine;
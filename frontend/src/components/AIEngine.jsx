import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, ArrowLeft, Scan, Loader2, Sparkles, 
  AlertCircle, Palette, Hexagon, Award, Info, CheckCircle2, XCircle 
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

const AIEngine = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

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
    <div className="min-h-screen bg-[#01030a] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* Top Navbar */}
      <nav className="flex items-center px-6 lg:px-12 py-6 border-b border-white/5 bg-[#01030a]/80 backdrop-blur-2xl sticky top-0 z-50">
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors bg-white/5 px-5 py-2.5 rounded-full border border-white/10 hover:border-cyan-500/50"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
        </button>
        <div className="mx-auto flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Sparkles className="text-cyan-400" size={20} />
            <div className="absolute inset-0 bg-cyan-400 blur-md opacity-20"></div>
          </div>
          <span className="text-xl font-black tracking-[0.2em] text-white uppercase">Neural Engine</span>
        </div>
        <div className="w-32 hidden md:block"></div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT PANEL */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#050b1a] p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Specimen Upload</h2>
              <p className="text-slate-400 text-sm">Deploy MobileNetV2 architecture for computer vision analysis.</p>
            </div>

            <div className="bg-[#050b1a] p-4 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="relative border border-dashed border-blue-500/20 hover:border-cyan-400/50 transition-colors rounded-[1.5rem] bg-[#02040a] cursor-pointer overflow-hidden min-h-[400px] flex flex-col justify-center items-center group">
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                
                {!previewUrl ? (
                  <div className="flex flex-col items-center z-10 pointer-events-none">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-900/40 to-cyan-900/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-blue-500/20">
                      <UploadCloud size={40} className="text-cyan-400" />
                    </div>
                    <p className="text-xl font-bold text-slate-200">Initiate Uplink</p>
                    <p className="text-sm text-slate-500 mt-2 text-center max-w-[250px]">Drag & drop specimen image or click to browse local files.</p>
                  </div>
                ) : (
                  <div className="relative w-full h-full min-h-[400px]">
                    <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    <AnimatePresence>
                      {isAnalyzing && (
                        <motion.div initial={{ top: "0%" }} animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute left-0 w-full h-1 bg-cyan-400 shadow-[0_0_20px_#22d3ee] z-10"></motion.div>
                      )}
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                  </div>
                )}
              </div>

              <button disabled={!selectedImage || isAnalyzing} onClick={handleAnalyze} className={`w-full mt-4 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden ${!selectedImage ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5' : 'bg-white text-slate-950 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]'}`}>
                {isAnalyzing ? <><Loader2 className="animate-spin text-cyan-600" size={24} /> Executing Neural Scan...</> : <><Scan size={24} className={selectedImage ? "text-blue-600" : ""} /> {selectedImage ? "Analyze Specimen" : "Awaiting Image"}</>}
              </button>
            </div>
          </motion.div>

          {/* RIGHT PANEL */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-7 bg-[#050b1a] rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

            {!isAnalyzing && !result && (
              <div className="flex-1 flex flex-col items-center justify-center opacity-40 p-12 text-center">
                <Hexagon size={100} strokeWidth={1} className="text-slate-500 mb-6" />
                <h3 className="text-2xl font-light tracking-widest text-slate-300 uppercase">System Standby</h3>
                <p className="text-slate-500 mt-2">Upload a gemstone image to retrieve market and gemological data.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 border-2 border-slate-800 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" size={40} />
                </div>
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Processing Data Matrix</h3>
                <p className="text-slate-400 font-light">Cross-referencing neural output with local Sri Lankan database...</p>
              </div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 p-8 sm:p-12">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">
                      {isErrorOrNotGem ? <XCircle size={14}/> : <CheckCircle2 size={14} />}
                      {isErrorOrNotGem ? "Analysis Failed" : "Match Verified"}
                    </div>
                    <h2 className="text-5xl sm:text-6xl font-black text-white mb-3 tracking-tighter uppercase leading-none">
                      {result.gemType.replace(/_/g, ' ')}
                    </h2>
                    {gemDetails && (
                      <p className="text-2xl text-blue-400 font-medium tracking-wide">{gemDetails.localName}</p>
                    )}
                  </div>
                  
                  <div className="bg-[#02040a] p-6 rounded-3xl border border-white/5 text-center min-w-[140px] shadow-inner">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Confidence</p>
                    <p className={`text-4xl font-black ${result.confidence > 90 ? 'text-green-400' : 'text-amber-400'}`}>
                      {result.confidence}%
                    </p>
                  </div>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent mb-10"></div>

                {isErrorOrNotGem ? (
                  <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl backdrop-blur-sm">
                    <AlertCircle className="text-red-400 mb-4" size={32} />
                    <h3 className="text-xl font-bold text-red-200 mb-2">Review Required</h3>
                    <p className="text-red-200/70 text-lg leading-relaxed">{result.description}</p>
                  </div>
                ) : (
                  gemDetails ? (
                    <div className="space-y-6">
                      <div className="bg-[#02040a] border border-white/5 p-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4 text-slate-300">
                          <Info size={20} className="text-blue-500" /> <span className="font-bold uppercase tracking-widest text-sm">Market Overview</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-lg font-light">{gemDetails.description}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-[#02040a] border border-white/5 p-8 rounded-3xl hover:border-pink-500/30 transition-colors group">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors"><Palette size={20} /></div>
                            <span className="font-bold text-slate-200 uppercase tracking-widest text-sm">Ceylon Colors</span>
                          </div>
                          <ul className="space-y-3">
                            {gemDetails.colors.map((color, i) => (
                              <li key={i} className="text-slate-400 flex items-center gap-3 font-light">
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-500/50"></span> {color}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-[#02040a] border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-colors group">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors"><Hexagon size={20} /></div>
                            <span className="font-bold text-slate-200 uppercase tracking-widest text-sm">Common Shapes</span>
                          </div>
                          <ul className="space-y-3">
                            {gemDetails.shapes.map((shape, i) => (
                              <li key={i} className="text-slate-400 flex items-center gap-3 font-light">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></span> {shape}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-amber-500/10 to-[#02040a] border border-amber-500/20 p-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-4 text-amber-400">
                          <Award size={24} /> <span className="font-bold uppercase tracking-widest text-sm">Quality & Valuation</span>
                        </div>
                        <p className="text-amber-100/70 leading-relaxed text-lg font-light">{gemDetails.grade}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-500/5 p-8 rounded-3xl border border-blue-500/10 text-center">
                      <p className="text-slate-300 text-lg mb-2">Specimen identified, but detailed market data is currently unavailable.</p>
                      <p className="text-slate-500 text-sm">Database sync pending for: {result.gemType}</p>
                    </div>
                  )
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AIEngine;
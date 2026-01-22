
import React, { useState, useRef, useEffect } from 'react';
import { analyzeVibe } from './services/geminiService';
import { VibeAnalysis, AppState } from './types';
import { PaletteDisplay } from './components/PaletteDisplay';
import { LoadingVibe } from './components/LoadingVibe';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<VibeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setState(AppState.CAMERA);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setError("Camera access was denied. Please use the upload option or check your permissions.");
      setState(AppState.ERROR);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      setPreviewUrl(base64);
      stopCamera();
      processImage(base64);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64: string) => {
    setState(AppState.LOADING);
    setError(null);
    try {
      const analysis = await analyzeVibe(base64);
      setResult(analysis);
      setState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setError("The sommelier is having trouble reading the notes of this scene. Please try another angle.");
      setState(AppState.ERROR);
    }
  };

  const handleSyncPlaylist = () => {
    if (!result) return;
    const query = encodeURIComponent(`${result.mood} ${result.genres.join(' ')}`);
    const spotifyUrl = `https://open.spotify.com/search/${query}`;
    window.open(spotifyUrl, '_blank');
  };

  const handleShare = () => {
    if (navigator.share && result) {
      navigator.share({
        title: `The Vibe Sommelier: ${result.playlistName}`,
        text: `My current vibe is ${result.mood}. Tasting notes: ${result.tastingNotes}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Sharing is not supported on this browser. Copy the URL to share!");
    }
  };

  const reset = () => {
    stopCamera();
    setState(AppState.IDLE);
    setResult(null);
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-12 relative">
      {/* Dynamic Background Blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <header className="relative z-10 text-center mb-16 space-y-4">
        <h1 className="text-5xl sm:text-7xl font-serif text-white tracking-tighter leading-none">
          The Vibe <span className="italic text-white/60">Sommelier</span>
        </h1>
        <div className="flex items-center justify-center space-x-4">
          <div className="h-[1px] w-8 bg-white/10"></div>
          <p className="text-white/30 text-[9px] uppercase tracking-[0.4em] font-bold">
            Curated Aesthetics & Sonic Notes
          </p>
          <div className="h-[1px] w-8 bg-white/10"></div>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-4xl">
        <div className="glass rounded-[2rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/10 transition-all duration-700">
          
          {state === AppState.IDLE && (
            <div className="p-12 sm:p-20 flex flex-col items-center space-y-12">
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-elegant italic text-white/80">Commence the Tasting</h3>
                <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-bold">Choose your capture method</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
                <button 
                  onClick={startCamera}
                  className="group relative flex flex-col items-center justify-center p-10 space-y-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-700 border border-white/10 group-hover:border-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/40 group-hover:text-white/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <circle cx="12" cy="13" r="3" strokeWidth={1} />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-bold text-white/80 uppercase tracking-widest">Live View</span>
                    <span className="text-[9px] text-white/30 uppercase tracking-tighter">Real-time capture</span>
                  </div>
                </button>

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center p-10 space-y-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-700 border border-white/10 group-hover:border-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/40 group-hover:text-white/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-bold text-white/80 uppercase tracking-widest">Archive</span>
                    <span className="text-[9px] text-white/30 uppercase tracking-tighter">From your library</span>
                  </div>
                </button>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          )}

          {state === AppState.CAMERA && (
            <div className="relative animate-in fade-in duration-700">
              <div className="aspect-[16/10] sm:aspect-video bg-black overflow-hidden flex items-center justify-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover scale-[1.05] brightness-75 contrast-125"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none">
                <div className="flex justify-between items-start pointer-events-auto">
                  <button 
                    onClick={reset}
                    className="p-4 rounded-full bg-black/40 backdrop-blur-xl text-white/60 hover:text-white transition-all border border-white/10 hover:border-white/30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="px-5 py-2 bg-black/60 backdrop-blur-xl rounded-full text-[10px] uppercase tracking-[0.3em] text-white/80 border border-white/20 font-bold">
                    Viewfinder Active
                  </div>
                </div>

                <div className="flex justify-center items-center pointer-events-auto pb-8">
                  <button 
                    onClick={capturePhoto}
                    className="group relative w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center hover:border-white/50 transition-all duration-500"
                  >
                    <div className="w-14 h-14 rounded-full bg-white group-hover:scale-95 group-active:scale-90 transition-all duration-300" />
                    <div className="absolute -inset-4 border border-white/10 rounded-full animate-ping opacity-20 pointer-events-none" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {state === AppState.LOADING && <LoadingVibe />}

          {state === AppState.RESULT && result && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {/* Cinematic Image Header */}
              <div className="relative aspect-[16/10] sm:aspect-video w-full overflow-hidden">
                <img 
                  src={previewUrl || ''} 
                  alt="Vibe Source" 
                  className="w-full h-full object-cover scale-[1.02]"
                />
                {/* Multi-layered overlays for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/30" />
                <div className="absolute inset-0 vignette pointer-events-none" />
                
                {/* Primary Labels Overlay */}
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-xl rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-white border border-white/30 shadow-2xl">
                        {result.mood}
                      </span>
                      <span className="px-3 py-1 bg-black/40 backdrop-blur-xl rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-white/60 border border-white/5">
                        {result.intensity}
                      </span>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-3 text-white/60">
                         <div className="w-6 h-[1px] bg-white/40"></div>
                         <span className="text-[10px] uppercase tracking-[0.5em] font-bold">Aesthetic Title</span>
                      </div>
                      <h2 className="text-5xl sm:text-7xl font-serif italic text-white leading-none tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                        {result.playlistName}
                      </h2>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={reset}
                  className="absolute top-8 right-8 p-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all z-20 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Refined Breakdown Section */}
              <div className="p-10 sm:p-16 space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  {/* Left Column: Notes */}
                  <div className="lg:col-span-7 space-y-12">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/20 whitespace-nowrap">Sommelier's Note</h4>
                        <div className="h-[1px] w-full bg-white/5"></div>
                      </div>
                      <blockquote className="text-2xl sm:text-3xl text-white/90 leading-snug font-elegant italic tracking-tight relative pl-8 border-l border-white/10">
                        "{result.tastingNotes}"
                        <div className="absolute top-0 left-0 text-6xl text-white/5 font-serif -translate-x-1/2 -translate-y-1/2">"</div>
                      </blockquote>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row gap-6">
                        <button 
                          onClick={handleSyncPlaylist}
                          className="flex-1 flex items-center justify-center space-x-3 px-8 py-5 bg-white text-black rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] group"
                        >
                          <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.485 17.3c-.22.36-.677.47-1.03.25-2.845-1.74-6.425-2.13-10.645-1.17-.406.09-.813-.16-.906-.57-.09-.406.16-.813.57-.906 4.61-1.05 8.56-.6 11.75 1.35.36.21.47.67.25 1.03zm1.46-3.26c-.28.45-.87.59-1.31.32-3.255-2-8.215-2.585-12.065-1.415-.5.15-1.03-.13-1.18-.63-.15-.5.13-1.03.63-1.18 4.41-1.34 9.89-.68 13.6 1.6.44.27.59.86.32 1.32zm.125-3.42c-3.905-2.32-10.335-2.535-14.085-1.395-.6.18-1.24-.16-1.42-.76-.18-.6.16-1.24.76-1.42 4.305-1.305 11.41-1.055 15.905 1.615.54.32.72 1.02.4 1.56-.32.54-1.02.72-1.56.4z"/>
                          </svg>
                          <span>Discover Playlist</span>
                        </button>
                        
                        <button 
                          onClick={handleShare}
                          className="flex items-center justify-center space-x-3 px-8 py-5 bg-white/5 border border-white/10 text-white/80 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all hover:border-white/20 group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span>Share Note</span>
                        </button>
                    </div>
                  </div>
                  
                  {/* Right Column: Attributes */}
                  <div className="lg:col-span-5 space-y-12">
                    <div className="space-y-6">
                      <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">Sonic Pairings</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.genres.map((genre, idx) => (
                          <span key={idx} className="px-4 py-2 bg-white/5 border border-white/5 rounded-lg text-xs font-medium text-white/70 hover:bg-white/10 transition-colors cursor-default">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/20">Palette Map</h4>
                      <PaletteDisplay colors={result.colorPalette} />
                    </div>

                    <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                       <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/10">Vibe Registry</div>
                       <div className="text-[11px] font-mono text-white/30 tracking-widest font-bold uppercase italic">
                         #{Math.floor(Math.random() * 9000) + 1000} — {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {state === AppState.ERROR && (
            <div className="p-20 text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-red-500/5 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-4 max-w-sm mx-auto">
                <p className="text-xl font-elegant text-white/90 italic leading-relaxed">"{error}"</p>
                <button 
                  onClick={reset}
                  className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] uppercase tracking-widest font-bold text-white transition-all hover:-translate-y-1 active:scale-95"
                >
                  Return to Cellar
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 mt-20 text-center pb-12">
        <p className="text-white/10 text-[9px] tracking-[0.6em] uppercase font-black">
          Digital Aesthetics Bureau · No. 0422-90
        </p>
      </footer>
    </div>
  );
};

export default App;

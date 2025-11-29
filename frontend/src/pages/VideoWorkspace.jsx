import React, { useState, useEffect, useRef } from 'react';
import { Search, Upload, Play, Image as ImageIcon, ArrowRight, Target, Crosshair, Aperture, Activity } from 'lucide-react';

const VideoWorkspace = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [mediaUrl, setMediaUrl] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [processedVideo, setProcessedVideo] = useState(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);
    const [isTargetLocked, setIsTargetLocked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'
    const [showTelemetry, setShowTelemetry] = useState(true);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setMediaUrl(url);
            setProcessedImage(null);
            setProcessedVideo(null);
            setIsTargetLocked(false);
            setProgress(0);
            setMediaType(file.type.startsWith('video') ? 'video' : 'image');
        }
    };

    const pollStatus = async (jobId) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:8000/status/${jobId}`);
                const data = await res.json();

                if (data.status === 'processing') {
                    setProgress(data.progress);
                } else if (data.status === 'completed') {
                    clearInterval(interval);
                    setProgress(100);
                    setProcessedVideo(`http://localhost:8000/result/${jobId}`);
                    setIsProcessing(false);
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    setIsProcessing(false);
                    console.error("Job failed:", data.error);
                    alert(`Analysis failed: ${data.error}`);
                }
            } catch (e) {
                console.error("Polling error:", e);
                clearInterval(interval);
                setIsProcessing(false);
            }
        }, 1000);
    };

    const handleSearchSubmit = async (e) => {
        if ((e.key === 'Enter' || e.type === 'click') && searchQuery.trim() && mediaUrl) {
            setIsTargetLocked(true);
            setIsProcessing(true);
            setProgress(0);
            setProcessedImage(null);
            setProcessedVideo(null);

            try {
                const response = await fetch(mediaUrl);
                const blob = await response.blob();
                const formData = new FormData();
                formData.append('file', blob, mediaType === 'video' ? 'upload.mp4' : 'upload.jpg');
                formData.append('prompt', searchQuery);

                const endpoint = mediaType === 'video' ? 'analyze_video' : 'analyze';
                const apiRes = await fetch(`http://localhost:8000/${endpoint}`, {
                    method: 'POST',
                    body: formData
                });

                const data = await apiRes.json();

                if (mediaType === 'video') {
                    if (data.status === 'started') {
                        pollStatus(data.job_id);
                    } else {
                        throw new Error(data.message || "Video analysis failed to start");
                    }
                } else {
                    if (data.status === 'success' && data.image) {
                        setProcessedImage(data.image);
                    } else {
                        throw new Error(data.message || "Image analysis failed");
                    }
                    setIsProcessing(false);
                }
            } catch (error) {
                console.error("Analysis failed:", error);
                setIsProcessing(false);
                alert("Analysis failed. Ensure backend is running.");
            }
        }
    };

    return (
        <div className="flex flex-1 h-full overflow-hidden relative">
            {/* HUD Overlay Grid - Dot Pattern */}
            <div className="absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(rgba(0, 243, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* Sidebar - Tactical Menu */}
            {showTelemetry && (
                <div className="w-80 border-r border-color p-6 flex flex-col gap-lg flex-shrink-0 bg-panel relative z-10" style={{ borderColor: 'var(--border-color)' }}>
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-neon">
                            <Target size={20} />
                            <h2 className="text-lg font-bold font-mono tracking-widest uppercase">Operation: Cutout</h2>
                        </div>
                        <p className="text-xs text-secondary mb-6 font-mono border-l-2 border-neon-cyan pl-2">
                            INITIATE OBJECT ISOLATION PROTOCOL.
                        </p>

                        <div className="flex flex-col gap-md">
                            {[
                                { step: '01', label: 'UPLOAD FOOTAGE', status: mediaUrl ? 'COMPLETE' : 'WAITING' },
                                { step: '02', label: 'DESIGNATE TARGETS', status: isTargetLocked ? 'LOCKED' : 'PENDING' },
                                { step: '03', label: 'APPLY EFFECTS', status: (processedImage || processedVideo) ? 'COMPLETE' : (isTargetLocked ? 'PROCESSING' : 'LOCKED') }
                            ].map((item, i) => (
                                <div key={i} className={`flex items-center gap-sm p-2 border border-color transition-colors cursor-pointer group ${item.status === 'COMPLETE' || item.status === 'LOCKED' ? 'bg-neon-cyan/20 border-neon-cyan' : 'bg-black/40 hover:bg-neon-cyan/10'}`}>
                                    <span className="text-xs font-bold font-mono text-neon group-hover:text-white">{item.step}</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white group-hover:text-neon">{item.label}</span>
                                        <span className="text-[10px] text-secondary font-mono">{item.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="flex items-center gap-sm px-3 py-2 border border-neon-cyan bg-neon-cyan/10 w-full justify-between">
                            <span className="text-xs text-neon font-mono">MODEL: SAM-3 [OPTIMIZED]</span>
                            <Activity size={14} className="text-neon animate-pulse" />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative min-w-0 z-10">
                {/* Search Bar Overlay - HUD Style */}
                {showTelemetry && (
                    <div className="absolute top-6 left-6 z-20 w-96">
                        <div className="bg-panel border border-neon-cyan p-1 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                            <div className="bg-black/80 p-4 border border-color relative overflow-hidden">
                                {/* Scanning line animation */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-neon-cyan opacity-50 animate-pulse"></div>

                                <h3 className="text-xs font-bold text-neon mb-2 font-mono uppercase flex items-center gap-2">
                                    <Crosshair size={14} /> Target Designation
                                </h3>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon cursor-pointer hover:text-white transition-colors" onClick={handleSearchSubmit} />
                                    <input
                                        type="text"
                                        placeholder="ENTER TARGET DESCRIPTION..."
                                        className="w-full bg-black border border-color rounded-none px-3 py-2 pl-9 pr-8 text-sm text-white font-mono focus:outline-none focus:border-neon-cyan placeholder-gray-600 uppercase"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={handleSearchSubmit}
                                    />
                                    <ArrowRight size={16} className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors cursor-pointer ${searchQuery ? 'text-neon hover:text-white' : 'text-gray-600'}`} onClick={handleSearchSubmit} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Video Area - Viewport */}
                <div className="flex-1 flex items-center justify-center p-12 overflow-hidden relative">
                    {/* Corner Reticles */}
                    {showTelemetry && (
                        <>
                            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-neon-cyan"></div>
                            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-neon-cyan"></div>
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-neon-cyan"></div>
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-neon-cyan"></div>
                        </>
                    )}

                    <div className={`border border-color w-full h-full flex flex-col items-center justify-center gap-md bg-black/60 backdrop-blur-sm relative group overflow-hidden ${!showTelemetry ? 'border-none' : ''}`}>
                        {mediaUrl ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                {processedVideo ? (
                                    <video src={processedVideo} controls autoPlay loop className="w-full h-full object-contain" />
                                ) : (
                                    mediaType === 'video' ? (
                                        <video src={mediaUrl} controls className="w-full h-full object-contain" />
                                    ) : (
                                        <img src={mediaUrl} alt="Uploaded Footage" className="w-full h-full object-contain" />
                                    )
                                )}

                                {processedImage && (
                                    <img
                                        src={processedImage}
                                        alt="Processed Result"
                                        className="absolute inset-0 w-full h-full object-contain pointer-events-none animate-pulse-slow"
                                        style={{ mixBlendMode: 'screen' }}
                                    />
                                )}

                                {isProcessing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                                        <div className="flex flex-col items-center gap-4 w-64">
                                            <div className="flex items-center justify-between w-full text-neon font-mono text-xs mb-1">
                                                <span>ANALYZING TARGET...</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-800 border border-gray-600">
                                                <div
                                                    className="h-full bg-neon-cyan transition-all duration-300 ease-out"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-secondary text-[10px] font-mono tracking-widest animate-pulse">SAM-3 NEURAL BRIDGE ACTIVE</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <Aperture size={200} className="text-neon-cyan opacity-10 animate-spin-slow" />
                                </div>

                                <ImageIcon size={48} className="text-secondary opacity-50" />
                                <h3 className="text-lg font-medium font-mono text-neon tracking-widest">NO SIGNAL INPUT</h3>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,video/*"
                                    onChange={handleFileUpload}
                                />
                                <button
                                    className="btn mt-4 flex items-center gap-2"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <Upload size={16} />
                                    INITIALIZE UPLOAD
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom Bar / Timeline - Data Stream */}
                <div className="h-16 border-t border-color bg-panel px-6 flex items-center justify-between flex-shrink-0 z-20">
                    <div className={`text-xs text-neon font-mono flex items-center gap-4 ${!showTelemetry ? 'opacity-0' : ''}`}>
                        <span>T: 00:00:00:00</span>
                        <span className="text-secondary">|</span>
                        <span>FPS: 60.0</span>
                        <span className="text-secondary">|</span>
                        <span>BUF: 100%</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="w-8 h-8 flex items-center justify-center border border-neon-cyan text-neon hover:bg-neon-cyan hover:text-black transition-colors">
                            <Play size={14} fill="currentColor" />
                        </button>
                    </div>

                    <button
                        className={`btn text-xs ${!showTelemetry ? 'bg-neon-cyan text-black' : ''}`}
                        onClick={() => setShowTelemetry(!showTelemetry)}
                    >
                        {showTelemetry ? 'HIDE TELEMETRY' : 'SHOW TELEMETRY'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoWorkspace;

import React, { useState } from 'react';
import { Search, Upload, Play, Image as ImageIcon, ArrowRight, Target, Crosshair, Aperture, Activity } from 'lucide-react';

const VideoWorkspace = () => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="flex flex-1 h-full overflow-hidden relative">
            {/* HUD Overlay Grid */}
            <div className="absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.05) 1px, transparent 1px)',
                    backgroundSize: '100px 100px'
                }}>
            </div>

            {/* Sidebar - Tactical Menu */}
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
                            { step: '01', label: 'UPLOAD FOOTAGE', status: 'WAITING' },
                            { step: '02', label: 'DESIGNATE TARGETS', status: 'PENDING' },
                            { step: '03', label: 'APPLY EFFECTS', status: 'LOCKED' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-sm p-2 border border-color bg-black/40 hover:bg-neon-cyan/10 transition-colors cursor-pointer group">
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative min-w-0 z-10">
                {/* Search Bar Overlay - HUD Style */}
                <div className="absolute top-6 left-6 z-20 w-96">
                    <div className="bg-panel border border-neon-cyan p-1 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                        <div className="bg-black/80 p-4 border border-color relative overflow-hidden">
                            {/* Scanning line animation */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-neon-cyan opacity-50 animate-pulse"></div>

                            <h3 className="text-xs font-bold text-neon mb-2 font-mono uppercase flex items-center gap-2">
                                <Crosshair size={14} /> Target Designation
                            </h3>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon" />
                                <input
                                    type="text"
                                    placeholder="ENTER TARGET DESCRIPTION..."
                                    className="w-full bg-black border border-color rounded-none px-3 py-2 pl-9 text-sm text-white font-mono focus:outline-none focus:border-neon-cyan placeholder-gray-600 uppercase"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Area - Viewport */}
                <div className="flex-1 flex items-center justify-center p-12 overflow-hidden relative">
                    {/* Corner Reticles */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-neon-cyan"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-neon-cyan"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-neon-cyan"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-neon-cyan"></div>

                    <div className="border border-color w-full h-full flex flex-col items-center justify-center gap-md bg-black/60 backdrop-blur-sm relative group">
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <Aperture size={200} className="text-neon-cyan opacity-10 animate-spin-slow" />
                        </div>

                        <ImageIcon size={48} className="text-secondary opacity-50" />
                        <h3 className="text-lg font-medium font-mono text-neon tracking-widest">NO SIGNAL INPUT</h3>
                        <button className="btn mt-4 flex items-center gap-2">
                            <Upload size={16} />
                            INITIALIZE UPLOAD
                        </button>
                    </div>
                </div>

                {/* Bottom Bar / Timeline - Data Stream */}
                <div className="h-16 border-t border-color bg-panel px-6 flex items-center justify-between flex-shrink-0 z-20">
                    <div className="text-xs text-neon font-mono flex items-center gap-4">
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

                    <button className="btn text-xs">
                        TOGGLE TELEMETRY
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoWorkspace;

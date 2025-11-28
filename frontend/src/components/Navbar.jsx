import React from 'react';
import { User, Activity } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between py-4 container" style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
      <div className="flex items-center gap-md">
        <Activity className="text-neon" size={24} />
        <span className="text-xl text-neon font-bold tracking-widest">E.I.D.O.S.</span>
      </div>

      <div className="flex items-center gap-md">
        <div className="flex items-center gap-sm px-4 py-1 border border-color rounded-sm bg-panel">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ backgroundColor: '#00ff00', boxShadow: '0 0 5px #00ff00' }}></span>
          <span className="text-xs text-mono text-neon">SYSTEM ONLINE</span>
        </div>
      </div>

      <div className="flex items-center gap-md">
        <div className="w-8 h-8 border border-neon-cyan flex items-center justify-center text-sm text-neon bg-panel-hover">
          CMD
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

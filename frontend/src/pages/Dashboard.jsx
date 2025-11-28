import React from 'react';
import { motion } from 'framer-motion';
import { Video, Image, Box, User, Cpu, Globe, Shield, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Card = ({ icon: Icon, title, model, delay, onClick, disabled }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
            className={`card flex flex-col items-center justify-center gap-lg ${disabled ? 'disabled' : 'cursor-pointer'}`}
            onClick={!disabled ? onClick : undefined}
        >
            <div className="relative">
                <Icon size={48} className="text-neon opacity-80" />
                <div className="absolute inset-0 bg-neon-cyan blur-xl opacity-20"></div>
            </div>
            <div className="text-center z-10">
                <h3 className="text-lg font-bold mb-2 text-mono tracking-wider">{title}</h3>
                <span className="text-xs px-2 py-1 border border-neon-cyan text-neon bg-panel-hover uppercase tracking-widest text-mono">
                    {model}
                </span>
                {disabled && <div className="mt-2 text-xs text-secondary text-mono">[OFFLINE]</div>}
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [systemStatus, setSystemStatus] = React.useState('OFFLINE');

    React.useEffect(() => {
        fetch('http://localhost:8000/')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ONLINE') setSystemStatus('ONLINE');
            })
            .catch(err => console.log('Backend offline', err));
    }, []);

    const cards = [
        { icon: Video, title: 'TARGET ACQUISITION', model: 'SAM 3', delay: 0.1, path: '/video', disabled: false, onClick: () => navigate('/video') },
        { icon: Image, title: 'STATIC ANALYSIS', model: 'SAM 3', delay: 0.2, path: '#', disabled: true },
        { icon: Box, title: 'TERRAIN MAPPING', model: 'SAM 3D', delay: 0.3, path: '#', disabled: true },
        { icon: User, title: 'BIO-SIGNATURE', model: 'SAM 3D', delay: 0.4, path: '#', disabled: true },
    ];

    return (
        <div className="container py-12 relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-4 opacity-30 pointer-events-none">
                <div className="flex flex-col gap-2 items-end text-xs text-neon font-mono">
                    <span>SECURE CONNECTION ESTABLISHED</span>
                    <span>ENCRYPTION: AES-256</span>
                    <span>LAT: 34.0522 N | LON: 118.2437 W</span>
                    <span className={systemStatus === 'ONLINE' ? 'text-neon' : 'text-alert-red'}>
                        NEURAL BRIDGE: {systemStatus}
                    </span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-12 border-l-4 border-neon-cyan pl-6"
            >
                <h1 className="text-4xl font-bold mb-2 text-neon uppercase tracking-widest">Mission Control</h1>
                <p className="text-secondary text-lg text-mono">Select operational module.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
                {cards.map((card, index) => (
                    <Card key={index} {...card} />
                ))}
            </div>

            {/* System Status Footer */}
            <div className="mt-16 grid grid-cols-4 gap-4 opacity-70">
                {[
                    { label: 'CPU LOAD', val: '12%', icon: Cpu },
                    { label: 'NETWORK', val: 'STABLE', icon: Globe },
                    { label: 'FIREWALL', val: 'ACTIVE', icon: Shield },
                    { label: 'UPLINK', val: '45ms', icon: Radio }
                ].map((stat, i) => (
                    <div key={i} className="border border-color p-2 flex items-center gap-3 bg-panel">
                        <stat.icon size={16} className="text-neon" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-secondary text-mono">{stat.label}</span>
                            <span className="text-sm text-neon text-mono">{stat.val}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;

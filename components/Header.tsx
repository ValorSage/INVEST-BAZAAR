import React from 'react';
import { CoinIcon, DiamondIcon, DollarIcon } from './icons';

interface HeaderProps {
    dollars: number;
    points: number;
    jewels: number;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; }> = ({ icon, label, value }) => (
    <div className="flex-1 bg-black/50 border border-gray-500/30 rounded-xl p-2.5 shadow-lg flex items-center gap-3 backdrop-blur-sm">
        <div className="flex-shrink-0">
            {icon}
        </div>
        <div className="flex-grow text-right">
            <div className="text-xs text-gray-300">{label}</div>
            <div className="text-lg font-bold text-white">{value.toLocaleString()}</div>
        </div>
    </div>
);


const Header: React.FC<HeaderProps> = ({ dollars, points, jewels }) => {
    return (
        <div className="w-full flex flex-col items-center gap-3">
             <div className="bg-black/50 border border-gray-500/30 backdrop-blur-sm rounded-xl p-2.5 shadow-lg flex flex-col items-center min-w-[150px]">
                <div className="text-xs text-gray-300">الرصيد بالدولار</div>
                <div className="text-2xl font-bold text-white">{dollars.toFixed(2)}</div>
            </div>
            <div className="w-full flex justify-between items-center gap-3">
                <StatCard 
                    icon={<DiamondIcon className="text-cyan-400 w-7 h-7" />} 
                    label="مجموع المجوهرات" 
                    value={jewels} 
                />
                <StatCard 
                    icon={<CoinIcon className="text-yellow-400 w-7 h-7" />} 
                    label="مجموع النقاط" 
                    value={points} 
                />
            </div>
        </div>
    );
};

export default Header;
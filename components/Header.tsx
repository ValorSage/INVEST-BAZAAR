import React from 'react';
import { CoinIcon, DiamondIcon, DollarIcon } from './icons';

interface HeaderProps {
    dollars: number;
    points: number;
    jewels: number;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; }> = ({ icon, label, value }) => (
    <div className="flex-1 bg-teal-900/40 border border-teal-600/50 rounded-lg p-2.5 shadow-lg flex items-center gap-3">
        <div className="flex-shrink-0">
            {icon}
        </div>
        <div className="flex-grow text-right">
            <div className="text-xs text-teal-200/80">{label}</div>
            <div className="text-lg font-bold text-white">{value.toLocaleString()}</div>
        </div>
    </div>
);


const Header: React.FC<HeaderProps> = ({ dollars, points, jewels }) => {
    return (
        <div className="w-full flex flex-col items-center gap-3">
             <div className="bg-teal-900/40 border border-teal-600/50 rounded-lg p-2.5 shadow-lg flex flex-col items-center min-w-[150px]">
                <div className="text-xs text-teal-200/80">الرصيد بالدولار</div>
                <div className="text-2xl font-bold text-amber-300">{dollars.toFixed(2)}</div>
            </div>
            <div className="w-full flex justify-between items-center gap-3">
                <StatCard 
                    icon={<DiamondIcon className="text-cyan-300 w-7 h-7" />} 
                    label="مجموع المجوهرات" 
                    value={jewels} 
                />
                <StatCard 
                    icon={<CoinIcon className="text-amber-300 w-7 h-7" />} 
                    label="مجموع النقاط" 
                    value={points} 
                />
            </div>
        </div>
    );
};

export default Header;
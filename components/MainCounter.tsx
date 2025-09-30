import React, { useState, useEffect } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { ChevronIcon, PlusIcon } from './icons';
import AdCarousel from './AdCarousel';

interface MainCounterProps {
    activationStartTime: number | null;
    onActivate: () => void;
    cooldownPeriod: number;
    jewelRewardPerCycle: number;
    pointReward: number;
    onOpenStore: () => void;
}

const MatrixEffect: React.FC = () => {
    const [text, setText] = useState('');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>/?|[]{}()';

    useEffect(() => {
        const intervalId = setInterval(() => {
            let newText = '';
            for (let i = 0; i < 200; i++) {
                newText += chars.charAt(Math.floor(Math.random() * chars.length)) + ' ';
            }
            setText(newText);
        }, 150);
        return () => clearInterval(intervalId);
    }, [chars]);

    return <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <p className="font-mono text-center text-teal-400/50 text-xs leading-5 break-all opacity-50">
            {text}
        </p>
    </div>;
}


const MainCounter: React.FC<MainCounterProps> = ({ activationStartTime, onActivate, cooldownPeriod, jewelRewardPerCycle, pointReward, onOpenStore }) => {
    const targetTime = activationStartTime ? activationStartTime + cooldownPeriod : null;
    const { hours, minutes, seconds } = useCountdown(targetTime);

    const [currentCycleJewels, setCurrentCycleJewels] = useState(0);

    useEffect(() => {
        if (!activationStartTime) {
            setCurrentCycleJewels(0);
            return;
        }

        const intervalId = setInterval(() => {
            const elapsedTime = Date.now() - activationStartTime;
            if (elapsedTime >= cooldownPeriod) {
                setCurrentCycleJewels(jewelRewardPerCycle);
                clearInterval(intervalId);
            } else {
                const progress = elapsedTime / cooldownPeriod;
                setCurrentCycleJewels(progress * jewelRewardPerCycle);
            }
        }, 100); // Faster interval for a smooth "live" counter effect

        return () => clearInterval(intervalId);
    }, [activationStartTime, cooldownPeriod, jewelRewardPerCycle]);


    const CountdownButton: React.FC = () => (
         <button 
            onClick={onActivate}
            disabled={!!activationStartTime}
            className="flex-1 flex items-center justify-center bg-black border border-yellow-500/50 backdrop-blur-md rounded-full p-2.5 shadow-lg text-lg font-bold disabled:opacity-70 disabled:cursor-not-allowed transition-colors hover:bg-gray-900"
        >
            {!activationStartTime ? (
                <span className="text-yellow-300">تفعيل</span>
            ) : (
                <span className="font-mono text-white tracking-wider">
                    {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
            )}
        </button>
    );

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Central Circle */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-black/30 p-2">
                    <div className="w-full h-full rounded-full border-4 border-amber-400 shadow-[0_0_20px_theme(colors.amber.400)] animate-pulse"></div>
                </div>
                <div className="absolute inset-4 rounded-full bg-black/40 p-2">
                    <div className="w-full h-full rounded-full border-4 border-teal-400 shadow-[0_0_20px_theme(colors.teal.400)]"></div>
                </div>
                <div className="absolute inset-10 rounded-full bg-black/70 overflow-hidden">
                    <MatrixEffect />
                </div>
                <div className="relative z-10 bg-gray-900/80 border border-white/20 rounded-full px-4 py-2 text-center shadow-2xl backdrop-blur-sm min-w-[170px]">
                    <p className="text-white text-sm">الرصيد اليومي</p>
                    <p className="font-bold font-mono text-amber-300 text-2xl tracking-wider">{currentCycleJewels.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm">جوهرة</span></p>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="w-full flex items-center gap-3 px-2">
                <button
                    onClick={onOpenStore}
                    className="flex-1 flex items-center justify-center gap-3 bg-black border border-gray-700 backdrop-blur-md rounded-full p-2.5 shadow-lg text-lg text-yellow-300 font-bold transition-colors hover:bg-gray-900"
                >
                    <PlusIcon className="w-6 h-6" />
                    <span>متجر العدادات</span>
                </button>
                <CountdownButton />
            </div>

            <button disabled className="w-full flex items-center justify-between bg-black border border-gray-700 backdrop-blur-md rounded-full p-2.5 shadow-lg text-lg text-gray-400 font-bold mt-2 px-6 cursor-not-allowed">
                <span>إهداء عداد</span>
                <ChevronIcon className="w-6 h-6" />
            </button>
            
            {/* Rewards Info Box */}
            <div className="w-full mt-6 bg-black/30 border border-gray-700/50 backdrop-blur-md rounded-lg p-2 shadow-lg">
                <div className="bg-black/20 rounded-t-md px-4 py-1 text-center font-semibold text-sm text-yellow-200">
                    ما تحصل عليه من العداد حالياً
                </div>
                <div className="flex flex-col gap-1 p-2">
                     <div className="bg-black/20 rounded p-3 text-center text-gray-200 font-semibold">
                        تتحصل يوميا على ({jewelRewardPerCycle}) جوهرة من العداد
                    </div>
                     <div className="bg-black/20 rounded p-3 text-center text-gray-200 font-semibold">
                        تتحصل يوميا على ({pointReward.toLocaleString()}) نقطة من العداد
                    </div>
                </div>
            </div>

            <AdCarousel />
        </div>
    );
};

export default MainCounter;
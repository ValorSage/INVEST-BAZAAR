import React from 'react';
import { ChevronIcon, StoreIcon, CoinIcon, DiamondIcon } from './icons';
import { Counter } from '../types';

interface StoreProps {
    onBack: () => void;
    onPurchase: (counter: Counter) => void;
    userPoints: number;
    userJewels: number;
}

const countersForSale: Counter[] = [
    { id: 1, name: 'عداد 500 نقطة', points: 500, price: 1500, priceCurrency: 'points' },
    { id: 2, name: 'عداد 1000 نقطة', points: 1000, price: 2800, priceCurrency: 'points' },
    { id: 3, name: 'عداد 5000 نقطة', points: 5000, price: 13000, priceCurrency: 'points' },
    { id: 4, name: 'عداد 10,000 نقطة', points: 10000, price: 25000, priceCurrency: 'points' },
    { id: 5, name: 'عداد 500 جوهرة', jewels: 500, price: 80000, priceCurrency: 'jewels' },
];

const Store: React.FC<StoreProps> = ({ onBack, onPurchase, userPoints, userJewels }) => {
    return (
        <div className="bg-black/30 border border-gray-700/50 rounded-2xl shadow-lg p-6 flex flex-col justify-center items-center backdrop-blur-sm text-center mt-6 animate-fade-in">
            <div className="relative w-full flex flex-col items-center mb-4">
                <button
                    onClick={onBack}
                    className="absolute right-0 top-0 p-2 text-yellow-300 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="عودة"
                >
                    <ChevronIcon className="w-7 h-7 transform rotate-180" />
                </button>
                <StoreIcon className="w-16 h-16 mx-auto text-yellow-400 mb-3" />
                <h2 className="text-3xl font-bold text-white">متجر العدادات</h2>
            </div>
            
            <div className="w-full flex flex-col gap-4 my-4">
                {countersForSale.map((counter) => {
                    const canAfford = counter.priceCurrency === 'points'
                        ? userPoints >= counter.price
                        : userJewels >= counter.price;
                    return (
                        <div key={counter.id} className="bg-black/40 p-4 rounded-lg border border-gray-700/60 w-full flex flex-col gap-3 text-right">
                            <p className="font-bold text-white text-lg">{counter.name}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col items-start gap-1">
                                    {counter.points && (
                                        <div className="flex items-center gap-2 text-sm text-yellow-300">
                                            <CoinIcon className="w-4 h-4" />
                                            <span className="font-semibold">+{counter.points.toLocaleString()} نقطة يومياً</span>
                                        </div>
                                    )}
                                    {counter.jewels && (
                                        <div className="flex items-center gap-2 text-sm text-cyan-400">
                                            <DiamondIcon className="w-4 h-4" />
                                            <span className="font-semibold">+{counter.jewels.toLocaleString()} جوهرة يومياً</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 font-bold">
                                        {counter.priceCurrency === 'points' ? (
                                            <CoinIcon className="w-5 h-5 text-yellow-300" />
                                        ) : (
                                            <DiamondIcon className="w-5 h-5 text-cyan-400" />
                                        )}
                                        <span className={counter.priceCurrency === 'points' ? 'text-yellow-300' : 'text-cyan-400'}>
                                            {counter.price.toLocaleString()}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => onPurchase(counter)}
                                        disabled={!canAfford}
                                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 transform hover:scale-105
                                        ${canAfford 
                                            ? 'bg-yellow-400 text-black shadow-md hover:bg-yellow-300' 
                                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        شراء
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);


export default Store;
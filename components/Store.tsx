import React from 'react';
// Fix: Import `ChevronIcon` instead of the non-existent `ChevronRightIcon`.
import { ChevronIcon, StoreIcon } from './icons';

interface StoreProps {
    onBack: () => void;
}

const Store: React.FC<StoreProps> = ({ onBack }) => {
    return (
        <div className="bg-gray-900/50 border border-teal-500/30 rounded-2xl shadow-lg p-8 flex flex-col justify-center items-center backdrop-blur-sm text-center mt-10 animate-fade-in">
            <StoreIcon className="w-20 h-20 mx-auto text-teal-400 mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">متجر العدادات</h2>
            <p className="text-gray-400 mb-6">
                عدادات وترقيات جديدة قادمة قريباً!
            </p>

            <button
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-gradient-to-t from-gray-700 to-gray-600 text-white border-t border-gray-500 hover:shadow-gray-500/40 hover:scale-105"
            >
                <span>عودة</span>
                {/* Fix: Use `ChevronIcon` and rotate it to point right for the "Back" button in RTL context. */}
                <ChevronIcon className="w-6 h-6 transform rotate-180" />
            </button>
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

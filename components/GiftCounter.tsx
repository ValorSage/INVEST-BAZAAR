import React, { useState } from 'react';
import { User, Counter } from '../types';
import { ChevronIcon, UserIcon, SearchIcon, DiamondIcon } from './icons';

const countersForSale: Counter[] = [
    { id: 1, name: 'عداد 500 نقطة', points: 500, price: 75000, priceCurrency: 'points' },
    { id: 2, name: 'عداد 1000 نقطة', points: 1000, price: 180000, priceCurrency: 'points' },
    { id: 3, name: 'عداد 5000 نقطة', points: 5000, price: 750000, priceCurrency: 'points' },
    { id: 4, name: 'عداد 10,000 نقطة', points: 10000, price: 1500000, priceCurrency: 'points' },
    { id: 5, name: 'عداد 500 جوهرة', jewels: 500, price: 80000, priceCurrency: 'jewels' },
];

interface GiftCounterProps {
    onBack: () => void;
    onGift: (recipientId: string, counter: Counter) => { success: boolean; message: string };
    allUsers: User[];
    currentUserPoints: number;
    currentUserJewels: number;
}

const GiftCounter: React.FC<GiftCounterProps> = ({ onBack, onGift, allUsers, currentUserPoints, currentUserJewels }) => {
    const [step, setStep] = useState<'search' | 'select'>('search');
    const [recipientIdInput, setRecipientIdInput] = useState('');
    const [foundUser, setFoundUser] = useState<User & { profilePicture?: string | null } | null>(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = () => {
        setError('');
        setFoundUser(null);
        if (!recipientIdInput.trim()) {
            setError('الرجاء إدخال معرّف المستخدم.');
            return;
        }

        const user = allUsers.find(u => u.userId === recipientIdInput.trim());
        if (user) {
            const profilePictureKey = `profilePicture_${user.userId}`;
            const storedValue = localStorage.getItem(profilePictureKey);
            const profilePicture = storedValue ? JSON.parse(storedValue) : null;
            setFoundUser({ ...user, profilePicture });
        } else {
            setError('لم يتم العثور على مستخدم بهذا المعرّف.');
        }
    };
    
    const handleGiftPurchase = (counter: Counter) => {
        if (!foundUser) return;
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        const result = onGift(foundUser.userId, counter);
        
        setTimeout(() => {
            if (result.success) {
                setSuccessMessage(result.message);
                setTimeout(() => {
                    onBack();
                }, 2000);
            } else {
                setError(result.message);
            }
            setIsLoading(false);
        }, 500); 
    };

    const resetSearch = () => {
        setStep('search');
        setFoundUser(null);
        setRecipientIdInput('');
        setError('');
        setSuccessMessage('');
    };

    const renderSearchBar = () => (
        <div className="w-full flex flex-col items-center">
            <h3 className="text-xl font-bold text-white mb-4">إهداء عداد لصديق</h3>
            <p className="text-gray-300 mb-6 text-center">أدخل معرّف المستخدم الخاص بصديقك للبحث عنه.</p>
            <div className="w-full flex items-center gap-2">
                <input
                    type="text"
                    placeholder="أدخل معرّف المستخدم هنا..."
                    value={recipientIdInput}
                    onChange={(e) => setRecipientIdInput(e.target.value)}
                    className="flex-grow bg-black/50 border border-gray-600 rounded-lg py-3 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-right"
                />
                <button
                    onClick={handleSearch}
                    className="bg-yellow-400 text-black p-3 rounded-lg hover:bg-yellow-300 transition-colors"
                    aria-label="بحث"
                >
                    <SearchIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
    
    const renderSearchResult = () => (
        <div className="w-full flex flex-col items-center text-center mt-6 p-4 bg-black/20 rounded-lg animate-fade-in-fast">
            <div className="w-20 h-20 rounded-full mb-3 border-2 border-amber-400 p-1">
                {foundUser?.profilePicture ? (
                    <img src={foundUser.profilePicture} alt="صورة الملف الشخصي" className="w-full h-full rounded-full object-cover" />
                ) : (
                    <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-gray-400" />
                    </div>
                )}
            </div>
            <p className="text-lg font-bold text-white">{foundUser?.name}</p>
            <div className="flex gap-2 mt-4">
                 <button onClick={resetSearch} className="px-6 py-2 rounded-lg font-semibold text-sm bg-gray-600 text-white hover:bg-gray-500 transition-colors">
                    بحث جديد
                </button>
                <button onClick={() => setStep('select')} className="px-6 py-2 rounded-lg font-semibold text-sm bg-yellow-400 text-black hover:bg-yellow-300 transition-colors">
                    تأكيد وإهداء
                </button>
            </div>
        </div>
    );
    
    const renderCounterList = () => (
        <div className="w-full animate-fade-in-fast">
            <div className="text-center mb-4 p-3 bg-black/20 rounded-lg">
                <p className="text-gray-300">أنت تهدي إلى:</p>
                <p className="font-bold text-lg text-amber-300">{foundUser?.name}</p>
            </div>
            {successMessage && <div className="bg-green-500/20 text-green-300 text-sm py-2 px-4 rounded-md mb-4 text-center">{successMessage}</div>}
            {error && <div className="bg-red-500/20 text-red-300 text-sm py-2 px-4 rounded-md mb-4 text-center">{error}</div>}

            <div className="w-full flex flex-col gap-3 max-h-[40vh] overflow-y-auto pr-2">
                {countersForSale.map((counter) => {
                    const canAfford = counter.priceCurrency === 'points'
                        ? currentUserPoints >= counter.price
                        : currentUserJewels >= counter.price;
                    return (
                        <div key={counter.id} className="bg-black/40 p-3 rounded-lg border border-gray-700/60 w-full flex items-center justify-between text-right">
                            <div className="flex flex-col items-start gap-1">
                                <p className="font-bold text-white">{counter.name}</p>
                                <div className="flex items-center gap-1.5 font-bold text-sm">
                                    <span className={counter.priceCurrency === 'points' ? 'text-yellow-300' : 'text-cyan-400'}>
                                        {counter.price.toLocaleString()}
                                    </span>
                                     {counter.priceCurrency === 'points' ? (
                                        null
                                    ) : (
                                        <DiamondIcon className="w-4 h-4 text-cyan-400" />
                                    )}
                                </div>
                            </div>
                           
                            <button 
                                onClick={() => handleGiftPurchase(counter)}
                                disabled={!canAfford || isLoading || !!successMessage}
                                className={`px-5 py-2 rounded-md text-sm font-bold transition-all duration-200 transform
                                ${canAfford 
                                    ? 'bg-yellow-400 text-black shadow-md hover:bg-yellow-300 disabled:bg-yellow-400/50 disabled:cursor-wait' 
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {isLoading ? 'جار الإرسال...' : 'إهداء'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
    
    return (
        <div className="bg-black/30 border border-gray-700/50 rounded-2xl shadow-lg p-6 flex flex-col justify-center items-center backdrop-blur-sm text-center mt-6 animate-fade-in w-full">
            <div className="relative w-full flex items-center justify-center mb-4">
                 <button
                    onClick={step === 'select' ? () => setStep('search') : onBack}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-yellow-300 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="عودة"
                >
                    <ChevronIcon className="w-7 h-7 transform rotate-180" />
                </button>
                <h2 className="text-2xl font-bold text-white">
                    {step === 'search' ? 'البحث عن مستخدم' : 'اختر هدية'}
                </h2>
            </div>
            
            {step === 'search' && (
                <>
                    {renderSearchBar()}
                    {error && <p className="bg-red-500/20 text-red-300 text-sm py-2 px-4 rounded-md mt-4">{error}</p>}
                    {foundUser && renderSearchResult()}
                </>
            )}

            {step === 'select' && renderCounterList()}
        </div>
    );
};

export default GiftCounter;
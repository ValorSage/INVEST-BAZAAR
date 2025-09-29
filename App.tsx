import React, { useEffect, useState, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import CounterStore from './components/CounterStore';
import MainCounter from './components/MainCounter';
import PointCollector from './components/PointCollector';
import Store from './components/Store';
import NotificationsPanel from './components/NotificationsPanel';
import { Counter, Notification } from './types';
import { UserIcon, ChevronIcon, ArrowRightIcon, CameraIcon, PencilIcon, PhoneIcon, MailIcon, ReferralIcon, CheckIcon } from './components/icons';

const COUNTER_COST = 1000;
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BASE_JEWEL_REWARD_PER_CYCLE = 500;
const BASE_POINT_REWARD_PER_CYCLE = 0;

const App: React.FC = () => {
    const [dollars, setDollars] = useLocalStorage<number>('dollars', 0);
    const [points, setPoints] = useLocalStorage<number>('points', 0);
    const [jewels, setJewels] = useLocalStorage<number>('jewels', 0);
    const [hasCounter, setHasCounter] = useLocalStorage<boolean>('hasCounter', true);
    const [activationStartTime, setActivationStartTime] = useLocalStorage<number | null>('activationStartTime', null);
    const [userCounters, setUserCounters] = useLocalStorage<Counter[]>('userCounters', []);
    const [showStore, setShowStore] = useState(false);
    const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);
    const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    
    // Profile State
    const [profileName, setProfileName] = useLocalStorage<string>('profileName', 'Moody Hey');
    const [profilePicture, setProfilePicture] = useLocalStorage<string | null>('profilePicture', null);
    const [profileEmail, setProfileEmail] = useLocalStorage<string>('profileEmail', 'heymoody785@gmail.com');
    const [profilePhone, setProfilePhone] = useLocalStorage<string>('profilePhone', 'غير متوفر');
    const [tempProfileName, setTempProfileName] = useState(profileName);
    const [tempProfilePhone, setTempProfilePhone] = useState(profilePhone);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [copied, setCopied] = useState(false);
    const referralCode = '0';


    const fileInputRef = useRef<HTMLInputElement>(null);

    const pointRewardPerCycle = userCounters.reduce((sum, counter) => sum + (counter.points || 0), BASE_POINT_REWARD_PER_CYCLE);
    const jewelRewardPerCycle = userCounters.reduce((sum, counter) => sum + (counter.jewels || 0), BASE_JEWEL_REWARD_PER_CYCLE);
    
    const addNotification = (message: string) => {
        const newNotification: Notification = {
            id: new Date().toISOString() + Math.random(),
            message,
            timestamp: Date.now(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    useEffect(() => {
        if (!notifications.some(n => n.message.includes("أهلاً بك"))) {
            addNotification('أهلاً بك في لعبة عداد النقاط!');
        }
    }, []);

    useEffect(() => {
        if (activationStartTime) {
            const timeSinceActivation = Date.now() - activationStartTime;
            if (timeSinceActivation >= COOLDOWN_PERIOD) {
                const message = `تمت إضافة ${jewelRewardPerCycle} جوهرة و ${pointRewardPerCycle.toLocaleString()} نقطة إلى رصيدك!`;
                addNotification(message);
                setJewels(prev => prev + jewelRewardPerCycle);
                setPoints(prev => prev + pointRewardPerCycle);
                setActivationStartTime(null); 
            }
        }
    }, [activationStartTime, setJewels, setPoints, setActivationStartTime, pointRewardPerCycle, jewelRewardPerCycle]);

    const handleCollectPoints = () => {
        setPoints(prevPoints => prevPoints + 10);
    };

    const handleBuyCounter = () => {
        if (points >= COUNTER_COST) {
            setPoints(prevPoints => prevPoints - COUNTER_COST);
            setHasCounter(true);
        }
    };

    const handleActivateCounter = () => {
        if (!activationStartTime) {
            const timeSinceLastActivation = activationStartTime ? Date.now() - activationStartTime : COOLDOWN_PERIOD;
            if (timeSinceLastActivation >= COOLDOWN_PERIOD) {
                setActivationStartTime(Date.now());
            }
        }
    };

    const handlePurchaseCounter = (counter: Counter) => {
        if (counter.priceCurrency === 'points') {
            if (points >= counter.price) {
                setPoints(prevPoints => prevPoints - counter.price);
                setUserCounters(prevCounters => [...prevCounters, counter]);
            }
        } else if (counter.priceCurrency === 'jewels') {
            if (jewels >= counter.price) {
                setJewels(prevJewels => prevJewels - counter.price);
                setUserCounters(prevCounters => [...prevCounters, counter]);
            }
        }
    };
    
    const handleToggleNotifications = () => {
        setShowNotificationsPanel(prev => !prev);
        if (!showNotificationsPanel) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const handleClearNotifications = () => {
        setNotifications([]);
    };

    const handleMenuClick = () => {
        setShowMenu(true);
    };

    const handleBackToMain = () => {
        setShowMenu(false);
        setShowUserProfile(false); 
    };

    const handleOpenUserProfile = () => {
        setShowUserProfile(true);
    };

    const handleBackToMenu = () => {
        setShowUserProfile(false);
    };

    // Profile Screen Handlers
    const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfilePictureClick = () => {
        fileInputRef.current?.click();
    };

    const handleSaveName = () => {
        setProfileName(tempProfileName);
        setIsEditingName(false);
    };
    
    const handleSavePhone = () => {
        setProfilePhone(tempProfilePhone);
        setIsEditingPhone(false);
    };
    
    const handleCopyCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (showMenu) {
        if (showUserProfile) {
            // USER PROFILE SCREEN - RE-THEMED to light
            return (
                 <div className="fixed inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 font-sans animate-fade-in-fast overflow-y-auto">
                    <div className="container mx-auto max-w-lg min-h-screen flex flex-col p-4 text-slate-900">
                        {/* Header */}
                        <header className="flex items-center justify-between py-2">
                             <h1 className="text-2xl font-bold text-slate-900">الملف الشخصي</h1>
                            <button onClick={handleBackToMenu} className="p-2 text-slate-900" aria-label="عودة">
                                <ArrowRightIcon className="w-7 h-7" />
                            </button>
                        </header>

                        {/* Profile Summary */}
                        <section className="flex items-center gap-4 py-6 px-2">
                             <div className="text-right flex-grow">
                                <h2 className="text-2xl font-bold text-slate-900">{profileName}</h2>
                            </div>
                            <div className="relative flex-shrink-0">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleProfilePictureChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button onClick={handleProfilePictureClick} className="w-24 h-24 rounded-full border-4 border-white/70 shadow-lg" aria-label="تغيير الصورة الرمزية">
                                    {profilePicture ? (
                                        <img src={profilePicture} alt="صورة الملف الشخصي" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-white/50 flex items-center justify-center">
                                             <UserIcon className="w-12 h-12 text-slate-500" />
                                        </div>
                                    )}
                                </button>
                                <div className="absolute bottom-0 left-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-800 border-2 border-amber-500 cursor-pointer">
                                    <CameraIcon className="w-5 h-5"/>
                                </div>
                            </div>
                        </section>

                        {/* Personal Information */}
                        <section className="mt-4">
                            <h3 className="text-xl font-bold text-slate-800 mb-3 pr-2">المعلومات الشخصية</h3>
                            <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-lg p-4 space-y-2 border border-white/50">
                                {/* Full Name */}
                                <div className="flex items-center justify-between py-3 border-b border-amber-800/20">
                                    <button onClick={() => isEditingName ? handleSaveName() : setIsEditingName(true)} className="p-2 text-slate-500 hover:text-slate-900">
                                       {isEditingName ? <CheckIcon className="w-6 h-6 text-green-500"/> : <PencilIcon className="w-5 h-5" />}
                                    </button>
                                    <div className="text-right flex-grow flex items-center justify-end gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-800">الاسم الكامل</p>
                                             {isEditingName ? (
                                                <input
                                                    type="text"
                                                    value={tempProfileName}
                                                    onChange={(e) => setTempProfileName(e.target.value)}
                                                    className="w-full bg-transparent text-right text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-600 rounded"
                                                    autoFocus
                                                />
                                            ) : (
                                                <p className="text-slate-700">{profileName}</p>
                                            )}
                                        </div>
                                        <UserIcon className="w-6 h-6 text-amber-600" />
                                    </div>
                                </div>
                                {/* Phone Number */}
                                 <div className="flex items-center justify-between py-3 border-b border-amber-800/20">
                                     <button onClick={() => isEditingPhone ? handleSavePhone() : setIsEditingPhone(true)} className="p-2 text-slate-500 hover:text-slate-900">
                                       {isEditingPhone ? <CheckIcon className="w-6 h-6 text-green-500"/> : <PencilIcon className="w-5 h-5" />}
                                    </button>
                                    <div className="text-right flex-grow flex items-center justify-end gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-800">رقم الهاتف</p>
                                             {isEditingPhone ? (
                                                <input
                                                    type="text"
                                                    value={tempProfilePhone}
                                                    onChange={(e) => setTempProfilePhone(e.target.value)}
                                                    className="w-full bg-transparent text-right text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-600 rounded"
                                                    autoFocus
                                                />
                                            ) : (
                                                <p className="text-slate-700">{profilePhone}</p>
                                            )}
                                        </div>
                                        <PhoneIcon className="w-6 h-6 text-amber-600" />
                                    </div>
                                </div>
                                {/* Email */}
                                <div className="flex items-center justify-between py-3 border-b border-amber-800/20">
                                    <div className="w-10 h-10"></div> {/* Spacer */}
                                    <div className="text-right flex-grow flex items-center justify-end gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-800">البريد الإلكتروني</p>
                                            <p className="text-slate-700">{profileEmail}</p>
                                        </div>
                                        <MailIcon className="w-6 h-6 text-amber-600" />
                                    </div>
                                </div>
                                {/* Referral Code */}
                                <div className="flex items-center justify-between py-3">
                                    <div className="relative p-2">
                                        <span onClick={handleCopyCode} className="material-symbols-outlined text-slate-500 hover:text-slate-900 transition-colors">
                                            content_copy
                                        </span>
                                        {copied && <span className="absolute -top-6 -right-5 text-xs bg-slate-800 text-white px-2 py-0.5 rounded whitespace-nowrap">تم النسخ!</span>}
                                    </div>
                                    <div className="text-right flex-grow flex items-center justify-end gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-800">كود الإحالة</p>
                                            <p className="text-slate-700 tracking-wider">{referralCode}</p>
                                        </div>
                                        <ReferralIcon className="w-6 h-6 text-amber-600" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            );
        }

        // MAIN MENU SCREEN
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md mx-auto bg-black/30 border border-gray-700/50 rounded-2xl p-6 text-center backdrop-blur-sm animate-fade-in-fast">
                    <h1 className="text-2xl font-bold text-white mb-6">القائمة</h1>
                    
                    <div className="flex flex-col items-center gap-2 mb-6">
                        <div className="w-20 h-20 rounded-full border-2 border-yellow-400/50 p-1 bg-black/20">
                            {profilePicture ? (
                                <img src={profilePicture} alt="صورة الملف الشخصي" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                                    <UserIcon className="w-10 h-10 text-gray-500" />
                                </div>
                            )}
                        </div>
                        <p className="text-xl font-bold text-white select-none">{profileName}</p>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                        <button
                            onClick={handleOpenUserProfile}
                            className="w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform bg-black/20 border border-gray-700 text-white hover:bg-black/40 shadow-lg flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <UserIcon className="w-6 h-6 text-yellow-300" />
                                <span>ملف المستخدم</span>
                            </div>
                            <ChevronIcon className="w-6 h-6 text-gray-400 transform rotate-180" />
                        </button>
                        <div className="text-gray-400 py-6 text-center border-t border-b border-gray-700/50">سيتم إضافة محتوى هنا قريباً.</div>
                    </div>

                    <button
                        onClick={handleBackToMain}
                        className="mt-6 w-full py-3 px-6 rounded-full font-semibold text-lg transition-all duration-300 transform bg-black border border-gray-700 text-yellow-300 hover:bg-gray-900 shadow-lg"
                    >
                        العودة للعبة
                    </button>
                </div>
            </div>
        )
    }

    const renderContent = () => {
        if (showStore) {
            return <Store 
                onBack={() => setShowStore(false)} 
                onPurchase={handlePurchaseCounter}
                userPoints={points}
                userJewels={jewels}
            />;
        }
        
        if (!hasCounter) {
            return (
                <div className="flex flex-col gap-6">
                    <PointCollector onCollect={handleCollectPoints} />
                    <CounterStore points={points} onBuy={handleBuyCounter} cost={COUNTER_COST} />
                </div>
            );
        }

        return (
            <MainCounter
                activationStartTime={activationStartTime}
                onActivate={handleActivateCounter}
                cooldownPeriod={COOLDOWN_PERIOD}
                jewelRewardPerCycle={jewelRewardPerCycle}
                pointReward={pointRewardPerCycle}
                onOpenStore={() => setShowStore(true)}
            />
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-amber-500/40">
            {showNotificationsPanel && (
                <NotificationsPanel 
                    notifications={notifications}
                    onClose={handleToggleNotifications}
                    onClear={handleClearNotifications}
                />
            )}
            <div className="w-full max-w-md mx-auto">
                <Header 
                    dollars={dollars} 
                    points={points} 
                    jewels={jewels}
                    onToggleNotifications={handleToggleNotifications}
                    unreadCount={unreadCount}
                    onMenuClick={handleMenuClick}
                />
                <main className="mt-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;
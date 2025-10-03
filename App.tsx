
import React, { useEffect, useState, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import CounterStore from './components/CounterStore';
import MainCounter from './components/MainCounter';
import PointCollector from './components/PointCollector';
import Store from './components/Store';
import NotificationsPanel from './components/NotificationsPanel';
import Auth from './components/Auth';
import GiftCounter from './components/GiftCounter';
import AccountVerification from './components/AccountVerification';
import Chat from './components/Chat';
import CreateRoomModal from './components/CreateRoomModal';
import RoomView from './components/RoomView';
import { Counter, Notification, User, ChatRoom, ChatMessage } from './types';
import { UserIcon, ChevronIcon, ArrowRightIcon, CameraIcon, PencilIcon, PhoneIcon, MailIcon, ReferralIcon, CheckIcon, LockIcon, ShieldCheckIcon, DocumentIcon, BellIcon, HeadsetIcon, ExitIcon, LogoutIcon, IdIcon, XIcon, ShieldExclamationIcon, ClockIcon, GamesIcon, WithdrawIcon, ChatIcon } from './components/icons';

const COUNTER_COST = 1000;
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BASE_JEWEL_REWARD_PER_CYCLE = 500;
const BASE_POINT_REWARD_PER_CYCLE = 0;
const NAME_CHANGE_COST = 5000;
const MAX_FREE_CHANGES = 2;
const PIC_CHANGE_COST = 5000;
const MAX_FREE_PIC_CHANGES = 2;


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
    const [allUsers, setAllUsers] = useLocalStorage<User[]>('users', []);

    // Per-user data keys now based on the unique userId
    const userDataKey = (key: string) => currentUser ? `${key}_${currentUser.userId}` : key;
    const globalDataKey = (key: string) => key;

    const [dollars, setDollars] = useLocalStorage<number>(userDataKey('dollars'), 0);
    const [points, setPoints] = useLocalStorage<number>(userDataKey('points'), 0);
    const [jewels, setJewels] = useLocalStorage<number>(userDataKey('jewels'), 0);
    const [hasCounter, setHasCounter] = useLocalStorage<boolean>(userDataKey('hasCounter'), true);
    const [activationStartTime, setActivationStartTime] = useLocalStorage<number | null>(userDataKey('activationStartTime'), null);
    const [userCounters, setUserCounters] = useLocalStorage<Counter[]>(userDataKey('userCounters'), []);
    const [notifications, setNotifications] = useLocalStorage<Notification[]>(userDataKey('notifications'), []);
    
    // Profile State
    const [profileName, setProfileName] = useLocalStorage<string>(userDataKey('profileName'), 'Moody Hey');
    const [profilePicture, setProfilePicture] = useLocalStorage<string | null>(userDataKey('profilePicture'), null);
    const [profileEmail, setProfileEmail] = useLocalStorage<string>(userDataKey('profileEmail'), 'heymoody785@gmail.com');
    const [profilePhone, setProfilePhone] = useLocalStorage<string>(userDataKey('profilePhone'), 'غير متوفر');


    const [showStore, setShowStore] = useState(false);
    const [showGiftCounterScreen, setShowGiftCounterScreen] = useState(false);
    const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [showNotificationsLogScreen, setShowNotificationsLogScreen] = useState(false);
    const [activeNotificationCategory, setActiveNotificationCategory] = useState<Notification['category']>('counter');
    const [showVerification, setShowVerification] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showSecondaryMenu, setShowSecondaryMenu] = useState(false);
    
    // Chat state
    const [showChat, setShowChat] = useState(false);
    const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
    const [chatRooms, setChatRooms] = useLocalStorage<ChatRoom[]>(globalDataKey('chatRooms'), []);
    const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useLocalStorage<{ [key: string]: ChatMessage[] }>(globalDataKey('chatMessages'), {});


    const [tempProfilePhone, setTempProfilePhone] = useState(profilePhone);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const [showNameChangeModal, setShowNameChangeModal] = useState(false);
    const [showPicChangeModal, setShowPicChangeModal] = useState(false);
    const [newProfilePicData, setNewProfilePicData] = useState<string | null>(null);


    const fileInputRef = useRef<HTMLInputElement>(null);

    // Effect to initialize user data on login
    useEffect(() => {
        if (currentUser) {
            setProfileName(currentUser.name);
            setProfileEmail(currentUser.email || 'غير مسجل');
            setProfilePhone(currentUser.phone || 'غير متوفر');
            // Reset temp fields on user change
            setTempProfilePhone(currentUser.phone || profilePhone);
        }
    }, [currentUser]);
    
    useEffect(() => {
        // One-time migration for old notifications without a category
        if (notifications.length > 0 && notifications.some(n => !n.category)) {
            setNotifications(prev => prev.map(n => {
                if (n.category) return n; // Already has category
                const msg = n.message;
                let cat: Notification['category'] = 'general';
                if ((msg.includes('جوهرة') || msg.includes('نقطة')) && msg.includes('إلى رصيدك')) {
                    cat = 'counter';
                } else if (msg.includes('أهديت') || msg.includes('تلقيت هدية')) {
                    cat = 'transactions';
                } else if (msg.includes('غرفة') || msg.includes('دخلت') || msg.includes('غادر')) {
                    cat = 'chat';
                }
                return { ...n, category: cat };
            }));
        }
    }, []); // Run only once


    const pointRewardPerCycle = userCounters.reduce((sum, counter) => sum + (counter.points || 0), BASE_POINT_REWARD_PER_CYCLE);
    const jewelRewardPerCycle = userCounters.reduce((sum, counter) => sum + (counter.jewels || 0), BASE_JEWEL_REWARD_PER_CYCLE);
    
    const formatTimeAgo = (timestamp: number): string => {
        const now = Date.now();
        const seconds = Math.floor((now - timestamp) / 1000);

        if (seconds < 60) return `الآن`;
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `منذ ${minutes} دقيقة`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `منذ ${hours} ساعة`;

        const days = Math.floor(hours / 24);
        return `منذ ${days} يوم`;
    };

    const addNotification = (message: string, category: Notification['category']) => {
        const newNotification: Notification = {
            id: new Date().toISOString() + Math.random(),
            message,
            timestamp: Date.now(),
            read: false,
            category,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    useEffect(() => {
        if (currentUser && !notifications.some(n => n.message.includes("أهلاً بك"))) {
            addNotification(`أهلاً بك في بازار علي بابا، ${currentUser.name}!`, 'general');
        }
    }, [currentUser]);

    useEffect(() => {
        if (activationStartTime) {
            const timeSinceActivation = Date.now() - activationStartTime;
            if (timeSinceActivation >= COOLDOWN_PERIOD) {
                const message = `تم إضافة ${jewelRewardPerCycle} جوهرة`;
                addNotification(message, 'counter');
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

    const handleGiftCounter = (recipientId: string, counter: Counter): { success: boolean; message: string } => {
        const recipient = allUsers.find(u => u.userId === recipientId);

        if (!recipient) {
            return { success: false, message: 'المستخدم غير موجود.' };
        }
        if (recipient.userId === currentUser!.userId) {
            return { success: false, message: 'لا يمكنك إهداء نفسك.' };
        }
        if (counter.priceCurrency === 'points' && points < counter.price) {
            return { success: false, message: 'ليس لديك نقاط كافية.' };
        }
        if (counter.priceCurrency === 'jewels' && jewels < counter.price) {
            return { success: false, message: 'ليس لديك جواهر كافية.' };
        }

        if (counter.priceCurrency === 'points') {
            setPoints(p => p - counter.price);
        } else {
            setJewels(j => j - counter.price);
        }

        const recipientCountersKey = `userCounters_${recipient.userId}`;
        const storedCounters = localStorage.getItem(recipientCountersKey);
        const recipientCounters: Counter[] = storedCounters ? JSON.parse(storedCounters) : [];
        localStorage.setItem(recipientCountersKey, JSON.stringify([...recipientCounters, counter]));

        const recipientNotificationsKey = `notifications_${recipient.userId}`;
        const storedNotifications = localStorage.getItem(recipientNotificationsKey);
        const recipientNotifications: Notification[] = storedNotifications ? JSON.parse(storedNotifications) : [];
        const newNotification: Notification = {
            id: new Date().toISOString() + Math.random(),
            message: `لقد تلقيت هدية! أهداك ${currentUser!.name} (${counter.name}).`,
            timestamp: Date.now(),
            read: false,
            category: 'transactions',
        };
        localStorage.setItem(recipientNotificationsKey, JSON.stringify([newNotification, ...recipientNotifications]));

        addNotification(`لقد أهديت ${recipient.name} (${counter.name}) بنجاح.`, 'transactions');
        
        return { success: true, message: 'تم إرسال الهدية بنجاح!' };
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
        setShowNotificationsLogScreen(false);
    };

    const handleOpenUserProfile = () => {
        setShowUserProfile(true);
    };
    
    const handleOpenNotificationsLogScreen = () => {
        setShowNotificationsLogScreen(true);
        setNotifications(prev => prev.map(n => ({...n, read: true})));
    };

    const handleBackToMenu = () => {
        setShowUserProfile(false);
    };

    const handleOpenVerification = () => {
        setShowUserProfile(false);
        setShowVerification(true);
    };

    const handleBackFromVerification = () => {
        setShowVerification(false);
        setShowUserProfile(true);
    };

    const handleVerificationSuccess = (verifiedPhone: string) => {
        const updatedUser = { ...currentUser!, phone: verifiedPhone, isVerified: true };
        setCurrentUser(updatedUser);
        setAllUsers(prevUsers => prevUsers.map(u => u.userId === currentUser!.userId ? updatedUser : u));
        setProfilePhone(verifiedPhone);
        setTempProfilePhone(verifiedPhone);
        setShowVerification(false);
        setShowUserProfile(true);
        addNotification('تهانينا! تم توثيق حسابك بنجاح.', 'general');
    };

    // Profile Screen Handlers
    const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProfilePicData(reader.result as string);
                setShowPicChangeModal(true);
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }
    };
    
    const handleConfirmPicChange = (): { success: boolean; message: string } => {
        const currentChangeCount = currentUser?.profilePictureChangeCount ?? 0;
        const isPaid = currentChangeCount >= MAX_FREE_PIC_CHANGES;

        if (isPaid && points < PIC_CHANGE_COST) {
            return {
                success: false,
                message: `رصيدك غير كافٍ لتغيير صورة الملف الشخصي. تحتاج ${PIC_CHANGE_COST.toLocaleString()} نقطة.`
            };
        }

        if (isPaid) {
            setPoints(p => p - PIC_CHANGE_COST);
        }

        setProfilePicture(newProfilePicData);

        const updatedUser = {
            ...currentUser!,
            profilePictureChangeCount: currentChangeCount + 1,
        };

        setCurrentUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.userId === currentUser!.userId ? updatedUser : u));

        const notifMessage = isPaid
            ? `تم تغيير صورة الملف الشخصي بنجاح مقابل ${PIC_CHANGE_COST.toLocaleString()} نقطة.`
            : `تم تغيير صورة الملف الشخصي بنجاح.`;
        addNotification(notifMessage, 'general');
        
        setShowPicChangeModal(false);
        setNewProfilePicData(null);

        return { success: true, message: 'Success' };
    };

    const handleProfilePictureClick = () => {
        fileInputRef.current?.click();
    };

    const handleConfirmNameChange = (newName: string): { success: boolean; message: string } => {
        const currentChangeCount = currentUser?.nameChangeCount ?? 0;
        
        const performUpdate = (isPaid: boolean) => {
            const updatedUser = { 
                ...currentUser!, 
                name: newName, 
                ...(!isPaid && { nameChangeCount: currentChangeCount + 1 })
            };
            
            if(isPaid) {
                setPoints(p => p - NAME_CHANGE_COST);
            }

            setCurrentUser(updatedUser);
            setAllUsers(prev => prev.map(u => u.userId === currentUser!.userId ? updatedUser : u));
            setProfileName(newName);
            
            const notifMessage = isPaid 
                ? `تم تغيير اسمك بنجاح إلى "${newName}" مقابل ${NAME_CHANGE_COST.toLocaleString()} نقطة.`
                : `تم تغيير اسمك بنجاح إلى "${newName}".`;
            addNotification(notifMessage, 'general');
            setShowNameChangeModal(false);
        };
    
        if (currentChangeCount < MAX_FREE_CHANGES) {
            performUpdate(false);
            return { success: true, message: 'Success' };
        } else {
            if (points >= NAME_CHANGE_COST) {
                performUpdate(true);
                return { success: true, message: 'Success' };
            } else {
                return { success: false, message: 'رصيد النقاط غير كافٍ لتغيير الاسم.' };
            }
        }
    };
    
    const handleSavePhone = () => {
        const updatedUser = { ...currentUser!, phone: tempProfilePhone };
        setCurrentUser(updatedUser);
        setAllUsers(prevUsers => prevUsers.map(u => u.userId === currentUser!.userId ? updatedUser : u));
        setProfilePhone(tempProfilePhone);
        setIsEditingPhone(false);
    };

    const handleCancelEditPhone = () => {
        setIsEditingPhone(false);
        setTempProfilePhone(profilePhone);
    };
    
    const handleCopyUserId = () => {
        if (currentUser?.userId) {
            navigator.clipboard.writeText(currentUser.userId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setCurrentUser(null);
        setShowLogoutConfirm(false);
        setShowMenu(false);
        setShowUserProfile(false);
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    // Chat handlers
    const handleOpenChat = () => setShowChat(true);
    const handleCloseChat = () => {
        setShowChat(false);
        setShowCreateRoomModal(false);
        setActiveRoom(null); // Ensure room is cleared when leaving chat section
    };
    const handleOpenCreateRoomModal = () => setShowCreateRoomModal(true);
    const handleCloseCreateRoomModal = () => setShowCreateRoomModal(false);
    const handleCreateRoom = (roomDetails: Omit<ChatRoom, 'id' | 'members' | 'creatorId'>) => {
        const newRoom: ChatRoom = {
            ...roomDetails,
            id: `R${Math.floor(1000 + Math.random() * 9000)}`,
            members: [currentUser!.userId], // Creator is the first member
            creatorId: currentUser!.userId
        };
        setChatRooms(prev => [...prev, newRoom]);
        handleCloseCreateRoomModal();
        addNotification(`تم إنشاء غرفة "${newRoom.name}" بنجاح.`, 'chat');
    };
    
    const handleJoinRoom = (roomId: string) => {
        const room = chatRooms.find(r => r.id === roomId);
        if (!room) {
            alert('الغرفة غير موجودة.');
            return;
        }

        const isMember = room.members && room.members.includes(currentUser!.userId);

        // If user is already a member, just open the room
        if (isMember) {
            setActiveRoom(room);
            addNotification(`لقد دخلت غرفة "${room.name}".`, 'chat');
            return;
        }
    
        // If not a member, handle joining logic
        // Check for entry fees for private rooms
        if (room.type === 'private' && room.entryFee) {
            if (room.feeCurrency === 'points') {
                if (points < room.entryFee) {
                    alert('ليس لديك نقاط كافية لدخول هذه الغرفة.');
                    return;
                }
                setPoints(p => p - room.entryFee!);
            } else if (room.feeCurrency === 'jewels') {
                if (jewels < room.entryFee) {
                    alert('ليس لديك جواهر كافية لدخول هذه الغرفة.');
                    return;
                }
                setJewels(j => j - room.entryFee!);
            }
        }
        
        // Add user to members list and post join message
        setChatRooms(prevRooms => prevRooms.map(r => 
            r.id === roomId 
            ? { ...r, members: [...(r.members || []), currentUser!.userId] } 
            : r
        ));
        
        const joinMessage: ChatMessage = {
            id: new Date().toISOString() + Math.random(),
            roomId: room.id,
            senderId: 'system',
            senderName: 'System',
            text: `${currentUser!.name} دخل الغرفة`,
            timestamp: Date.now(),
            type: 'notification',
        };
        
        setMessages(prev => ({
            ...prev,
            [room.id]: [...(prev[room.id] || []), joinMessage]
        }));
    
        addNotification(`لقد دخلت غرفة "${room.name}" بنجاح.`, 'chat');
        setActiveRoom(room);
    };

    const handleLeaveRoom = () => {
        if (activeRoom) {
            const leaveMessage: ChatMessage = {
                id: new Date().toISOString() + Math.random(),
                roomId: activeRoom.id,
                senderId: 'system',
                senderName: 'System',
                text: `${currentUser!.name} غادر الغرفة`,
                timestamp: Date.now(),
                type: 'notification',
            };
    
            setMessages(prev => ({
                ...prev,
                [activeRoom.id]: [...(prev[activeRoom.id] || []), leaveMessage]
            }));
        }
        setActiveRoom(null);
    };

    const handleSendMessage = (roomId: string, text: string) => {
        if (!text.trim() || !currentUser) return;
    
        const newMessage: ChatMessage = {
            id: new Date().toISOString() + Math.random(),
            roomId: roomId,
            senderId: currentUser.userId,
            senderName: currentUser.name,
            text: text.trim(),
            timestamp: Date.now(),
            type: 'message',
        };
    
        setMessages(prev => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), newMessage]
        }));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const ProfilePictureChangeModalComponent = () => {
        const [error, setError] = useState('');
        
        const currentChangeCount = currentUser?.profilePictureChangeCount ?? 0;
        const isFree = currentChangeCount < MAX_FREE_PIC_CHANGES;
        const remainingFreeChanges = Math.max(0, MAX_FREE_PIC_CHANGES - currentChangeCount);
        const cost = isFree ? 'مجاني' : `${PIC_CHANGE_COST.toLocaleString()} نقطة`;

        const handleSubmit = () => {
            setError('');
            const result = handleConfirmPicChange();
            if (!result.success) {
                setError(result.message);
            }
        };

        const handleCancel = () => {
            setShowPicChangeModal(false);
            setNewProfilePicData(null);
        };

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-fast">
                <div className="w-full max-w-sm bg-black/60 border border-gray-700/50 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center text-white">
                    <h2 className="text-xl font-bold mb-4">تأكيد تغيير الصورة</h2>
                    
                    <div className="w-32 h-32 rounded-full border-4 border-amber-500 mb-4 overflow-hidden">
                        <img src={newProfilePicData!} alt="صورة الملف الشخصي الجديدة" className="w-full h-full object-cover" />
                    </div>

                    <div className="text-sm text-gray-300 mb-4 bg-black/30 p-3 rounded-lg text-right leading-relaxed">
                        <p>يمكنك تغيير صورة ملفك الشخصي مجانًا مرتين. بعد ذلك، ستكون التكلفة 5000 نقطة لكل تغيير.</p>
                    </div>

                    <div className="w-full text-right bg-black/30 p-3 rounded-lg mb-4">
                        <p className="font-semibold">
                            التكلفة: <span className={`font-bold ${isFree ? 'text-green-400' : 'text-yellow-400'}`}>{cost}</span>
                        </p>
                        {isFree && <p className="text-xs text-gray-400">({`متبقٍ ${remainingFreeChanges} ${remainingFreeChanges === 1 ? 'محاولة مجانية' : 'محاولات مجانية'}`})</p>}
                    </div>

                    {error && <p className="w-full text-right bg-red-500/20 text-red-300 text-sm py-2 px-3 rounded-md mt-2 mb-4">{error}</p>}

                    <div className="w-full flex items-center gap-4 mt-2">
                        <button
                            onClick={handleCancel}
                            className="flex-1 py-2.5 px-4 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-500 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-2.5 px-4 rounded-lg font-semibold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
                        >
                            تأكيد
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const NameChangeModalComponent = () => {
        const [newName, setNewName] = useState(profileName);
        const [error, setError] = useState('');
        
        const currentChangeCount = currentUser?.nameChangeCount ?? 0;
        const isFree = currentChangeCount < MAX_FREE_CHANGES;
        const remainingFreeChanges = MAX_FREE_CHANGES - currentChangeCount;
        const cost = isFree ? 'مجاني' : `${NAME_CHANGE_COST.toLocaleString()} نقطة`;

        const handleSubmit = () => {
            setError('');
            if (!newName.trim()) {
                setError('لا يمكن أن يكون الاسم فارغًا.');
                return;
            }
            if (newName.trim() === profileName) {
                setError('الرجاء إدخال اسم جديد.');
                return;
            }

            const result = handleConfirmNameChange(newName.trim());

            if (!result.success) {
                setError(result.message);
            }
        }

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-fast">
                <div className="w-full max-w-sm bg-black/60 border border-gray-700/50 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center text-white">
                    <h2 className="text-xl font-bold mb-4">تغيير اسم المستخدم</h2>
                    <div className="text-sm text-gray-300 mb-4 bg-black/30 p-3 rounded-lg text-right leading-relaxed">
                        <p>يمكنك تغيير اسمك مجانًا مرتين فقط. بعد استنفاد المحاولتين، يمكنك تغيير الاسم مقابل 5000 نقطة من رصيدك.</p>
                    </div>

                    <div className="w-full text-right bg-black/30 p-3 rounded-lg mb-4">
                        <p className="font-semibold">
                            التكلفة: <span className={`font-bold ${isFree ? 'text-green-400' : 'text-yellow-400'}`}>{cost}</span>
                        </p>
                        {isFree && <p className="text-xs text-gray-400">({`متبقٍ ${remainingFreeChanges} ${remainingFreeChanges === 1 ? 'محاولة مجانية' : 'محاولات مجانية'}`})</p>}
                    </div>

                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="أدخل الاسم الجديد"
                        className="w-full bg-black/50 border border-gray-600 rounded-lg py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-right"
                        autoFocus
                    />

                    {error && <p className="w-full text-right bg-red-500/20 text-red-300 text-sm py-2 px-3 rounded-md mt-4">{error}</p>}

                    <div className="w-full flex items-center gap-4 mt-6">
                        <button
                            onClick={() => setShowNameChangeModal(false)}
                            className="flex-1 py-2.5 px-4 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-500 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-2.5 px-4 rounded-lg font-semibold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors disabled:bg-yellow-500/50 disabled:cursor-not-allowed"
                            disabled={!newName.trim() || newName.trim() === profileName}
                        >
                            تأكيد
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const SecondaryMenuComponent = () => (
        <div className="bg-black/30 border border-gray-700/50 rounded-2xl shadow-lg p-6 flex flex-col justify-center items-center backdrop-blur-sm text-center mt-6 animate-fade-in w-full">
            <div className="relative w-full flex items-center justify-center mb-4">
                <button
                    onClick={() => setShowSecondaryMenu(false)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-yellow-300 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="عودة"
                >
                    <ChevronIcon className="w-7 h-7 transform rotate-180" />
                </button>
                <h2 className="text-2xl font-bold text-white">قائمة جديدة</h2>
            </div>
            <div className="flex-grow w-full flex flex-col items-center justify-center text-center rounded-2xl p-6 min-h-[300px]">
                <p className="text-white text-lg">سيتم إضافة المزيد من الميزات هنا قريباً.</p>
            </div>
        </div>
    );

    const logoutConfirmModal = showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-fast">
            <div className="w-full max-w-sm bg-black/50 border border-gray-700/50 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
                <h2 className="text-xl font-bold text-white mb-4">تأكيد تسجيل الخروج</h2>
                <p className="text-gray-300 mb-6">هل أنت متأكد أنك تريد تسجيل الخروج؟</p>
                <div className="w-full flex items-center gap-4">
                    <button
                        onClick={cancelLogout}
                        className="flex-1 py-2.5 px-4 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-500 transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={confirmLogout}
                        className="flex-1 py-2.5 px-4 rounded-lg font-semibold bg-red-600/80 text-white hover:bg-red-600 transition-colors"
                    >
                        تأكيد
                    </button>
                </div>
            </div>
        </div>
    );

    if (!currentUser) {
        return <Auth onLoginSuccess={setCurrentUser} />;
    }

    if (showVerification) {
        return (
            <AccountVerification
                currentUser={currentUser}
                onBack={handleBackFromVerification}
                onVerified={handleVerificationSuccess}
            />
        );
    }

    if (showChat) {
        if (activeRoom) {
            return (
                <RoomView
                    room={activeRoom}
                    currentUser={currentUser}
                    messages={messages[activeRoom.id] || []}
                    onBack={handleLeaveRoom}
                    onSendMessage={handleSendMessage}
                />
            );
        }

        return (
            <>
                <Chat
                    rooms={chatRooms}
                    onBack={handleCloseChat}
                    onOpenCreateRoom={handleOpenCreateRoomModal}
                    onJoinRoom={handleJoinRoom}
                />
                {showCreateRoomModal && (
                    <CreateRoomModal
                        onClose={handleCloseCreateRoomModal}
                        onCreate={handleCreateRoom}
                    />
                )}
            </>
        );
    }

    if (showMenu) {
        if (showUserProfile) {
            // USER PROFILE SCREEN - DARK THEME CARDS
            return (
                 <>
                    <div className="fixed inset-0 font-sans animate-fade-in-fast overflow-y-auto" style={{ background: 'radial-gradient(circle, #FBBF24 0%, #F59E0B 100%)' }}>
                        <div className="container mx-auto max-w-lg min-h-screen flex flex-col p-4 pb-8 text-slate-800">
                            {/* Header */}
                            <header className="relative flex items-center justify-center py-2">
                                <h1 className="text-2xl font-bold text-slate-900">الملف الشخصي</h1>
                                <button onClick={handleBackToMenu} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-800" aria-label="عودة">
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
                                    <button onClick={handleProfilePictureClick} className="w-24 h-24 rounded-full border-4 border-amber-500 shadow-lg" aria-label="تغيير الصورة الرمزية">
                                        {profilePicture ? (
                                            <img src={profilePicture} alt="صورة الملف الشخصي" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-amber-100 flex items-center justify-center">
                                                <UserIcon className="w-12 h-12 text-amber-500" />
                                            </div>
                                        )}
                                    </button>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-slate-800 border-2 border-amber-500 cursor-pointer">
                                        <CameraIcon className="w-5 h-5"/>
                                    </div>
                                </div>
                            </section>

                            {/* Personal Information */}
                            <section className="mt-4">
                                <div className="flex items-center gap-3 mb-3 pr-2">
                                    <div className="w-1 h-5 bg-amber-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-slate-900">المعلومات الشخصية</h3>
                                </div>
                                <div className="bg-black/40 border border-gray-700/50 rounded-2xl shadow-lg p-4 backdrop-blur-sm">
                                    {/* Full Name */}
                                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                                        <div className="text-right flex-grow flex items-center gap-3">
                                            <div className="w-10 h-10 flex items-center justify-center bg-black/30 rounded-full">
                                                <UserIcon className="w-6 h-6 text-gray-200" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-100">الاسم الكامل</p>
                                                <p className="text-gray-300">{profileName}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowNameChangeModal(true)} className="p-2 text-gray-400 hover:text-white">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {/* Phone Number */}
                                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                                        <div className="text-right flex-grow flex items-center gap-3">
                                            <div className="w-10 h-10 flex items-center justify-center bg-black/30 rounded-full">
                                                <PhoneIcon className="w-6 h-6 text-gray-200" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-100">رقم الهاتف</p>
                                                {isEditingPhone && !currentUser.isVerified ? (
                                                    <input
                                                        type="text"
                                                        value={tempProfilePhone}
                                                        onChange={(e) => setTempProfilePhone(e.target.value)}
                                                        className="w-full bg-transparent text-right text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <p className="text-gray-300">{profilePhone}</p>
                                                )}
                                            </div>
                                        </div>
                                        {isEditingPhone ? (
                                            <div className="flex items-center gap-1">
                                                <button onClick={handleSavePhone} className="p-2 text-green-500 hover:text-green-400 transition-colors">
                                                    <CheckIcon className="w-6 h-6" />
                                                </button>
                                                <button onClick={handleCancelEditPhone} className="p-2 text-red-500 hover:text-red-400 transition-colors">
                                                    <XIcon className="w-6 h-6" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setIsEditingPhone(true)} className="p-2 text-gray-400 hover:text-white" disabled={currentUser.isVerified}>
                                                <PencilIcon className={`w-5 h-5 ${currentUser.isVerified && 'opacity-50'}`} />
                                            </button>
                                        )}
                                    </div>
                                    {/* Email */}
                                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                                        <div className="text-right flex-grow flex items-center gap-3">
                                            <div className="w-10 h-10 flex items-center justify-center bg-black/30 rounded-full">
                                                <MailIcon className="w-6 h-6 text-gray-200" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-100">البريد الإلكتروني</p>
                                                <p className="text-gray-300">{profileEmail}</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10"></div> {/* Spacer */}
                                    </div>
                                    {/* User ID */}
                                    <div className="flex items-center justify-between py-3">
                                        <div className="text-right flex-grow flex items-center gap-3">
                                            <div className="w-10 h-10 flex items-center justify-center bg-black/30 rounded-full">
                                                <IdIcon className="w-6 h-6 text-gray-200" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-100">معرّف المستخدم</p>
                                                <p className="text-gray-300 tracking-wider">{currentUser.userId}</p>
                                            </div>
                                        </div>
                                        <div className="relative p-2">
                                            <span onClick={handleCopyUserId} className="material-symbols-outlined text-gray-400 hover:text-white transition-colors cursor-pointer">
                                                content_copy
                                            </span>
                                            {copied && <span className="absolute -top-6 -right-5 text-xs bg-slate-800 text-white px-2 py-0.5 rounded whitespace-nowrap">تم النسخ!</span>}
                                        </div>
                                    </div>
                                </div>
                            </section>
                            
                            {/* Security Section */}
                            <section className="mt-8">
                                <div className="flex items-center gap-3 mb-3 pr-2">
                                    <div className="w-1 h-5 bg-amber-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-slate-900">الأمان</h3>
                                </div>
                                <div className="bg-black/40 border border-gray-700/50 rounded-2xl shadow-lg p-4 backdrop-blur-sm">
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 flex items-center justify-center bg-black/30 rounded-full">
                                                <LockIcon className="w-6 h-6 text-amber-600" />
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-100">كلمة المرور</p>
                                                <p className="text-gray-300 text-sm">غير متاحة لحسابات google</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Settings Section */}
                            <section className="mt-8">
                                <div className="flex items-center gap-3 mb-3 pr-2">
                                    <div className="w-1 h-5 bg-amber-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-slate-900">الإعدادات</h3>
                                </div>
                                <div className="bg-black/40 border border-gray-700/50 rounded-2xl shadow-lg p-4 backdrop-blur-sm">
                                    {/* Account Verification */}
                                     <div className="flex items-center justify-between py-3 border-b border-gray-700">
                                        {currentUser.isVerified ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center bg-black/30 rounded-full">
                                                    <ShieldCheckIcon className="w-6 h-6 text-green-500" />
                                                </div>
                                                <div className="text-right flex-grow">
                                                    <p className="font-semibold text-gray-100">الحساب موثق</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={handleOpenVerification}
                                                className="w-full flex items-center justify-between text-right"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 flex items-center justify-center bg-black/30 rounded-full">
                                                        <ShieldExclamationIcon className="w-6 h-6 text-red-500" />
                                                    </div>
                                                    <p className="font-semibold text-gray-100">توثيق الحساب</p>
                                                </div>
                                                <ChevronIcon className="w-6 h-6 text-gray-400" />
                                            </button>
                                        )}
                                    </div>
                                    {/* Terms of Use */}
                                    <div className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 flex items-center justify-center bg-black/30 rounded-full">
                                                <DocumentIcon className="w-6 h-6 text-gray-200" />
                                            </div>
                                            <p className="font-semibold text-gray-100">شروط الاستخدام</p>
                                        </div>
                                        <ChevronIcon className="w-6 h-6 text-gray-400" />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                    {showNameChangeModal && <NameChangeModalComponent />}
                    {showPicChangeModal && <ProfilePictureChangeModalComponent />}
                    {logoutConfirmModal}
                </>
            );
        }

        if (showNotificationsLogScreen) {
            const categories = [
                { key: 'chat', label: 'غرفة دردشة', icon: <ChatIcon className="w-5 h-5" /> },
                { key: 'games', label: 'ألعاب', icon: <GamesIcon className="text-xl" /> },
                { key: 'transactions', label: 'تحويلات', icon: <WithdrawIcon className="w-5 h-5" /> },
                { key: 'counter', label: 'عداد', icon: <ClockIcon className="w-5 h-5" /> },
            ] as const;

            const filteredNotifications = notifications.filter(n => n.category === activeNotificationCategory);

            return (
                <div className="fixed inset-0 font-sans animate-fade-in-fast overflow-y-auto" style={{ background: 'radial-gradient(circle, #FBBF24 0%, #F59E0B 100%)' }}>
                    <div className="container mx-auto max-w-lg min-h-screen flex flex-col p-4 pb-8">
                        {/* Header */}
                        <header className="relative flex items-center justify-center py-2 mb-4">
                            <h1 className="text-2xl font-bold text-slate-900">سجل الإشعارات</h1>
                            <button onClick={() => setShowNotificationsLogScreen(false)} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-800" aria-label="عودة">
                                <ArrowRightIcon className="w-7 h-7" />
                            </button>
                        </header>

                        {/* Category Tabs */}
                        <div className="bg-white/40 border border-white/50 rounded-2xl shadow-lg p-1.5 backdrop-blur-sm mb-4 flex flex-row-reverse justify-start gap-1">
                            {categories.map(cat => (
                                <button
                                    key={cat.key}
                                    onClick={() => setActiveNotificationCategory(cat.key)}
                                    className={`flex-1 py-2 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeNotificationCategory === cat.key ? 'bg-slate-800 text-white shadow-md' : 'text-slate-700 hover:bg-white/50'}`}
                                >
                                    {cat.icon}
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Body */}
                        <div className="flex-grow">
                            {filteredNotifications.length > 0 ? (
                                <ul className="space-y-3">
                                    {filteredNotifications.map(n => (
                                        <li key={n.id} className="bg-white/40 border border-white/50 rounded-2xl shadow-lg p-3 text-right backdrop-blur-sm">
                                            <p className="text-slate-800 font-medium">{n.message}</p>
                                            <p className="text-xs text-slate-600 mt-1">{formatTimeAgo(n.timestamp)}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-600 pt-16">
                                    <BellIcon className="w-20 h-20 mb-4 opacity-50" />
                                    <p className="text-lg font-semibold">لا توجد إشعارات في هذا القسم.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="mt-6">
                                <button
                                    onClick={handleClearNotifications}
                                    className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-red-600/80 hover:bg-red-600 transition-colors shadow-lg"
                                >
                                    مسح جميع الإشعارات
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // MAIN MENU (SETTINGS) SCREEN - NEW DESIGN
        return (
            <>
                <div className="fixed inset-0 font-sans animate-fade-in-fast overflow-y-auto" style={{ background: 'radial-gradient(circle, #FBBF24 0%, #F59E0B 100%)' }}>
                    <div className="container mx-auto max-w-lg min-h-screen flex flex-col p-4 pb-8">
                        {/* Header */}
                        <header className="relative flex items-center justify-center py-2">
                            <h1 className="text-2xl font-bold text-slate-900">إعدادات</h1>
                            <button onClick={handleBackToMain} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-800" aria-label="عودة">
                                <ArrowRightIcon className="w-7 h-7" />
                            </button>
                        </header>

                        {/* User Info Display */}
                        <div className="flex flex-col items-start gap-2 py-4">
                            <div className="w-20 h-20 rounded-full border-4 border-amber-500 shadow-lg p-1 bg-white/20">
                                {profilePicture ? (
                                    <img src={profilePicture} alt="صورة الملف الشخصي" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-amber-100 flex items-center justify-center">
                                        <UserIcon className="w-10 h-10 text-amber-600" />
                                    </div>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{profileName}</p>
                        </div>

                        {/* Main card */}
                        <div className="bg-[#6a500b]/80 border border-[#503d08]/80 rounded-2xl shadow-lg p-3 space-y-2">
                            {/* Menu Items */}
                            <div className="bg-[#8f6d0b] rounded-lg text-white">
                                 <button 
                                    onClick={handleOpenUserProfile}
                                    className="w-full flex items-center justify-between text-right p-4 hover:bg-[#a0770b]/60 transition-colors border-b border-white/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <UserIcon className="w-6 h-6 text-yellow-300" />
                                        <span className="font-semibold">ملف المستخدم</span>
                                    </div>
                                    <ChevronIcon className="w-6 h-6 text-gray-300" />
                                </button>
                                <button 
                                    onClick={handleOpenNotificationsLogScreen}
                                    className="w-full flex items-center justify-between text-right p-4 hover:bg-[#a0770b]/60 transition-colors border-b border-white/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <BellIcon className="w-6 h-6 text-yellow-300" />
                                        <span className="font-semibold">سجل الإشعارات</span>
                                    </div>
                                    <ChevronIcon className="w-6 h-6 text-gray-300" />
                                </button>
                                <button 
                                    onClick={() => alert('سيتم تفعيل هذه الميزة قريباً!')}
                                    className="w-full flex items-center justify-between text-right p-4 hover:bg-[#a0770b]/60 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <HeadsetIcon className="w-6 h-6 text-yellow-300" />
                                        <span className="font-semibold">تواصل مع دعم الفني</span>
                                    </div>
                                    <ChevronIcon className="w-6 h-6 text-gray-300" />
                                </button>
                            </div>
                            
                             <div className="bg-[#8f6d0b] rounded-lg text-white">
                                <button 
                                    onClick={handleLogoutClick}
                                    className="w-full flex items-center justify-between text-right p-4 hover:bg-[#a0770b]/60 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <LogoutIcon className="w-6 h-6 text-red-400" />
                                        <span className="font-semibold text-red-300">تسجيل الخروج</span>
                                    </div>
                                    <ChevronIcon className="w-6 h-6 text-gray-300" />
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
                {logoutConfirmModal}
            </>
        );
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
        
        if (showGiftCounterScreen) {
            return <GiftCounter
                onBack={() => setShowGiftCounterScreen(false)}
                onGift={handleGiftCounter}
                allUsers={allUsers}
                currentUserPoints={points}
                currentUserJewels={jewels}
            />;
        }
        
        if (showSecondaryMenu) {
            return <SecondaryMenuComponent />;
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
                onOpenGiftCounter={() => setShowGiftCounterScreen(true)}
                onOpenSecondaryMenu={() => setShowSecondaryMenu(true)}
                onOpenChat={handleOpenChat}
            />
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-amber-500/40">
            {showNotificationsPanel && (
                <NotificationsPanel 
                    notifications={notifications}
                    onClose={handleToggleNotifications}
                />
            )}
            {logoutConfirmModal}
            <div className="w-full max-w-md mx-auto">
                {!showStore && !showGiftCounterScreen && !showSecondaryMenu && (
                    <Header 
                        dollars={dollars} 
                        points={points} 
                        jewels={jewels}
                        onToggleNotifications={handleToggleNotifications}
                        unreadCount={unreadCount}
                        onMenuClick={handleMenuClick}
                    />
                )}
                <main className={showStore || showGiftCounterScreen || showSecondaryMenu ? '' : 'mt-8'}>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;

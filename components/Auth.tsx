import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User } from '../types';
import { UserIcon, MailIcon, LockIcon } from './icons';

interface AuthProps {
    onLoginSuccess: (user: User) => void;
}

// Hashing function using Web Crypto API for better security than plaintext
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateUniqueId(existingUsers: User[]): string {
    let newId: string;
    let isUnique = false;
    while (!isUnique) {
        // Generate a 10-digit string
        newId = String(Math.floor(Math.random() * 10**10)).padStart(10, '0');
        // Check if it already exists
        if (!existingUsers.some(user => user.userId === newId)) {
            isUnique = true;
        }
    }
    return newId!;
}


const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
    const [view, setView] = useState<'welcome' | 'login' | 'signup'>('welcome');
    const [users, setUsers] = useLocalStorage<User[]>('users', []);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !password) {
            setError('يرجى ملء جميع الحقول.');
            return;
        }

        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            setError('هذا البريد الإلكتروني مسجل بالفعل.');
            return;
        }

        const hashedPassword = await hashPassword(password);
        const userId = generateUniqueId(users);
        const newUser: User = { userId, name, email, hashedPassword };

        setUsers([...users, newUser]);
        onLoginSuccess(newUser);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('يرجى ملء جميع الحقول.');
            return;
        }
        
        const user = users.find(u => u.email === email);
        if (!user || !user.hashedPassword) {
            setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
            return;
        }

        const hashedPassword = await hashPassword(password);
        if (user.hashedPassword === hashedPassword) {
            // Migration for old users without an ID
            if (!user.userId) {
                user.userId = generateUniqueId(users);
                const updatedUsers = users.map(u => u.email === user.email ? user : u);
                setUsers(updatedUsers);
            }
            onLoginSuccess(user);
        } else {
            setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        }
    };

    const renderForm = () => {
        const isLogin = view === 'login';
        return (
            <div className="w-full max-w-sm mx-auto bg-black/40 border border-gray-700/50 rounded-2xl shadow-lg p-8 flex flex-col justify-center items-center backdrop-blur-sm text-center animate-fade-in-fast">
                <h1 className="text-3xl font-bold text-white mb-6">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}</h1>
                {error && <p className="bg-red-500/20 text-red-300 text-sm py-2 px-4 rounded-md mb-4">{error}</p>}
                <form onSubmit={isLogin ? handleLogin : handleSignup} className="w-full flex flex-col gap-4">
                    {!isLogin && (
                        <div className="relative">
                            <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="الاسم"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/50 border border-gray-600 rounded-lg py-2.5 pr-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>
                    )}
                    <div className="relative">
                        <MailIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="email"
                            placeholder="البريد الإلكتروني"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-gray-600 rounded-lg py-2.5 pr-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    <div className="relative">
                        <LockIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="password"
                            placeholder="كلمة المرور"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-gray-600 rounded-lg py-2.5 pr-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 mt-2 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform bg-gradient-to-br from-gray-800 to-black text-yellow-300 border-t border-gray-600 hover:shadow-yellow-400/20 hover:scale-105"
                    >
                        {isLogin ? 'دخول' : 'تسجيل'}
                    </button>
                </form>
                <button onClick={() => setView(isLogin ? 'signup' : 'login')} className="mt-6 text-sm text-yellow-300 hover:underline">
                    {isLogin ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'هل لديك حساب بالفعل؟ تسجيل الدخول'}
                </button>
                 <button onClick={() => setView('welcome')} className="mt-2 text-sm text-gray-400 hover:underline">
                    العودة
                </button>
            </div>
        );
    };

    const renderWelcome = () => (
        <div className="w-full max-w-sm mx-auto bg-black/40 border border-gray-700/50 rounded-2xl shadow-lg p-8 flex flex-col justify-center items-center backdrop-blur-sm text-center animate-fade-in-fast">
             <h1 className="text-3xl font-bold text-white">أهلاً بك في</h1>
             <h2 className="text-4xl font-bold text-yellow-300 mb-8">لعبة عداد النقاط</h2>
             <div className="w-full flex flex-col gap-4">
                <button
                    onClick={() => setView('login')}
                    className="w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform bg-gradient-to-br from-gray-800 to-black text-yellow-300 border-t border-gray-600 hover:shadow-yellow-400/20 hover:scale-105"
                >
                    تسجيل الدخول
                </button>
                <button
                    onClick={() => setView('signup')}
                    className="w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 bg-yellow-400/90 text-black hover:bg-yellow-300 hover:scale-105"
                >
                    إنشاء حساب جديد
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
           {view === 'welcome' ? renderWelcome() : renderForm()}
        </div>
    );
};

export default Auth;
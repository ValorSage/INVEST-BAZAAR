import React, { useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import CounterStore from './components/CounterStore';
import MainCounter from './components/MainCounter';
import PointCollector from './components/PointCollector';

const COUNTER_COST = 1000;
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const JEWEL_REWARD_PER_CYCLE = 500;
const POINT_REWARD_PER_CYCLE = 0;

const App: React.FC = () => {
    const [dollars, setDollars] = useLocalStorage<number>('dollars', 0);
    const [points, setPoints] = useLocalStorage<number>('points', 0);
    const [jewels, setJewels] = useLocalStorage<number>('jewels', 0);
    const [hasCounter, setHasCounter] = useLocalStorage<boolean>('hasCounter', true);
    const [activationStartTime, setActivationStartTime] = useLocalStorage<number | null>('activationStartTime', null);

    useEffect(() => {
        if (activationStartTime) {
            const timeSinceActivation = Date.now() - activationStartTime;
            if (timeSinceActivation >= COOLDOWN_PERIOD) {
                setJewels(prev => prev + JEWEL_REWARD_PER_CYCLE);
                setPoints(prev => prev + POINT_REWARD_PER_CYCLE);
                setActivationStartTime(null); 
            }
        }
    }, [activationStartTime, setJewels, setPoints, setActivationStartTime]);

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

    const renderContent = () => {
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
                jewelRewardPerCycle={JEWEL_REWARD_PER_CYCLE}
                pointReward={POINT_REWARD_PER_CYCLE}
            />
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-amber-500/40">
            <div className="w-full max-w-md mx-auto">
                <Header dollars={dollars} points={points} jewels={jewels} />
                <main className="mt-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;
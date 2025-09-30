import React, { useState, useEffect } from 'react';

const ads = [
    {
        id: 1,
        title: 'الإعلان الأول',
        description: 'هذا هو الوصف الخاص بالإعلان الأول. احصل على مكافآت رائعة الآن!'
    },
    {
        id: 2,
        title: 'الإعلان الثاني',
        description: 'لا تفوت عروضنا الخاصة. انضم اليوم واستمتع بالمزايا الحصرية.'
    },
    {
        id: 3,
        title: 'الإعلان الثالث',
        description: 'اكتشف ميزات جديدة ومثيرة في لعبتنا. قم بالتحديث الآن!'
    }
];

const AdCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % ads.length);
        }, 5000); // Change ad every 5 seconds

        return () => clearInterval(intervalId);
    }, []);

    const currentAd = ads[currentIndex];

    return (
        <div className="w-full bg-black/30 border border-gray-700/50 backdrop-blur-md rounded-lg p-4 shadow-lg text-center overflow-hidden h-24 flex flex-col justify-center">
            <div key={currentAd.id} className="animate-fade-in-ad">
                 <h3 className="font-bold text-yellow-300 text-lg">{currentAd.title}</h3>
                 <p className="text-gray-300 text-sm mt-1">{currentAd.description}</p>
            </div>
        </div>
    );
};

const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in-ad {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-ad {
    animation: fade-in-ad 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);

export default AdCarousel;

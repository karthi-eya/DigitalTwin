import React from 'react';

const AvatarFallback = ({ bmi = 22, activityScore = 50, bodyType = 'lean' }) => {
    const bodyWidthScale = bodyType === 'obese' ? 1.5 : bodyType === 'overweight' ? 1.3 : bodyType === 'athletic' ? 1.1 : bodyType === 'skinny' ? 0.85 : 1;
    const armWidth = bodyType === 'athletic' ? 12 : 8;

    return (
        <div className="flex items-center justify-center p-8">
            <svg width="200" height="350" viewBox="0 0 200 350" className="drop-shadow-2xl">
                {/* Head */}
                <circle cx="100" cy="45" r="30" fill="#d4a574" stroke="#c4956a" strokeWidth="2" />
                {/* Eyes */}
                <circle cx="90" cy="40" r="3" fill="#333" />
                <circle cx="110" cy="40" r="3" fill="#333" />
                {/* Smile */}
                <path d="M 90 52 Q 100 60 110 52" fill="none" stroke="#333" strokeWidth="2" />
                {/* Neck */}
                <rect x="92" y="73" width="16" height="15" rx="4" fill="#d4a574" />
                {/* Torso */}
                <rect x={100 - 30 * bodyWidthScale} y="85" width={60 * bodyWidthScale} height="90" rx="10" fill="#3b82f6" />
                {/* Arms */}
                <rect x={100 - 30 * bodyWidthScale - armWidth - 5} y="90" width={armWidth} height="70" rx="5" fill="#d4a574" />
                <rect x={100 + 30 * bodyWidthScale + 5} y="90" width={armWidth} height="70" rx="5" fill="#d4a574" />
                {/* Legs */}
                <rect x={100 - 20 * bodyWidthScale} y="175" width={15 * bodyWidthScale} height="100" rx="6" fill="#1e40af" />
                <rect x={100 + 5 * bodyWidthScale} y="175" width={15 * bodyWidthScale} height="100" rx="6" fill="#1e40af" />
                {/* Feet */}
                <ellipse cx={100 - 12 * bodyWidthScale} cy="278" rx="12" ry="6" fill="#333" />
                <ellipse cx={100 + 12 * bodyWidthScale} cy="278" rx="12" ry="6" fill="#333" />
                {/* Health indicator */}
                <circle cx="100" cy="130" r="15" fill="rgba(255,255,255,0.2)" />
                <text x="100" y="135" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                    {bmi?.toFixed(0)}
                </text>
            </svg>
        </div>
    );
};

export default AvatarFallback;

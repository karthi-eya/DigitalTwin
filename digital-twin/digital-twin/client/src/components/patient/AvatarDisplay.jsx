import React from 'react';
import AvatarViewer from '../avatar/AvatarViewer';

const AvatarDisplay = ({ profile = {} }) => {
    return (
        <AvatarViewer
            bmi={profile.bmi || 22}
            activityScore={profile.activityLevel === 'active' ? 85 : profile.activityLevel === 'moderate' ? 60 : profile.activityLevel === 'light' ? 35 : 15}
            bodyType={profile.avatarBodyType || 'lean'}
            weight={profile.weight}
            goalWeight={profile.goal === 'lose_weight' ? Math.round((profile.weight || 70) * 0.9) : null}
        />
    );
};

export default AvatarDisplay;

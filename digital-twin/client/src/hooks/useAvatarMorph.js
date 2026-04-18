import { useMemo } from 'react';

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
const lerp = (start, end, t) => start + (end - start) * t;

const useAvatarMorph = (bmi = 22, activityScore = 50, weightTrend = 0) => {
    return useMemo(() => {
        const fatMorph = clamp((bmi - 18.5) / 21.5, 0, 1);
        const muscleMorph = clamp(activityScore / 100, 0, 1);
        const thinMorph = clamp((25 - bmi) / 10, 0, 1);

        return { fatMorph, muscleMorph, thinMorph };
    }, [bmi, activityScore, weightTrend]);
};

export default useAvatarMorph;

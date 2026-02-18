import { useEffect, useState } from 'react';
import type { VoiceProfile } from '../types';

type ProfileBarsProps = {
  profile: VoiceProfile;
};

const ITEMS: { key: keyof VoiceProfile; label: string; color: string }[] = [
  { key: 'brightness', label: '밝음', color: 'bg-amber-500' },
  { key: 'husky', label: '허스키', color: 'bg-cyan-600' },
  { key: 'softness', label: '부드러움', color: 'bg-emerald-500' },
];

export default function ProfileBars({ profile }: ProfileBarsProps) {
  const targetPercentages = {
    brightness: Math.round(Math.max(0, Math.min(1, profile.brightness)) * 100),
    husky: Math.round(Math.max(0, Math.min(1, profile.husky)) * 100),
    softness: Math.round(Math.max(0, Math.min(1, profile.softness)) * 100),
  };
  const [animated, setAnimated] = useState({ brightness: 0, husky: 0, softness: 0 });

  useEffect(() => {
    setAnimated({ brightness: 0, husky: 0, softness: 0 });
    const timer = window.setTimeout(() => {
      setAnimated(targetPercentages);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [profile.brightness, profile.husky, profile.softness]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">음성 프로필</h2>
      <div className="mt-4 space-y-4">
        {ITEMS.map((item) => {
          const percentage = targetPercentages[item.key];
          const animatedValue = animated[item.key];
          return (
            <div key={item.key}>
              <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
                <span>{item.label}</span>
                <span className="text-sm font-bold text-slate-800 transition-colors hover:text-cyan-700">
                  {percentage}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div className={`h-full ${item.color} transition-all duration-1000 ease-out`} style={{ width: `${animatedValue}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

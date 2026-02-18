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
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Voice Profile</h2>
      <div className="mt-4 space-y-4">
        {ITEMS.map((item) => {
          const percentage = Math.round(Math.max(0, Math.min(1, profile[item.key])) * 100);
          return (
            <div key={item.key}>
              <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
                <span>{item.label}</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div className={`h-full ${item.color} transition-all duration-700`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

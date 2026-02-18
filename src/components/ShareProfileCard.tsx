import { createProfileCardDataUrl } from '../services/share';
import type { VoiceProfile } from '../types';

type ShareProfileCardProps = {
  profile: VoiceProfile;
  summary: string;
};

export default function ShareProfileCard({ profile, summary }: ShareProfileCardProps) {
  const handleDownload = () => {
    const dataUrl = createProfileCardDataUrl({
      title: '내 음성 프로필',
      summary,
      profile,
    });
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `voicefit-profile-${Date.now()}.png`;
    link.click();
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
    >
      프로필 카드 공유 이미지 저장
    </button>
  );
}

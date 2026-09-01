import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { getLawMeta } from '@/lib/lawIndex';
import { type LawSpeechState, speechReader } from '@/lib/speech';
import { routes } from '@/navigation/routes';

/**
 * แถบควบคุมเสียงอ่านย่อส่วน (Mini Audio Player)
 * จะปรากฏขึ้นเมื่อมีการเปิดเสียงอ่านตัวบท แล้วผู้ใช้ออกไปเปิดดูหน้าอื่นๆ (หน้าแรก, ค้นหา, สารบัญ, บันทึก)
 * ช่วยให้ผู้ใช้สามารถกดหยุด (Pause), ปิดเสียง (Stop), เปลี่ยนความเร็ว หรือกดเพื่อกลับไปที่หน้ามาตราได้ทันที
 */
export function MiniAudioPlayer() {
  const [speechState, setSpeechState] = useState<LawSpeechState>(speechReader.getState());
  const { pathname } = useLocation();

  useEffect(() => {
    const unsubscribe = speechReader.subscribe((state) => {
      setSpeechState(state);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // ซ่อนแถบนี้หากไม่ได้กำลังเล่นเสียง หรือหากอยู่ในหน้าตัวบทอยู่แล้ว (เพราะหน้าตัวบทมีปุ่มควบคุมเฉพาะอยู่แล้ว)
  if ((!speechState.isPlaying && !speechState.isPaused) || !speechState.currentArticleId) {
    return null;
  }

  if (pathname.startsWith('/article/')) {
    return null;
  }

  const law = getLawMeta(speechState.currentLawId || undefined);

  const handleTogglePlayPause = () => {
    if (speechState.isPlaying) {
      speechReader.pause();
    } else {
      speechReader.resume();
    }
  };

  const handleStop = () => {
    speechReader.stop();
  };

  const handleCycleRate = () => {
    const nextRate = speechState.rate === 1.0 ? 1.25 : speechState.rate === 1.25 ? 1.5 : 1.0;
    speechReader.setRate(nextRate);
  };

  return (
    <div className="mini-player" role="region" aria-label="แถบควบคุมเสียงอ่านกฎหมาย">
      <Link
        to={routes.article(speechState.currentArticleId, speechState.currentLawId || undefined)}
        className="mini-player__info"
        title="กดเพื่อกลับไปยังหน้ามาตราที่กำลังอ่าน"
      >
        <span className="mini-player__icon-pulse">
          <Icon name="volume" size={16} />
        </span>
        <div className="mini-player__text">
          <span className="mini-player__title">
            {speechState.isPlaying ? 'กำลังอ่าน' : 'พักชั่วคราว'} มาตรา {speechState.currentArticleId}
          </span>
          <span className="mini-player__law">{law.code}</span>
        </div>
      </Link>

      <div className="mini-player__actions">
        <button
          type="button"
          className="mini-player__btn mini-player__btn--rate"
          onClick={handleCycleRate}
          aria-label={`ความเร็วเสียงอ่าน ${speechState.rate} เท่า`}
          title="ปรับความเร็วเสียงอ่าน"
        >
          {speechState.rate}x
        </button>

        <button
          type="button"
          className="mini-player__btn mini-player__btn--play"
          onClick={handleTogglePlayPause}
          aria-label={speechState.isPlaying ? 'หยุดชั่วคราว' : 'เล่นต่อ'}
          title={speechState.isPlaying ? 'หยุดชั่วคราว' : 'เล่นต่อ'}
        >
          <Icon name={speechState.isPlaying ? 'pause' : 'play'} size={15} />
        </button>

        <button
          type="button"
          className="mini-player__btn mini-player__btn--stop"
          onClick={handleStop}
          aria-label="หยุดและปิดเสียงอ่าน"
          title="หยุดและปิดเสียงอ่าน"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}

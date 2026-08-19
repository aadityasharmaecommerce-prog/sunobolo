import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { allCourses } from '../data/content';
import { useSentenceAudio } from '../hooks/useSentenceAudio';
import { getProgress, markLessonComplete, markSentenceComplete } from '../lib/progress';

export default function Lesson() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'listen' | 'speak'>('listen');
  const [listenCt, setListenCt] = useState(0);
  const [speakCt, setSpeakCt] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const { status, playOnce, listenThreeTimes, playCount, stop } = useSentenceAudio();
  const autoAdvanceRef = useRef(false);
  const mountedRef = useRef(true);
  const listenStartedRef = useRef(false);

  const course = allCourses.find((c) => c.id === courseId);
  const lesson = course?.lessons.find((l) => l.id === lessonId);
  const sentences = lesson?.sentences ?? [];
  const total = sentences.length;
  const cur = sentences[idx];

  useEffect(() => {
    mountedRef.current = true;
    setPhase('listen');
    setListenCt(0);
    setSpeakCt(0);
    autoAdvanceRef.current = false;
    listenStartedRef.current = false;
    const saved = getProgress();
    const ids = new Set(sentences.map((s) => s.id));
    const already = new Set(Object.keys(saved.completedSentences).filter((id) => ids.has(id)));
    setDone(already);
    const last = saved.lastLesson;
    if (last && last.lessonId === lessonId && last.sentenceIndex < sentences.length) {
      setIdx(last.sentenceIndex);
    } else {
      setIdx(0);
    }
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToIndex = useCallback(
    (nextIdx: number) => {
      stop();
      setIdx(nextIdx);
      setPhase('listen');
      setListenCt(0);
      setSpeakCt(0);
      autoAdvanceRef.current = false;
      listenStartedRef.current = false;
    },
    [stop],
  );

  const adv = useCallback(() => {
    if (!cur || !courseId || !lessonId) return;
    stop();
    setDone((p) => new Set(p).add(cur.id));
    markSentenceComplete(cur.id, cur.courseId, lessonId, Math.min(idx + 1, total - 1));
    if (idx < total - 1) {
      goToIndex(idx + 1);
    } else {
      markLessonComplete(lessonId);
      navigate(`/course/${courseId}`);
    }
  }, [cur, idx, total, courseId, lessonId, navigate, stop, goToIndex]);

  // AUTO-PLAY guided Suno Aur Bolo once per sentence (do not key off status — it goes idle between clips)
  useEffect(() => {
    if (phase === 'listen' && cur && listenCt === 0 && !listenStartedRef.current) {
      listenStartedRef.current = true;
      const t = setTimeout(() => {
        if (mountedRef.current) {
          listenThreeTimes(
            cur.id,
            cur.courseId,
            cur.english,
            setListenCt,
            cur.hindi,
            () => {
              if (mountedRef.current) setPhase('speak');
            },
          );
        }
      }, 300);
      return () => clearTimeout(t);
    }
  }, [phase, idx, cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // After listen 3/3, always move to speak — same sentence
  useEffect(() => {
    if (phase === 'listen' && listenCt >= 3) {
      setPhase('speak');
    }
  }, [listenCt, phase]);

  // AUTO-ADVANCE after speak 3×
  useEffect(() => {
    if (phase === 'speak' && speakCt >= 3 && !autoAdvanceRef.current) {
      autoAdvanceRef.current = true;
      const t = setTimeout(() => {
        if (mountedRef.current) adv();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [speakCt, phase, adv]);

  const handleManualPlay = useCallback(() => {
    if (!cur) return;
    stop();
    setTimeout(() => {
      if (mountedRef.current && cur) {
        playOnce(cur.id, cur.courseId, cur.english, () => {
          if (mountedRef.current && listenCt >= 3) setPhase('speak');
        });
      }
    }, 80);
  }, [stop, playOnce, cur, listenCt]);

  const handleSkipListen = useCallback(() => {
    stop();
    if (mountedRef.current) {
      setPhase('speak');
      setListenCt(3);
    }
  }, [stop]);

  const handleSkipSpeak = useCallback(() => {
    stop();
    if (mountedRef.current) setSpeakCt(3);
  }, [stop]);

  if (!course || !lesson) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Lesson not found
      </div>
    );
  }

  if (!cur) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        No sentences in this lesson
      </div>
    );
  }

  const pct = (done.size / Math.max(total, 1)) * 100;
  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-white to-gray-50">
      <div className="flex items-center justify-between px-5 pt-4 pb-1">
        <button onClick={() => { stop(); navigate(-1); }} className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-base">
          ←
        </button>
        <div className="text-center">
          <p className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">{lesson.title}</p>
          <p className="text-[10px] text-gray-400">{idx + 1} / {total}</p>
        </div>
        <div className="w-9 h-9" />
      </div>

      <div className="mx-5 mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="mx-5 mt-4 flex-1 flex items-start justify-center pt-4">
        <div className="w-full bg-white rounded-[32px] shadow-[0_12px_48px_-12px_rgba(0,0,0,0.12)] px-6 py-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-300 font-semibold mb-4">
            SENTENCE {idx + 1} OF {total}
          </p>
          <p className="text-xl sm:text-2xl font-extrabold leading-snug text-gray-900">
            &ldquo;{cur.english}&rdquo;
          </p>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-300 font-semibold mb-2">🇮🇳 HINDI</p>
            <p className="text-base text-gray-500">{cur.hindi}</p>
          </div>
        </div>
      </div>

      <div className="mx-5 mt-auto space-y-3 mb-6">
        {phase === 'listen' && (
          <>
            <div className="flex items-center justify-center gap-2 mb-1">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  listenCt >= n
                    ? 'bg-success-100 text-success-700'
                    : isPlaying && playCount === n - 1
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-gray-50 text-gray-300'
                }`}>{n}</div>
              ))}
            </div>

            {(isPlaying || isLoading) && (
              <button
                onClick={handleSkipListen}
                className="w-full bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl text-base active:scale-[.97] transition-all"
              >
                {isLoading ? '⏳ Loading...' : '⏹ Stop & Skip to Speak'}
              </button>
            )}

            {!isPlaying && !isLoading && (
              <button
                onClick={() => {
                  if (listenCt >= 3) {
                    handleManualPlay();
                    return;
                  }
                  listenThreeTimes(cur.id, cur.courseId, cur.english, setListenCt, cur.hindi, () => {
                    if (mountedRef.current) setPhase('speak');
                  });
                }}
                className="w-full bg-brand-600 text-white font-bold py-5 rounded-2xl text-base shadow-xl shadow-brand-500/30 active:scale-[.97] transition-all"
              >
                {listenCt >= 3 ? '🔊 Suno Dobara' : '▶ Suno Aur Bolo'}
              </button>
            )}
          </>
        )}

        {phase === 'speak' && (
          <>
            <div className="flex items-center justify-center gap-2 mb-1">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  speakCt >= n
                    ? 'bg-success-100 text-success-700'
                    : speakCt === n - 1
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-gray-50 text-gray-300'
                }`}>{n}</div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center -mt-1 mb-1">
              Zor se 3 baar bolkar practice karein
            </p>

            {(isPlaying || isLoading) && (
              <button
                onClick={handleSkipSpeak}
                className="w-full bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl text-base active:scale-[.97] transition-all"
              >
                {isLoading ? '⏳ Loading...' : '⏹ Stop & Continue'}
              </button>
            )}

            {!isPlaying && !isLoading && (
              <button
                onClick={() => setSpeakCt((p) => Math.min(p + 1, 3))}
                disabled={speakCt >= 3}
                className="w-full bg-brand-600 text-white font-bold py-5 rounded-2xl text-base disabled:opacity-50 active:scale-[.97] transition-all"
              >
                {speakCt >= 3 ? '✓ Ho Gaya — auto skip...' : `🎤 Bol Diya (${speakCt}/3)`}
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!cur) return;
                  stop();
                  setTimeout(() => {
                    if (mountedRef.current && cur) {
                      playOnce(cur.id, cur.courseId, cur.english);
                    }
                  }, 80);
                }}
                disabled={isPlaying || isLoading}
                className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-xl text-sm disabled:opacity-50"
              >
                🔊 Suno Dobara
              </button>
              {speakCt >= 3 && !isPlaying && !isLoading && (
                <button
                  onClick={adv}
                  className="flex-[2] bg-brand-600 text-white py-3.5 rounded-xl text-sm font-semibold"
                >
                  Next Sentence →
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1">
              {speakCt >= 3 ? '⏳ Agla sentence 1.5s me...' : 'Baar baar zor se bole, confidence badhega!'}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center justify-between px-6 pb-6 text-xs text-gray-400">
        <button
          onClick={() => { if (idx > 0) goToIndex(idx - 1); }}
          disabled={idx === 0}
          className="disabled:opacity-30"
        >
          ← Prev
        </button>
        <div className="flex gap-1">
          {sentences.map((s, i) => (
            <div
              key={s.id}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'w-3 bg-brand-500' : done.has(s.id) ? 'bg-success-400' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <button onClick={adv}>Skip →</button>
      </div>
    </div>
  );
}

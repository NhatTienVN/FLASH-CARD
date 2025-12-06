import React, { useState, useEffect, useCallback } from 'react';
import { Card, ThemeColor, DeckFieldNames } from '../types';
import { Flashcard } from './Flashcard';
import { calculateReview, getDueCards, Rating } from '../services/srs';
import { X, CheckCircle2, RotateCw, Trophy, PlayCircle, Rotate3D } from 'lucide-react';

interface StudySessionProps {
  cards: Card[];
  onExit: () => void;
  onUpdateCard: (updatedCard: Card) => void;
  themeColor: ThemeColor;
  fieldNames?: DeckFieldNames;
}

export const StudySession: React.FC<StudySessionProps> = ({ cards, onExit, onUpdateCard, themeColor, fieldNames }) => {
  // Local state to track the queue of cards to study in this session
  const [studyQueue, setStudyQueue] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize session
  useEffect(() => {
    const dueCards = getDueCards(cards);
    setStudyQueue(dueCards);
    setIsLoaded(true);
  }, []); 

  const handleReviewAll = useCallback(() => {
    // Shuffle cards for variety
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setStudyQueue(shuffled);
    setCurrentCardIndex(0);
    setIsFinished(false);
    setIsFlipped(false);
  }, [cards]);

  const currentCard = studyQueue[currentCardIndex];

  // TTS Function
  const speakText = useCallback((text: string) => {
    if (!text) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Prefer English voice, but browser will often auto-detect or default correctly.
    // Setting en-US specifically as requested for "English" logic
    utterance.lang = 'en-US'; 
    utterance.rate = 0.9; // Slightly slower for better clarity
    
    window.speechSynthesis.speak(utterance);
  }, []);

  // Auto-play audio when card changes
  useEffect(() => {
    if (isLoaded && !isFinished && currentCard) {
      // Small timeout to allow UI to render and avoid race conditions with speech synthesis cancellation
      const timer = setTimeout(() => {
          speakText(currentCard.front);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentCard, isFinished, isLoaded, speakText]);

  const handleRating = useCallback((rating: Rating) => {
    if (!currentCard) return;

    // Calculate new card stats
    const updatedCard = calculateReview(currentCard, rating);
    
    // Update parent state (DB)
    onUpdateCard(updatedCard);

    // Reset flip state
    setIsFlipped(false);

    // Move to next card in queue
    setTimeout(() => {
      if (currentCardIndex < studyQueue.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 100);
  }, [currentCard, currentCardIndex, studyQueue.length, onUpdateCard]);

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isLoaded) return;
    
    // Case 1: Empty queue (Finished for the day initially)
    if (studyQueue.length === 0) {
         if (e.code === 'Space' || e.key === 'Enter') {
            e.preventDefault();
            handleReviewAll();
         } else if (e.code === 'Escape') {
            onExit();
         }
         return;
    }

    // Case 2: Session finished (After going through cards)
    if (isFinished) {
         if (e.code === 'Space' || e.key === 'Enter') {
            e.preventDefault();
            handleReviewAll();
         } else if (e.code === 'Escape') {
            onExit();
         }
         return;
    }

    // Case 3: Studying
    if (e.code === 'Space') {
      e.preventDefault();
      // Thay đổi: Space luôn luôn đảo trạng thái lật (Flip Toggle)
      // Không tự động đánh giá nữa
      setIsFlipped(prev => !prev);
    } else if (e.key === 'q' || e.key === 'Q') {
      // Speak Front
      speakText(currentCard.front);
    } else if (e.code === 'Escape') {
        onExit();
    } else if (isFlipped) {
      // Only allow rating if card is flipped
      if (e.key === '1') {
        handleRating(Rating.KNOWN);
      } else if (e.key === '2') {
        handleRating(Rating.MEDIUM);
      } else if (e.key === '3') {
        handleRating(Rating.HARD);
      }
    }
  }, [isLoaded, isFinished, isFlipped, handleRating, onExit, studyQueue.length, handleReviewAll, currentCard, speakText]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isLoaded) return <div className="min-h-screen bg-slate-100 flex items-center justify-center">Đang tải...</div>;

  if (studyQueue.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center animate-in fade-in duration-500">
              <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy size={40} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Tuyệt vời!</h2>
                <p className="text-slate-500 mb-8">Bạn đã hoàn thành tất cả các thẻ cần ôn hôm nay.</p>
                
                <div className="flex flex-col gap-3">
                   <button 
                        onClick={handleReviewAll}
                        className={`w-full px-6 py-3 bg-${themeColor}-600 text-white rounded-xl font-medium hover:bg-${themeColor}-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-${themeColor}-200`}
                        title="Phím tắt: Space"
                    >
                        <PlayCircle size={20} /> Ôn tập tất cả
                    </button>
                    <button 
                        onClick={onExit}
                        className="w-full px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                    >
                        Quay về danh sách
                    </button>
                </div>
              </div>
          </div>
      )
  }

  if (isFinished) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center animate-in fade-in duration-500">
              <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Hoàn thành phiên học!</h2>
                <p className="text-slate-500 mb-8">Bạn đã ôn tập xong {studyQueue.length} thẻ.</p>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleReviewAll}
                         className="w-full px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
                         title="Phím tắt: Space"
                    >
                        <RotateCw size={18} className="inline mr-2"/>
                        Ôn lại lần nữa
                    </button>
                    <button 
                        onClick={onExit}
                        className={`w-full px-6 py-3 bg-${themeColor}-600 text-white rounded-xl font-medium hover:bg-${themeColor}-700 transition-colors`}
                    >
                        Quay về danh sách
                    </button>
                </div>
              </div>
          </div>
      )
  }

  const progress = ((currentCardIndex) / studyQueue.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-100 text-slate-900 overflow-hidden relative">
      {/* Top Bar */}
      <div className="w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between z-10">
        <button 
            onClick={onExit}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            title="Thoát (Esc)"
        >
            <X size={24} />
        </button>
        <div className="text-center">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">Thẻ {currentCardIndex + 1} / {studyQueue.length}</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-200">
        <div 
            className={`h-full bg-${themeColor}-500 transition-all duration-300 ease-out`}
            style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 gap-8">
        <Flashcard 
            card={currentCard} 
            isFlipped={isFlipped} 
            onFlip={() => setIsFlipped(!isFlipped)}
            themeColor={themeColor}
            fieldNames={fieldNames}
            onSpeak={() => speakText(currentCard.front)}
        />

        {/* Controls */}
        <div className="h-20 flex items-center justify-center w-full max-w-2xl">
            {!isFlipped ? (
                null
            ) : (
                <div className="grid grid-cols-3 gap-4 w-full">
                     <button
                        onClick={() => handleRating(Rating.KNOWN)}
                        className="flex flex-col items-center justify-center p-3 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-200 hover:border-emerald-300 transition-all transform active:scale-95 group"
                    >
                        <span className="font-bold text-lg">Đã biết</span>
                        <span className="text-xs opacity-70 group-hover:opacity-100">(Phím 1)</span>
                    </button>
                    
                    <button
                        onClick={() => handleRating(Rating.MEDIUM)}
                        className="flex flex-col items-center justify-center p-3 bg-amber-100 text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-200 hover:border-amber-300 transition-all transform active:scale-95 group"
                    >
                        <span className="font-bold text-lg">Trung bình</span>
                        <span className="text-xs opacity-70 group-hover:opacity-100">(Phím 2)</span>
                    </button>

                    <button
                        onClick={() => handleRating(Rating.HARD)}
                        className="flex flex-col items-center justify-center p-3 bg-rose-100 text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-200 hover:border-rose-300 transition-all transform active:scale-95 group"
                    >
                        <span className="font-bold text-lg">Khó</span>
                        <span className="text-xs opacity-70 group-hover:opacity-100">(Phím 3)</span>
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
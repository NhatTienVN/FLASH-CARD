import React from 'react';
import { Card, ThemeColor, DeckFieldNames } from '../types';
import { Volume2 } from 'lucide-react';

interface FlashcardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  themeColor: ThemeColor;
  fieldNames?: DeckFieldNames;
  onSpeak: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ 
  card, 
  isFlipped, 
  onFlip, 
  themeColor, 
  fieldNames = { front: 'Trường 1', backPrimary: 'Trường 2', backSecondary: 'Trường 3' },
  onSpeak
}) => {
  return (
    <div 
      className="perspective-1000 w-full max-w-2xl h-96 cursor-pointer group"
      onClick={onFlip}
    >
      <div 
        className={`relative w-full h-full text-center transition-transform duration-500 transform-style-3d shadow-2xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front Face (Field 1) */}
        <div className="absolute w-full h-full backface-hidden bg-white border border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 select-none">
          {/* Audio Button */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Ngăn chặn việc lật thẻ khi bấm nút loa
              onSpeak();
            }}
            className="absolute top-6 right-6 p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all z-20"
            title="Đọc phát âm (Phím Q)"
          >
            <Volume2 size={24} />
          </button>

          <span className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4 bg-slate-50 px-3 py-1 rounded-full">
            {fieldNames.front}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 break-words max-w-full leading-tight">
            {card.front}
          </h2>
          <div className="absolute bottom-6 text-slate-400 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
            Nhấn hoặc Space để lật
          </div>
        </div>

        {/* Back Face (Field 2 & 3) */}
        <div className={`absolute w-full h-full backface-hidden bg-${themeColor}-50 border border-${themeColor}-100 rounded-3xl rotate-y-180 flex flex-col items-center justify-center p-8 select-none`}>
          <span className={`text-xs text-${themeColor}-400 uppercase tracking-widest font-bold mb-6 bg-white/50 px-3 py-1 rounded-full`}>
            Mặt Sau
          </span>
          
          <div className="flex flex-col gap-4 w-full max-w-lg">
            {/* Field 2 */}
            <div className={`bg-white p-5 rounded-xl shadow-sm border border-${themeColor}-100 relative`}>
              <span className={`absolute -top-2 left-4 px-2 bg-${themeColor}-50 text-[10px] text-${themeColor}-400 font-bold uppercase tracking-wider`}>
                {fieldNames.backPrimary}
              </span>
              <p className={`text-2xl font-medium text-${themeColor}-900 leading-relaxed`}>
                {card.backPrimary}
              </p>
            </div>
            
            {/* Field 3 */}
            {card.backSecondary && (
              <div className={`bg-white/60 p-4 rounded-xl border border-${themeColor}-200 border-dashed relative`}>
                <span className={`absolute -top-2 left-4 px-2 bg-${themeColor}-50 text-[10px] text-${themeColor}-400 font-bold uppercase tracking-wider`}>
                    {fieldNames.backSecondary}
                </span>
                <p className={`text-lg text-${themeColor}-700 italic`}>
                  {card.backSecondary}
                </p>
              </div>
            )}
          </div>

           <div className={`absolute bottom-6 text-${themeColor}-400 text-sm flex items-center gap-2 opacity-60`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
            Nhấn Space để xem lại mặt trước
          </div>
        </div>
      </div>
    </div>
  );
};
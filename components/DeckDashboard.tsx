import React, { useState, useRef } from 'react';
import { Deck, Card, ThemeColor } from '../types';
import { Plus, BookOpen, Edit, Trash2, Library, Play, Palette, Check, Download, Upload, AlertTriangle } from 'lucide-react';
import { getCardLevel } from '../services/srs';

interface DeckDashboardProps {
  decks: Deck[];
  onCreateDeck: (name: string) => void;
  onSelectDeck: (id: string) => void;
  onDeleteDeck: (id: string) => void;
  onStudyDeck: (id: string) => void;
  themeColor: ThemeColor;
  onUpdateTheme: (color: ThemeColor) => void;
  onImportData: (decks: Deck[]) => void;
}

export const DeckDashboard: React.FC<DeckDashboardProps> = ({ 
  decks, 
  onCreateDeck, 
  onSelectDeck, 
  onDeleteDeck,
  onStudyDeck,
  themeColor,
  onUpdateTheme,
  onImportData
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null); // State cho modal xóa
  const [newDeckName, setNewDeckName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors: { value: ThemeColor; label: string; bg: string }[] = [
    { value: 'indigo', label: 'Chàm', bg: 'bg-indigo-500' },
    { value: 'blue', label: 'Xanh Dương', bg: 'bg-blue-500' },
    { value: 'emerald', label: 'Ngọc Lục Bảo', bg: 'bg-emerald-500' },
    { value: 'rose', label: 'Hồng', bg: 'bg-rose-500' },
    { value: 'violet', label: 'Tím', bg: 'bg-violet-500' },
    { value: 'cyan', label: 'Xanh Lơ', bg: 'bg-cyan-500' },
    { value: 'orange', label: 'Cam', bg: 'bg-orange-500' },
    { value: 'slate', label: 'Xám', bg: 'bg-slate-600' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDeckName.trim()) {
      onCreateDeck(newDeckName.trim());
      setNewDeckName('');
      setIsCreating(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(decks, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flashcard_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const importedData = JSON.parse(event.target?.result as string);
              if (Array.isArray(importedData)) {
                  onImportData(importedData);
              } else {
                  alert("File không hợp lệ. Vui lòng chọn file JSON backup từ ứng dụng.");
              }
          } catch (err) {
              alert("Lỗi đọc file: " + err);
          }
      };
      reader.readAsText(file);
      e.target.value = ''; // reset
  };

  const confirmDeleteDeck = () => {
    if (deckToDelete) {
        onDeleteDeck(deckToDelete.id);
        setDeckToDelete(null);
    }
  };

  const renderDeckStats = (cards: Card[]) => {
    if (cards.length === 0) return null;
    
    const stats = {
        new: 0,
        hard: 0,
        medium: 0,
        mastered: 0
    };

    cards.forEach(card => {
        const level = getCardLevel(card);
        stats[level]++;
    });

    const total = cards.length;
    const getPercent = (count: number) => (count / total) * 100;

    return (
        <div className="mt-4 space-y-2">
            <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-slate-100">
                {stats.mastered > 0 && <div style={{ width: `${getPercent(stats.mastered)}%` }} className="bg-emerald-500" title="Đã biết (Mastered)"></div>}
                {stats.medium > 0 && <div style={{ width: `${getPercent(stats.medium)}%` }} className="bg-amber-400" title="Trung bình (Medium)"></div>}
                {stats.hard > 0 && <div style={{ width: `${getPercent(stats.hard)}%` }} className="bg-rose-500" title="Khó (Hard)"></div>}
                {stats.new > 0 && <div style={{ width: `${getPercent(stats.new)}%` }} className="bg-slate-300" title="Mới (New)"></div>}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                <div className="flex gap-2">
                    {stats.hard > 0 && <span className="text-rose-500">{stats.hard} Khó</span>}
                    {stats.medium > 0 && <span className="text-amber-500">{stats.medium} TB</span>}
                </div>
                {stats.mastered > 0 && <span className="text-emerald-600">{stats.mastered} Đã biết</span>}
            </div>
        </div>
    )
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8" onClick={() => setShowColorPicker(false)}>
      <header className="flex flex-col xl:flex-row justify-between items-center gap-6 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className={`bg-${themeColor}-600 p-2 rounded-lg text-white transition-colors duration-300`}>
            <Library size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">THƯ VIỆN FLASHCARD</h1>
            <p className="text-slate-500 text-sm">Quản lý và theo dõi tiến độ học tập</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-end">
            <div className="flex gap-2 mr-2">
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all text-sm font-medium"
                    title="Tải dữ liệu về máy"
                >
                    <Download size={16} /> Sao lưu
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all text-sm font-medium"
                    title="Tải dữ liệu lên"
                >
                    <Upload size={16} /> Khôi phục
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleImportFile}
                />
            </div>

          <div className="relative">
            <button 
                onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
                className="flex items-center justify-center p-2.5 bg-white text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                title="Đổi màu giao diện"
            >
                <Palette size={20} />
            </button>
            {showColorPicker && (
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-12 right-0 bg-white p-4 rounded-xl shadow-xl border border-slate-200 z-50 w-64 animate-in fade-in zoom-in-95 duration-200"
                >
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Chọn màu giao diện</h4>
                    <div className="grid grid-cols-4 gap-2">
                        {colors.map((c) => (
                            <button
                                key={c.value}
                                onClick={() => onUpdateTheme(c.value)}
                                className={`w-full aspect-square rounded-lg ${c.bg} flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95`}
                                title={c.label}
                            >
                                {themeColor === c.value && <Check size={16} strokeWidth={3} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <button 
            onClick={() => setIsCreating(true)}
            className={`flex items-center gap-2 px-5 py-2.5 bg-${themeColor}-600 text-white rounded-xl hover:bg-${themeColor}-700 transition-all font-medium shadow-md hover:shadow-lg`}
          >
            <Plus size={20} />
            Tạo bộ thẻ mới
          </button>
        </div>
      </header>

      {/* Modal Tạo bộ thẻ mới */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Tên bộ thẻ mới</h3>
            <form onSubmit={handleCreate}>
              <input 
                autoFocus
                type="text" 
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="VD: Từ vựng chuyên ngành..."
                className={`w-full p-3 bg-white border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-${themeColor}-500 outline-none`}
              />
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className={`px-4 py-2 bg-${themeColor}-600 text-white rounded-lg hover:bg-${themeColor}-700`}
                >
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận xóa */}
      {deckToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border-2 border-red-100">
            <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Xóa bộ thẻ?</h3>
                <p className="text-slate-500 mb-6">
                    Bạn có chắc chắn muốn xóa bộ thẻ <strong className="text-slate-800">"{deckToDelete.name}"</strong>? 
                    <br/>
                    <span className="text-xs text-red-500 mt-1 block">Hành động này không thể hoàn tác.</span>
                </p>
                
                <div className="flex w-full gap-3">
                    <button 
                    onClick={() => setDeckToDelete(null)}
                    className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                    >
                    Hủy bỏ
                    </button>
                    <button 
                    onClick={confirmDeleteDeck}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium transition-colors shadow-lg shadow-red-200"
                    >
                    Xóa vĩnh viễn
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <BookOpen size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-700">Chưa có bộ thẻ nào</h3>
            <p className="text-slate-500 mb-6">Hãy tạo bộ thẻ đầu tiên để bắt đầu học</p>
            <button 
              onClick={() => setIsCreating(true)}
              className={`text-${themeColor}-600 font-medium hover:underline`}
            >
              + Tạo ngay
            </button>
          </div>
        ) : (
          decks.map(deck => (
            <div key={deck.id} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-slate-200 flex flex-col justify-between h-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <button 
                    onClick={(e) => { e.stopPropagation(); setDeckToDelete(deck); }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Xóa bộ thẻ"
                  >
                    <Trash2 size={18} />
                 </button>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1 pr-8">{deck.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {deck.cards.length} thẻ
                </span>
                
                {/* Visual Stats Bar */}
                {renderDeckStats(deck.cards)}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => onStudyDeck(deck.id)}
                  disabled={deck.cards.length === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 bg-${themeColor}-600 text-white rounded-xl hover:bg-${themeColor}-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-${themeColor}-100 shadow-lg`}
                >
                  <Play size={16} fill="currentColor" /> Học ngay
                </button>
                <button 
                  onClick={() => onSelectDeck(deck.id)}
                  className="flex-none flex items-center justify-center w-12 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  title="Chỉnh sửa bộ thẻ"
                >
                  <Edit size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { Card, Deck, ThemeColor, DeckFieldNames } from '../types';
import { Plus, Trash2, Save, ArrowLeft, PenLine, Columns, ListPlus, FileSpreadsheet, Upload, Settings2, X } from 'lucide-react';

interface DeckEditorProps {
  deck: Deck;
  onUpdateDeck: (updatedDeck: Deck) => void;
  onStartStudy: () => void;
  onBack: () => void;
  themeColor: ThemeColor;
}

export const DeckEditor: React.FC<DeckEditorProps> = ({ deck, onUpdateDeck, onStartStudy, onBack, themeColor }) => {
  // Single card state
  const [front, setFront] = useState('');
  const [back1, setBack1] = useState('');
  const [back2, setBack2] = useState('');
  
  // Bulk import state
  const [inputMode, setInputMode] = useState<'single' | 'bulk'>('single');
  const [bulkText, setBulkText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRenaming, setIsRenaming] = useState(false);
  const [deckName, setDeckName] = useState(deck.name);

  // Field naming state
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const [fieldNames, setFieldNames] = useState<DeckFieldNames>({
    front: deck.fieldNames?.front || 'Trường 1 (Mặt trước)',
    backPrimary: deck.fieldNames?.backPrimary || 'Trường 2 (Mặt sau)',
    backSecondary: deck.fieldNames?.backSecondary || 'Trường 3 (Phụ)'
  });

  // Sync state if deck prop changes externally
  useEffect(() => {
     setFieldNames({
        front: deck.fieldNames?.front || 'Trường 1 (Mặt trước)',
        backPrimary: deck.fieldNames?.backPrimary || 'Trường 2 (Mặt sau)',
        backSecondary: deck.fieldNames?.backSecondary || 'Trường 3 (Phụ)'
     });
  }, [deck.fieldNames]);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back1.trim()) return;

    const newCard: Card = {
      id: crypto.randomUUID(),
      front: front.trim(),
      backPrimary: back1.trim(),
      backSecondary: back2.trim(),
      interval: 0,
      easeFactor: 2.5,
      nextReview: 0
    };

    onUpdateDeck({
      ...deck,
      cards: [...deck.cards, newCard]
    });

    setFront('');
    setBack1('');
    setBack2('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
            setBulkText(text);
            setInputMode('bulk');
        }
    };
    reader.readAsText(file);
    // Reset value to allow selecting same file again
    e.target.value = '';
  };

  const handleBulkImport = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n');
    const newCards: Card[] = [];

    lines.forEach(line => {
      if (!line.trim()) return;
      
      // Split by pipe (|)
      let segments = line.split('|').map(s => s.trim());
      
      // Fallback: If no pipes found, try splitting by tab (common for excel copy paste)
      if (segments.length < 2 && line.includes('\t')) {
         segments = line.split('\t').map(s => s.trim());
      }

      // Smart parsing: If we have 2 segments, check if segment 2 contains a semicolon to split into segment 3
      // This supports format: Front | Back1 ; Back2
      if (segments.length === 2 && segments[1].includes(';')) {
          const firstSemi = segments[1].indexOf(';');
          const p1 = segments[1].substring(0, firstSemi).trim();
          const p2 = segments[1].substring(firstSemi + 1).trim();
          if (p1 && p2) {
              segments[1] = p1;
              segments[2] = p2;
          }
      }

      if (segments.length >= 2 && segments[0] && segments[1]) {
        newCards.push({
          id: crypto.randomUUID(),
          front: segments[0],
          backPrimary: segments[1],
          backSecondary: segments[2] || '',
          interval: 0,
          easeFactor: 2.5,
          nextReview: 0
        });
      }
    });

    if (newCards.length > 0) {
      onUpdateDeck({
        ...deck,
        cards: [...deck.cards, ...newCards]
      });
      setBulkText('');
      alert(`Đã thêm thành công ${newCards.length} thẻ!`);
      setInputMode('single');
    } else {
        alert("Không tìm thấy thẻ hợp lệ. Vui lòng kiểm tra định dạng (Mặt trước | Mặt sau).");
    }
  };

  const handleDeleteCard = (id: string) => {
    onUpdateDeck({
      ...deck,
      cards: deck.cards.filter(c => c.id !== id)
    });
  };

  const saveDeckName = () => {
    if (deckName.trim() && deckName !== deck.name) {
      onUpdateDeck({ ...deck, name: deckName.trim() });
    }
    setIsRenaming(false);
  };

  const saveFieldNames = () => {
      onUpdateDeck({
          ...deck,
          fieldNames: fieldNames
      });
      setShowFieldSettings(false);
  };

  // Tính số lượng thẻ cần ôn
  const dueCount = deck.cards.filter(c => !c.nextReview || c.nextReview <= Date.now()).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex flex-col gap-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors w-fit"
        >
          <ArrowLeft size={20} /> Quay lại thư viện
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3 w-full md:w-auto">
             {isRenaming ? (
               <input 
                 autoFocus
                 className={`text-3xl font-bold text-slate-900 border-b-2 border-${themeColor}-500 outline-none bg-transparent w-full md:w-96`}
                 value={deckName}
                 onChange={(e) => setDeckName(e.target.value)}
                 onBlur={saveDeckName}
                 onKeyDown={(e) => e.key === 'Enter' && saveDeckName()}
               />
             ) : (
               <h1 
                onClick={() => setIsRenaming(true)}
                className={`text-3xl font-bold text-slate-900 flex items-center gap-3 cursor-pointer hover:text-${themeColor}-700 transition-colors group`}
                title="Nhấn để đổi tên"
               >
                 {deck.name}
                 <PenLine size={20} className={`text-slate-300 group-hover:text-${themeColor}-500 opacity-0 group-hover:opacity-100 transition-all`} />
               </h1>
             )}
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={onStartStudy}
              disabled={deck.cards.length === 0}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-${themeColor}-600 text-white rounded-lg hover:bg-${themeColor}-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {dueCount > 0 ? `Học ngay (${dueCount} thẻ)` : 'Ôn tập tùy chọn'}
            </button>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Input Form */}
        <div className="md:col-span-5 lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-6 flex flex-col gap-4">
            
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Plus className={`text-${themeColor}-500`} size={20} /> Thêm thẻ
                </h2>
                <div className="flex bg-slate-100 p-1 rounded-lg items-center">
                    <button 
                        onClick={() => setShowFieldSettings(!showFieldSettings)}
                         className={`p-1.5 rounded-md transition-all ${showFieldSettings ? `bg-white shadow text-${themeColor}-600` : 'text-slate-500 hover:text-slate-700'}`}
                        title="Đổi tên trường dữ liệu"
                    >
                        <Settings2 size={18} />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <button 
                        onClick={() => setInputMode('single')}
                        className={`p-1.5 rounded-md transition-all ${inputMode === 'single' ? `bg-white shadow text-${themeColor}-600` : 'text-slate-500 hover:text-slate-700'}`}
                        title="Thêm từng thẻ"
                    >
                        <ListPlus size={18} />
                    </button>
                    <button 
                        onClick={() => setInputMode('bulk')}
                        className={`p-1.5 rounded-md transition-all ${inputMode === 'bulk' ? `bg-white shadow text-${themeColor}-600` : 'text-slate-500 hover:text-slate-700'}`}
                        title="Thêm hàng loạt"
                    >
                        <FileSpreadsheet size={18} />
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-1.5 rounded-md transition-all text-slate-500 hover:text-slate-700 hover:bg-white hover:shadow`}
                        title="Nhập từ file (TXT/CSV)"
                    >
                        <Upload size={18} />
                    </button>
                    <input 
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".txt,.csv,.tsv"
                        onChange={handleFileUpload}
                    />
                </div>
            </div>

            {/* Field Naming Settings */}
            {showFieldSettings && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 mb-2">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-slate-700">Tên trường dữ liệu</h3>
                        <button onClick={() => setShowFieldSettings(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs shrink-0">1</div>
                             <input 
                                value={fieldNames.front}
                                onChange={(e) => setFieldNames({...fieldNames, front: e.target.value})}
                                className="text-xs w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Tên trường 1 (VD: Từ vựng)"
                             />
                        </div>
                        <div className="flex items-center gap-2">
                             <div className={`w-6 h-6 rounded-full bg-${themeColor}-100 text-${themeColor}-600 flex items-center justify-center text-xs shrink-0`}>2</div>
                             <input 
                                value={fieldNames.backPrimary}
                                onChange={(e) => setFieldNames({...fieldNames, backPrimary: e.target.value})}
                                className="text-xs w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Tên trường 2 (VD: Nghĩa)"
                             />
                        </div>
                        <div className="flex items-center gap-2">
                             <div className={`w-6 h-6 rounded-full bg-${themeColor}-100 text-${themeColor}-600 flex items-center justify-center text-xs shrink-0`}>3</div>
                             <input 
                                value={fieldNames.backSecondary}
                                onChange={(e) => setFieldNames({...fieldNames, backSecondary: e.target.value})}
                                className="text-xs w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Tên trường 3 (VD: Ví dụ)"
                             />
                        </div>
                        <button 
                            onClick={saveFieldNames}
                            className={`w-full py-1.5 bg-${themeColor}-600 text-white text-xs font-bold rounded hover:bg-${themeColor}-700 mt-2`}
                        >
                            Lưu cấu hình
                        </button>
                    </div>
                </div>
            )}

            {inputMode === 'single' ? (
              <form onSubmit={handleAddCard} className="space-y-4">
                
                {/* Field 1 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">1</span>
                    {fieldNames.front}
                  </label>
                  <textarea
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    placeholder="Nội dung chính..."
                    rows={2}
                    className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 outline-none transition-all`}
                  />
                </div>
                
                <div className="pt-2 border-t border-slate-100"></div>

                {/* Field 2 */}
                <div>
                   <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                    <span className={`w-6 h-6 rounded-full bg-${themeColor}-100 text-${themeColor}-500 flex items-center justify-center text-xs`}>2</span>
                    {fieldNames.backPrimary}
                   </label>
                  <textarea
                    value={back1}
                    onChange={(e) => setBack1(e.target.value)}
                    placeholder="Giải nghĩa / Định nghĩa..."
                    rows={2}
                    className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 outline-none transition-all`}
                  />
                </div>

                {/* Field 3 */}
                <div>
                   <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                    <span className={`w-6 h-6 rounded-full bg-${themeColor}-100 text-${themeColor}-500 flex items-center justify-center text-xs`}>3</span>
                    {fieldNames.backSecondary}
                   </label>
                  <textarea
                    value={back2}
                    onChange={(e) => setBack2(e.target.value)}
                    placeholder="Ví dụ / Ghi chú thêm..."
                    rows={2}
                    className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 outline-none transition-all`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!front || !back1}
                  className={`w-full py-3 bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:shadow-none mt-2`}
                >
                    <Save size={18} /> Lưu thẻ
                </button>
              </form>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
                        <p className="font-semibold">Hướng dẫn:</p>
                        <p>Nhập mỗi thẻ trên một dòng. Có thể dùng các định dạng:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><code className="bg-white px-1 border rounded text-rose-500 font-bold">|</code> {fieldNames.front} | {fieldNames.backPrimary} | {fieldNames.backSecondary}</li>
                            <li><code className="bg-white px-1 border rounded text-blue-500 font-bold">TAB</code> {fieldNames.front} [Tab] {fieldNames.backPrimary}</li>
                        </ul>
                     </div>
                     
                     <textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder="Dán danh sách hoặc tải file..."
                        rows={12}
                        className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-${themeColor}-500 outline-none transition-all font-mono text-sm`}
                      />

                    <button
                      onClick={handleBulkImport}
                      disabled={!bulkText.trim()}
                      className={`w-full py-3 bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:shadow-none`}
                    >
                        <FileSpreadsheet size={18} /> Nhập danh sách
                    </button>
                </div>
            )}
        </div>

        {/* List of Cards */}
        <div className="md:col-span-7 lg:col-span-8 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Columns size={20} className="text-slate-400"/>
              Danh sách thẻ ({deck.cards.length})
            </h2>
          {deck.cards.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
              Bộ thẻ này đang trống. Hãy nhập liệu ở cột bên trái.
            </div>
          ) : (
            deck.cards.map((card) => {
              const nextReviewDate = card.nextReview ? new Date(card.nextReview).toLocaleDateString('vi-VN') : 'Mới';
              return (
                <div key={card.id} className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative">
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                    title="Xóa thẻ"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="pr-8 grid grid-cols-12 gap-4">
                      {/* Field 1 display */}
                      <div className="col-span-4 border-r border-slate-100 pr-4">
                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">{fieldNames.front}</span>
                        <h3 className="font-bold text-lg text-slate-800 break-words">{card.front}</h3>
                      </div>
                      
                      {/* Field 2 & 3 display */}
                      <div className="col-span-8 pl-2">
                         <div className="mb-2">
                           <span className={`text-xs font-bold text-${themeColor}-300 uppercase block mb-1`}>{fieldNames.backPrimary}</span>
                           <p className="text-slate-800">{card.backPrimary}</p>
                         </div>
                         {card.backSecondary && (
                           <div>
                             <span className={`text-xs font-bold text-${themeColor}-300 uppercase block mb-1`}>{fieldNames.backSecondary}</span>
                             <p className="text-slate-500 italic text-sm">{card.backSecondary}</p>
                           </div>
                         )}
                      </div>
                  </div>
                  <div className="pt-2 mt-3 border-t border-slate-50 flex items-center gap-4 text-xs text-slate-400">
                      <span>Ôn tiếp: {nextReviewDate}</span>
                      <span>Khoảng cách: {card.interval || 0} ngày</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, Deck, ViewMode, ThemeColor } from './types';
import { DeckEditor } from './components/DeckEditor';
import { StudySession } from './components/StudySession';
import { DeckDashboard } from './components/DeckDashboard';

// Sample Initial Data with SRS fields initialized
const DEFAULT_DECKS: Deck[] = [
  {
    id: 'demo-deck-1',
    name: 'Tiếng Anh Cơ Bản',
    createdAt: Date.now(),
    fieldNames: {
      front: 'Từ vựng (EN)',
      backPrimary: 'Nghĩa (VN)',
      backSecondary: 'Ví dụ / Định nghĩa'
    },
    cards: [
      {
        id: '1',
        front: 'Hello',
        backPrimary: 'Xin chào',
        backSecondary: 'Used as a greeting or to begin a telephone conversation.',
        interval: 0,
        easeFactor: 2.5,
        nextReview: 0
      },
      {
        id: '2',
        front: 'Apple',
        backPrimary: 'Quả táo',
        backSecondary: 'A round fruit with red or green skin and a white inside.',
        interval: 0,
        easeFactor: 2.5,
        nextReview: 0
      }
    ]
  },
  {
    id: 'demo-deck-2',
    name: 'Thuật ngữ Lập trình',
    createdAt: Date.now(),
    fieldNames: {
        front: 'Thuật ngữ',
        backPrimary: 'Giải thích',
        backSecondary: 'Ghi chú'
    },
    cards: [
      {
        id: '3',
        front: 'Algorithm',
        backPrimary: 'Thuật toán',
        backSecondary: 'A process or set of rules to be followed in calculations.',
        interval: 0,
        easeFactor: 2.5,
        nextReview: 0
      }
    ]
  }
];

const STORAGE_KEY = 'FLASHCARD_PRO_DATA_V1';

function App() {
  // Initialize state from LocalStorage if available
  const [decks, setDecks] = useState<Deck[]>(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error("Failed to load data from storage:", error);
    }
    return DEFAULT_DECKS;
  });

  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [themeColor, setThemeColor] = useState<ThemeColor>('indigo');

  // Persist data to LocalStorage whenever decks change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  }, [decks]);

  // Deck Management Functions
  const handleCreateDeck = (name: string) => {
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name: name,
      cards: [],
      createdAt: Date.now()
    };
    setDecks([newDeck, ...decks]);
    setActiveDeckId(newDeck.id);
    setViewMode(ViewMode.EDITOR);
  };

  const handleUpdateDeck = (updatedDeck: Deck) => {
    setDecks(prevDecks => prevDecks.map(deck => 
      deck.id === updatedDeck.id ? updatedDeck : deck
    ));
  };

  const handleCardUpdate = (updatedCard: Card) => {
    if (!activeDeckId) return;

    setDecks(prevDecks => prevDecks.map(deck => {
        if (deck.id === activeDeckId) {
            return {
                ...deck,
                cards: deck.cards.map(c => c.id === updatedCard.id ? updatedCard : c)
            };
        }
        return deck;
    }));
  };

  const handleDeleteDeck = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bộ thẻ này?")) {
      setDecks(prevDecks => prevDecks.filter(d => d.id !== id));
      if (activeDeckId === id) {
        setActiveDeckId(null);
        setViewMode(ViewMode.DASHBOARD);
      }
    }
  };

  const handleImportData = (importedDecks: Deck[]) => {
      if (window.confirm("Thao tác này sẽ ghi đè dữ liệu hiện tại bằng dữ liệu từ file. Bạn có chắc chắn không?")) {
          setDecks(importedDecks);
          alert("Khôi phục dữ liệu thành công!");
      }
  };

  // Navigation Functions
  const handleSelectDeckForEdit = (id: string) => {
    setActiveDeckId(id);
    setViewMode(ViewMode.EDITOR);
  };

  const handleSelectDeckForStudy = (id: string) => {
    setActiveDeckId(id);
    setViewMode(ViewMode.STUDY);
  };

  const handleBackToDashboard = () => {
    setActiveDeckId(null);
    setViewMode(ViewMode.DASHBOARD);
  };

  // Derived State
  const activeDeck = decks.find(d => d.id === activeDeckId);

  // Render Logic
  const renderContent = () => {
    switch (viewMode) {
      case ViewMode.STUDY:
        if (!activeDeck) return null;
        return (
          <StudySession 
            cards={activeDeck.cards} 
            onExit={() => setViewMode(ViewMode.EDITOR)}
            onUpdateCard={handleCardUpdate}
            themeColor={themeColor}
            fieldNames={activeDeck.fieldNames}
          />
        );
      
      case ViewMode.EDITOR:
        if (!activeDeck) return null;
        return (
          <DeckEditor 
            deck={activeDeck}
            onUpdateDeck={handleUpdateDeck}
            onStartStudy={() => setViewMode(ViewMode.STUDY)}
            onBack={handleBackToDashboard}
            themeColor={themeColor}
          />
        );
      
      case ViewMode.DASHBOARD:
      default:
        return (
          <DeckDashboard 
            decks={decks}
            onCreateDeck={handleCreateDeck}
            onSelectDeck={handleSelectDeckForEdit}
            onDeleteDeck={handleDeleteDeck}
            onStudyDeck={handleSelectDeckForStudy}
            themeColor={themeColor}
            onUpdateTheme={setThemeColor}
            onImportData={handleImportData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {renderContent()}
    </div>
  );
}

export default App;
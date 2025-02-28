import React, { useState, useEffect, useRef } from 'react';
import { Shuffle, Save, Play, Trash2, Plus, X } from 'lucide-react';

function App() {
  const [names, setNames] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [savedLists, setSavedLists] = useState<{ id: string; names: string[] }[]>([]);
  const [listName, setListName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const animationRef = useRef<number | null>(null);
  const selectionDuration = 4000; // 4 seconds

  // Load saved lists from localStorage on component mount
  useEffect(() => {
    const savedListsFromStorage = localStorage.getItem('ploufPloufSavedLists');
    if (savedListsFromStorage) {
      setSavedLists(JSON.parse(savedListsFromStorage));
    }
  }, []);

  // Save lists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ploufPloufSavedLists', JSON.stringify(savedLists));
  }, [savedLists]);

  const handleAddName = () => {
    if (newName.trim() !== '' && !names.includes(newName.trim())) {
      setNames([...names, newName.trim()]);
      setNewName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddName();
    }
  };

  const handleRemoveName = (indexToRemove: number) => {
    setNames(names.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveList = () => {
    if (listName.trim() !== '' && names.length > 0) {
      const newList = {
        id: Date.now().toString(),
        names: [...names]
      };
      setSavedLists([...savedLists, newList]);
      setListName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadList = (listId: string) => {
    const listToLoad = savedLists.find(list => list.id === listId);
    if (listToLoad) {
      setNames([...listToLoad.names]);
    }
  };

  const handleDeleteList = (listId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedLists(savedLists.filter(list => list.id !== listId));
  };

  const startSelection = () => {
    if (names.length < 2) return;
    
    // Clear any existing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    setIsSelecting(true);
    setSelectedName(null);
    
    const startTime = Date.now();
    const endTime = startTime + selectionDuration;
    
    const animate = () => {
      const now = Date.now();
      const progress = (now - startTime) / selectionDuration;
      
      if (now < endTime) {
        // During animation, rapidly cycle through names
        const randomIndex = Math.floor(Math.random() * names.length);
        setSelectedName(names[randomIndex]);
        
        // Slow down the animation as it progresses
        const delay = 50 + Math.floor(progress * 450); // 50ms at start, up to 500ms at end
        animationRef.current = window.setTimeout(animate, delay);
      } else {
        // Animation complete, select final name
        const finalIndex = Math.floor(Math.random() * names.length);
        setSelectedName(names[finalIndex]);
        setIsSelecting(false);
      }
    };
    
    animate();
  };

  const restartWithoutSelected = () => {
    if (selectedName) {
      const updatedNames = names.filter(name => name !== selectedName);
      setNames(updatedNames);
      
      // Only restart if we have at least 2 names left
      if (updatedNames.length >= 2) {
        // We need to set selectedName to null before starting a new selection
        // to ensure React registers the state change
        setSelectedName(null);
        
        // Use setTimeout with 0 delay to ensure state updates before restarting
        setTimeout(() => {
          startSelection();
        }, 0);
      } else {
        setSelectedName(null);
      }
    }
  };

  const restart = () => {
    // We need to set selectedName to null before starting a new selection
    setSelectedName(null);
    
    // Use setTimeout with 0 delay to ensure state updates before restarting
    setTimeout(() => {
      startSelection();
    }, 0);
  };

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Plouf Plouf
        </h1>

        {/* Name input */}
        <div className="flex mb-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ajouter un nom"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddName}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Names list */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">Liste des noms:</h2>
          {names.length === 0 ? (
            <p className="text-gray-500 italic">Aucun nom ajouté</p>
          ) : (
            <ul className="space-y-2">
              {names.map((name, index) => (
                <li
                  key={index}
                  className={`flex justify-between items-center p-2 rounded-lg ${
                    selectedName === name
                      ? 'bg-indigo-100 border-2 border-indigo-500'
                      : 'bg-gray-100'
                  }`}
                >
                  <span>{name}</span>
                  <button
                    onClick={() => handleRemoveName(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={startSelection}
            disabled={names.length < 2 || isSelecting}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg ${
              names.length < 2 || isSelecting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Play size={18} />
            <span>Lancer</span>
          </button>
          
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={names.length === 0}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
              names.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Save size={18} />
          </button>
        </div>

        {/* Result section */}
        {selectedName && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-indigo-700">Résultat:</h2>
            <p className="text-2xl font-bold text-center py-3">{selectedName}</p>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={restart}
                disabled={isSelecting}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg ${
                  isSelecting
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <Shuffle size={18} />
                <span>Relancer</span>
              </button>
              <button
                onClick={restartWithoutSelected}
                disabled={isSelecting}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg ${
                  isSelecting
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                <Shuffle size={18} />
                <span>Relancer sans {selectedName}</span>
              </button>
            </div>
          </div>
        )}

        {/* Saved lists */}
        {savedLists.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Listes sauvegardées:</h2>
            <div className="space-y-2">
              {savedLists.map((list) => (
                <div
                  key={list.id}
                  onClick={() => handleLoadList(list.id)}
                  className="flex justify-between items-center p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                >
                  <span>Liste ({list.names.length} noms)</span>
                  <button
                    onClick={(e) => handleDeleteList(list.id, e)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Sauvegarder la liste</h2>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="Nom de la liste"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveList}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
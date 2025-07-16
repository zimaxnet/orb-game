import React, { useState, useEffect } from 'react';
import './MemoryTrivia.css';

const MemoryTrivia = ({ onBack, onClose }) => {
  const [memories, setMemories] = useState([]);
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const BACKEND_URL = 'https://orb-game-backend-eastus2.gentleglacier-6f66d2ea.eastus2.azurecontainerapps.io';

  // Fetch memories once on mount
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/memory/export`);
        const data = await res.json();
        const memArray = Array.isArray(data) ? data : [];
        setMemories(memArray);
        if (memArray.length >= 4) {
          generateQuestion(memArray);
        }
      } catch {
        setMemories([]);
      }
    };
    fetchMemories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const generateQuestion = (memArray) => {
    if (!memArray.length) return;
    const correct = memArray[Math.floor(Math.random() * memArray.length)];

    // Collect distractors
    const pool = memArray.filter((m) => m.key !== correct.key && m.content);
    const distractors = [];
    while (distractors.length < 3 && pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      distractors.push(pool.splice(idx, 1)[0]);
    }

    // Build options and shuffle
    const allOptions = [correct.content, ...distractors.map((m) => m.content)].sort(() => Math.random() - 0.5);

    setCurrent(correct);
    setOptions(allOptions);
    setSelected(null);
  };

  const handleSelect = (opt) => {
    if (selected) return; // Prevent multiple selections
    setSelected(opt);

    if (opt === current.content) {
      setScore((prev) => prev + 1);
    }

    // Next round after short delay
    setTimeout(() => {
      setRound((prev) => prev + 1);
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onBack}>
      <div className="modal-content trivia-modal" onClick={(e) => e.stopPropagation()}>
        <h3>🎮 Memory Trivia</h3>
        {current ? (
          <>
            <p><strong>Q:</strong> {current.key}</p>
            <div className="trivia-options">
              {options.map((opt, i) => (
                <button
                  key={i}
                  className={`trivia-option ${selected ? (opt === current.content ? 'correct' : opt === selected ? 'wrong' : '') : ''}`}
                  onClick={() => handleSelect(opt)}
                  disabled={!!selected}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p style={{ marginTop: '16px' }}>Score: {score}</p>
            <div className="modal-actions">
              <button className="modal-back-btn" onClick={onBack}>← Back to Controls</button>
              <button className="modal-close-btn" onClick={onClose}>Return to Chat</button>
            </div>
          </>
        ) : (
          <p>Loading trivia...</p>
        )}
      </div>
    </div>
  );
};

export default MemoryTrivia; 
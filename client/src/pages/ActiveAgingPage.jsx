import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Brain, 
  Activity, 
  Smile, 
  Play, 
  CheckCircle2, 
  Award, 
  Volume2, 
  RefreshCw,
  HeartHandshake
} from 'lucide-react';
import { speakText } from '../services/ttsService';

const exercisesList = [
  {
    id: 'ex1',
    title: 'Seated Chair Yoga & Stretch',
    duration: '5 Mins',
    level: 'Gentle',
    description: 'Slow neck tilts, shoulder rolls, and gentle torso twists to relieve stiffness while seated comfortably.',
    steps: [
      'Sit upright on a sturdy chair with feet flat on the floor.',
      'Inhale deeply and roll your shoulders backward 5 times.',
      'Gently tilt your right ear toward your right shoulder. Hold for 5 seconds.',
      'Repeat on the left side and finish with 3 deep abdominal breaths.'
    ]
  },
  {
    id: 'ex2',
    title: 'Ankle & Calf Flexing',
    duration: '3 Mins',
    level: 'Easy',
    description: 'Improves leg blood circulation and reduces foot swelling for seniors.',
    steps: [
      'Extend your right leg straight while sitting.',
      'Rotate your ankle in clockwise circles 10 times.',
      'Point your toes forward, then flex them upward toward your knees.',
      'Switch to the left leg and repeat.'
    ]
  },
  {
    id: 'ex3',
    title: 'Deep Pranayama Breathing',
    duration: '4 Mins',
    level: 'Relaxing',
    description: 'Calms the nervous system, lowers blood pressure, and improves lung capacity.',
    steps: [
      'Place one hand on your chest and one on your abdomen.',
      'Inhale slowly through your nose for 4 seconds, expanding your belly.',
      'Hold gently for 2 seconds.',
      'Exhale slowly through purse-lipped mouth for 6 seconds.'
    ]
  }
];

const memoryCardsData = [
  { id: 1, icon: '🍎', name: 'Apple' },
  { id: 2, icon: '🧘', name: 'Yoga' },
  { id: 3, icon: '💊', name: 'Medicine' },
  { id: 4, icon: '❤️', name: 'Heart' },
  { id: 5, icon: '💧', name: 'Water' },
  { id: 6, icon: '☀️', name: 'Sun' }
];

const ActiveAgingPage = () => {
  const [activeTab, setActiveTab] = useState('exercises'); // 'exercises' or 'brain'
  const [selectedEx, setSelectedEx] = useState(exercisesList[0]);

  // Memory Game State
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const startNewGame = () => {
    const duplicated = [...memoryCardsData, ...memoryCardsData].map((item, index) => ({
      ...item,
      uniqueId: index
    }));
    // Shuffle
    const shuffled = duplicated.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].id)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.id === secondCard.id) {
        const newMatched = [...matched, firstCard.id];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === memoryCardsData.length) {
          setGameWon(true);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  const handleListenExercise = (ex) => {
    const text = `${ex.title}. ${ex.description}. Steps: ${ex.steps.join('. ')}`;
    speakText(text);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#EEF3EF] text-[#3D5A45] rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Senior Wellness & Memory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Active Aging & Brain Gym
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Gentle senior exercises, yoga routines, and memory games for cognitive vitality
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('exercises')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'exercises' ? 'bg-white text-[#3D5A45] shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Gentle Exercises</span>
          </button>
          <button
            onClick={() => { setActiveTab('brain'); if (cards.length === 0) startNewGame(); }}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'brain' ? 'bg-white text-[#3D5A45] shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Memory Game</span>
          </button>
        </div>
      </div>

      {activeTab === 'exercises' ? (
        /* Exercises Section */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exercise Selection List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">Senior Workouts</h2>
            {exercisesList.map((ex) => {
              const isSelected = selectedEx.id === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => setSelectedEx(ex)}
                  className={`w-full p-4 rounded-3xl border text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-white border-[#3D5A45] ring-2 ring-[#3D5A45] shadow-md' 
                      : 'bg-white/80 border-gray-100 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-base text-gray-900">{ex.title}</h3>
                    <span className="px-2 py-0.5 bg-[#EEF3EF] text-[#3D5A45] text-[10px] font-bold rounded-md">
                      {ex.duration}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{ex.description}</p>
                </button>
              );
            })}
          </div>

          {/* Active Exercise Detail Card */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-wider">{selectedEx.level} Routine</span>
                <h2 className="text-2xl font-black text-gray-900">{selectedEx.title}</h2>
              </div>

              <button
                onClick={() => handleListenExercise(selectedEx)}
                className="py-2.5 px-4 bg-[#EEF3EF] hover:bg-[#e2ebe4] text-[#3D5A45] font-bold text-xs rounded-2xl flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen Instructions</span>
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed font-medium">{selectedEx.description}</p>

            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Step-by-Step Instructions</h3>
              <div className="space-y-3">
                {selectedEx.steps.map((step, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start space-x-3">
                    <span className="w-6 h-6 rounded-full bg-[#3D5A45] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Memory Game Section */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Brain className="w-6 h-6 text-[#3D5A45]" />
                <span>Senior Memory Matching Game</span>
              </h2>
              <p className="text-xs text-gray-500">Flip cards to match identical health icons</p>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-gray-600">Moves: <strong className="text-[#3D5A45]">{moves}</strong></span>
              <button
                onClick={startNewGame}
                className="py-2 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </div>
          </div>

          {gameWon ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 bg-green-50 text-green-900 text-center rounded-3xl border border-green-200 space-y-4"
            >
              <Award className="w-12 h-12 text-[#3D5A45] mx-auto animate-bounce" />
              <h3 className="text-2xl font-black">Congratulations! Excellent Memory!</h3>
              <p className="text-xs font-semibold text-gray-600">You completed the cognitive match in {moves} moves!</p>
              <button
                onClick={startNewGame}
                className="py-3 px-6 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-bold text-xs rounded-2xl shadow-xs cursor-pointer"
              >
                Play Again
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
              {cards.map((card, idx) => {
                const isFlipped = flipped.includes(idx) || matched.includes(card.id);
                return (
                  <button
                    key={idx}
                    onClick={() => handleCardClick(idx)}
                    className={`h-24 sm:h-28 rounded-2xl border-2 text-3xl sm:text-4xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
                      isFlipped
                        ? 'bg-white border-[#3D5A45] shadow-xs scale-95'
                        : 'bg-[#EEF3EF] border-[#3D5A45]/30 hover:border-[#3D5A45] text-transparent'
                    }`}
                  >
                    {isFlipped ? card.icon : '❓'}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveAgingPage;

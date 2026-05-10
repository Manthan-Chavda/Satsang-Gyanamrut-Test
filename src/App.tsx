import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, CheckCircle, ChevronRight, RefreshCw, XCircle, Bookmark, BookmarkCheck, Eye, EyeOff, LayoutList } from 'lucide-react';
import { mcqQuestions, fibQuestions, Question } from './data';

type ViewState = 'home' | 'test' | 'result';

const CHAPTERS = [
  { id: 1, title: 'તત્ત્વજ્ઞાન : પ્રાથમિક પરિચય' },
  { id: 2, title: 'તત્ત્વમીમાંસા - ૧' },
  { id: 3, title: 'તત્ત્વમીમાંસા - ૨' },
  { id: 4, title: 'તત્ત્વમીમાંસા - ૩' },
  { id: 5, title: 'સત્સંગદીક્ષા શ્લોક' },
];

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [testType, setTestType] = useState<'mcq' | 'fib' | 'bookmark'>('mcq');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('bookmarkedIds');
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {
      console.error('Error loading bookmarks', e);
    }
    return new Set();
  });
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  // Sync bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('bookmarkedIds', JSON.stringify(Array.from(bookmarkedIds)));
  }, [bookmarkedIds]);

  const score = useMemo(() => {
    return currentQuestions.reduce((acc, q) => acc + (userAnswers[q.id] === q.answer ? 1 : 0), 0);
  }, [currentQuestions, userAnswers]);

  const currentQuestion = currentQuestions[currentQIndex];

  const shuffledOptions = useMemo(() => {
    if (!currentQuestion) return [];
    // create a copy to avoid mutating the original data
    const opts = [...currentQuestion.options];
    // Deterministic shuffle logic based on id. Using a basic linear congruential generator for consistency.
    let seed = currentQuestion.id;
    for (let i = opts.length - 1; i > 0; i--) {
        seed = (seed * 16807) % 2147483647;
        const j = seed % (i + 1);
        [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [currentQuestion?.id]);

  const startTest = (type: 'mcq' | 'fib' | 'bookmark', chapterId?: number) => {
    let questionsToAsk: Question[] = [];
    if (type === 'mcq') {
      questionsToAsk = mcqQuestions.filter(q => q.chapter === chapterId);
    }
    else if (type === 'fib') {
      questionsToAsk = fibQuestions.filter(q => q.chapter === chapterId);
    }
    else if (type === 'bookmark') {
      const allQs = [...mcqQuestions, ...fibQuestions];
      questionsToAsk = allQs.filter(q => bookmarkedIds.has(q.id));
    }

    if (questionsToAsk.length === 0) {
      alert("આ વિભાગમાં અત્યારે કોઈ પ્રશ્નો નથી.");
      return;
    }

    setCurrentQuestions(questionsToAsk);
    setTestType(type);
    if (chapterId) setSelectedChapter(chapterId);
    setView('test');
    setCurrentQIndex(0);
    setUserAnswers({});
    setExpandedExplanations({});
  };

  const handleAnswerSelect = (answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestions[currentQIndex].id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQIndex < currentQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setView('result');
    }
  };

  const toggleExplanation = (id: number) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleBookmark = (id: number) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[70vh] gap-8 p-6"
    >
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
          સત્સંગ જ્ઞાનામૃત કસોટી
        </h1>
        <p className="text-lg text-slate-600 font-medium">
          તમારી પસંદગી મુજબ કસોટી શરૂ કરો. યોગ્ય પ્રકરણ પસંદ કરો.
        </p>
      </div>

      {bookmarkedIds.size > 0 && (
         <div className="w-full max-w-4xl flex justify-center mb-4">
            <button
              onClick={() => startTest('bookmark')}
              className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-md transition-all"
            >
              <BookmarkCheck size={24} className="text-yellow-400" />
              <div className="text-left">
                <span className="block font-bold text-lg">બુકમાર્ક કરેલા પ્રશ્નો ({bookmarkedIds.size})</span>
                <span className="block text-sm text-slate-300">ફક્ત મુશ્કેલ પ્રશ્નો ફરીથી ઉકેલો</span>
              </div>
            </button>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {CHAPTERS.map(chapter => (
          <div key={chapter.id} className="bg-white border text-center border-slate-200 rounded-xl p-6 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-slate-100 p-3 rounded-full text-slate-600">
              <LayoutList size={24} />
            </div>
            <div>
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">પ્રકરણ {chapter.id}</h3>
              <h2 className="text-lg font-bold text-slate-800">{chapter.title}</h2>
            </div>
            
            <div className="flex w-full gap-3 mt-2">
              <button
                onClick={() => startTest('mcq', chapter.id)}
                className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg font-bold text-sm tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen size={16} /> MCQ
              </button>
              <button
                onClick={() => startTest('fib', chapter.id)}
                className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-lg font-bold text-sm tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} /> FIB
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderTest = () => {
    const question = currentQuestions[currentQIndex];
    if (!question) return null;

    const selectedAnswer = userAnswers[question.id];
    // We determine isFIB by checking for the placeholder '________'
    const isFIB = question.question.includes('________');
    const isBookmarked = bookmarkedIds.has(question.id);

    // Format question text for FIB
    const renderQuestionText = () => {
      if (!isFIB) return question.question;
      const parts = question.question.split('________');
      return (
        <span className="leading-relaxed">
          {parts[0]}
          <span className={`inline-block min-w-[120px] px-2 mx-2 border-b-2 font-bold text-center transition-colors ${selectedAnswer ? 'border-indigo-500 text-indigo-700' : 'border-slate-300 text-slate-400'}`}>
            {selectedAnswer || 'ખાલી જગ્યા'}
          </span>
          {parts[1]}
        </span>
      );
    };

    return (
      <motion.div
        key={currentQIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-3xl mx-auto p-6 md:p-12 flex flex-col"
      >
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm uppercase tracking-wider font-bold">પાછા જાઓ</span>
          </button>
          
          <button
            onClick={() => toggleBookmark(question.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wider transition-colors
              ${isBookmarked ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
            `}
          >
            {isBookmarked ? <BookmarkCheck size={16} className="fill-yellow-500" /> : <Bookmark size={16} />}
            {isBookmarked ? 'બુકમાર્ક સાચવી લીધો' : 'બુકમાર્ક કરો'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between items-end mb-2 text-sm font-semibold text-slate-500">
           <span>{selectedChapter ? CHAPTERS.find(c => c.id === selectedChapter)?.title : 'બુકમાર્ક્સ'}</span>
           <span>સ્કોર: {score} / {currentQuestions.length}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-10">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300 ease-out" 
            style={{ width: `${((currentQIndex + 1) / currentQuestions.length) * 100}%` }}
          />
        </div>

        <div className="mb-12">
          <div className="flex items-start gap-4 mb-6">
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase mt-1 ${isFIB ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
              પ્રશ્ન {(currentQIndex + 1).toString().padStart(2, '0')}
            </span>
            <h3 className="text-2xl md:text-3xl font-semibold leading-snug text-slate-800">
              {renderQuestionText()}
            </h3>
          </div>

          <div className="space-y-3">
            {shuffledOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(option)}
                className={`
                  group block w-full text-left p-4 rounded-xl cursor-pointer transition-all
                  ${selectedAnswer === option 
                    ? 'bg-white border-2 border-indigo-600 shadow-md shadow-indigo-100' 
                    : 'bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                    ${selectedAnswer === option 
                        ? 'border-indigo-600' 
                        : 'border-slate-300 group-hover:border-indigo-500'}
                  `}>
                    <div className={`w-2.5 h-2.5 rounded-full ${selectedAnswer === option ? 'bg-indigo-600' : 'bg-transparent'}`} />
                  </div>
                  <span className={`${selectedAnswer === option ? 'text-slate-800 font-semibold' : 'text-slate-600 font-medium'}`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-slate-200 mt-8">
           <div className="text-sm text-slate-400 font-medium">
            પ્રશ્ન {currentQIndex + 1} / {currentQuestions.length}
          </div>
          <button
             disabled={!selectedAnswer}
             onClick={handleNext}
             className={`
               flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all
               ${selectedAnswer 
                 ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 active:scale-95' 
                 : 'border border-slate-200 bg-white text-slate-400 cursor-not-allowed'}
             `}
           >
             {currentQIndex === currentQuestions.length - 1 ? 'પરિણામ જુઓ' : 'આગળ'}
             <ChevronRight size={16} />
           </button>
        </div>
      </motion.div>
    );
  };

  const renderResult = () => {
    let score = 0;
    currentQuestions.forEach(q => {
      if (userAnswers[q.id] === q.answer) score++;
    });

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl mx-auto p-6 pb-24"
      >
        <div className="bg-white rounded-xl p-8 text-center shadow-md border border-slate-200 mb-8">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">વિદ્યાર્થી પરિણામ</h2>
          <p className="text-slate-500 font-medium mb-8">તમારો સ્કોર નીચે મુજબ છે:</p>
          <div className="text-5xl font-mono font-semibold text-indigo-600 mb-4">
             {(score).toString().padStart(2, '0')} <span className="text-2xl text-slate-400 font-medium">/ {(currentQuestions.length).toString().padStart(2, '0')}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-6 mx-auto max-w-sm">
             <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${(score / currentQuestions.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">પ્રશ્નોના ઉત્તર</h3>
          {currentQuestions.map((q, idx) => {
            const isCorrect = userAnswers[q.id] === q.answer;
            const isExpanded = expandedExplanations[q.id];

            return (
              <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="pt-1 w-6 shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="text-emerald-500" size={20} />
                    ) : (
                      <XCircle className="text-rose-500" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-slate-800 mb-4 leading-snug">{idx + 1}. {q.question}</p>
                    
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2 border border-slate-100 bg-slate-50 px-4 py-2 rounded-lg">
                        <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold w-24 shrink-0">તમારો ઉત્તર:</span>
                        <span className={`font-medium ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {userAnswers[q.id] || "આપ્યો નથી"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 border border-emerald-100 bg-emerald-50 px-4 py-2 rounded-lg">
                        <span className="text-emerald-600/70 uppercase tracking-widest text-[10px] font-bold w-24 shrink-0">સાચો ઉત્તર:</span>
                        <span className="font-semibold text-emerald-700">{q.answer}</span>
                      </div>
                    </div>

                    {q.explanation && (
                      <div className="mt-4">
                        <button 
                          onClick={() => toggleExplanation(q.id)}
                          className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors flex items-center gap-1"
                        >
                          {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
                          {isExpanded ? 'Hide Explanation' : 'Review Answer'}
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                                <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                                  <strong className="block mb-1">સમજૂતી:</strong>
                                  {q.explanation}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setView('home')}
            className="px-8 py-3 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm uppercase tracking-widest transition-all"
          >
            <RefreshCw size={16} />
            હોમ પેજ પર જાઓ
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen py-12">
      <header className="max-w-4xl mx-auto px-6 mb-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <BookOpen size={24} />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Satsang Gyanamrut</span>
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {view === 'home' && renderHome()}
          {view === 'test' && renderTest()}
          {view === 'result' && renderResult()}
        </AnimatePresence>
      </main>
    </div>
  );
}

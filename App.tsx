import React, { useState, useEffect, useCallback, useRef } from 'react';
import { detectAndTranslate, generateResponse, GeminiError } from './services/geminiService';
import { TranslationResult, GeneratedResponse } from './types';
import { 
  ArrowPathIcon, 
  ClipboardDocumentCheckIcon, 
  ChatBubbleLeftRightIcon, 
  SparklesIcon, 
  MinusIcon, 
  ArrowsPointingOutIcon 
} from '@heroicons/react/24/outline';

declare const chrome: any;

const App: React.FC = () => {
  // --- Widget State ---
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: window.innerWidth - 380, y: window.innerHeight - 600 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  // --- App Logic State ---
  const [selectedText, setSelectedText] = useState<string>('');
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [context, setContext] = useState<string>('');
  const [generatedReply, setGeneratedReply] = useState<GeneratedResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // --- Persistence & Initialization ---
  useEffect(() => {
    // Load saved position
    const savedPos = localStorage.getItem('crm-polyglot-pos');
    if (savedPos) {
      try {
        setPosition(JSON.parse(savedPos));
      } catch (e) { console.error('Failed to parse position', e); }
    } else {
        // Default to bottom right
        setPosition({ x: window.innerWidth - 400, y: window.innerHeight - 700 });
    }
  }, []);

  // --- Draggable Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from header or bubble
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;
        
        // Basic bounds checking
        const boundedX = Math.min(Math.max(0, newX), window.innerWidth - 50);
        const boundedY = Math.min(Math.max(0, newY), window.innerHeight - 50);

        setPosition({ x: boundedX, y: boundedY });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        localStorage.setItem('crm-polyglot-pos', JSON.stringify(position));
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

  // --- Selection Listener (Direct DOM) ---
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      // Ensure we have a selection and it's NOT inside our widget
      if (selection && selection.toString().trim().length > 0) {
        if (widgetRef.current && widgetRef.current.contains(selection.anchorNode)) {
          return; // Ignore selections inside the widget
        }
        
        const text = selection.toString().trim();
        // Only update if text changed to avoid potential loops or state thrashing
        if (text !== selectedText) {
            setSelectedText(text);
            setTranslation(null);
            setGeneratedReply(null);
            setCopied(false);
            setError(null);
            
            // Auto open if minimized when new text is selected? 
            // Optional: setIsMinimized(false);
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [selectedText]);

  // --- Core App Handlers ---
  const handleTranslate = useCallback(async () => {
    if (!selectedText) return;
    setLoading(true);
    setError(null);
    try {
      const result = await detectAndTranslate(selectedText);
      setTranslation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to translate');
    } finally {
      setLoading(false);
    }
  }, [selectedText]);

  useEffect(() => {
    if (selectedText) {
      handleTranslate();
    }
  }, [selectedText, handleTranslate]);

  const handleGenerate = async () => {
    if (!translation) return;
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const result = await generateResponse(
        translation.englishTranslation,
        translation.originalLanguage,
        context
      );
      setGeneratedReply(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate response');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedReply) return;
    navigator.clipboard.writeText(generatedReply.targetLanguageReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Render ---

  // 1. Minimized Bubble View
  if (isMinimized) {
    return (
      <div
        ref={widgetRef}
        onMouseDown={handleMouseDown}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        className="fixed top-0 left-0 z-[100000] cursor-move group"
      >
        <div className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 flex items-center justify-center w-14 h-14 relative">
            <ChatBubbleLeftRightIcon className="w-8 h-8" />
            
            {/* Notification dot if there's active data */}
            {selectedText && (
                <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500" />
            )}
            
            <button 
                onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
                className="absolute -top-2 -right-2 bg-white text-blue-600 rounded-full p-1 shadow border border-blue-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
        </div>
      </div>
    );
  }

  // 2. Maximized Widget View
  return (
    <div
      ref={widgetRef}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      className="fixed top-0 left-0 z-[100000] w-[380px] h-[600px] flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden font-sans"
    >
      {/* Header (Draggable) */}
      <header 
        onMouseDown={handleMouseDown}
        className="bg-blue-600 text-white p-3 flex items-center justify-between cursor-move shrink-0"
      >
        <div className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          <h1 className="font-bold text-base">CRM Polyglot</h1>
        </div>
        <div className="flex items-center gap-1">
            <button 
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-blue-500 rounded text-blue-100 hover:text-white transition-colors"
                title="Minimize"
            >
                <MinusIcon className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50">
        {/* State: No Selection */}
        {!selectedText && (
          <div className="text-center py-8 px-4 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
            <ArrowPathIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select text on the page...</p>
            <p className="text-xs mt-1 opacity-70">The widget is listening.</p>
          </div>
        )}

        {/* State: Processing / Error */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-xs border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Incoming Message Section */}
        {selectedText && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Selected Text</span>
              {translation && (
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px]">
                  {translation.originalLanguage}
                </span>
              )}
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 shadow-sm">
              <div className="text-xs text-slate-500 italic border-l-2 border-slate-300 pl-2 line-clamp-3">
                "{selectedText}"
              </div>
              
              {loading && !translation && (
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              )}

              {translation && (
                <div className="text-slate-800 text-sm font-medium leading-relaxed">
                  {translation.englishTranslation}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Toolbar / Context */}
        {translation && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
             <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <SparklesIcon className="w-3 h-3 text-purple-600" />
              <span>AI Context</span>
            </div>
            
            <div className="relative">
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ex: Be polite, say I'll check inventory..."
                className="w-full p-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-shadow min-h-[60px]"
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag when interacting with text area
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !context.trim()}
              onMouseDown={(e) => e.stopPropagation()}
              className={`w-full py-2 px-4 rounded-lg font-medium text-sm flex justify-center items-center gap-2 transition-all ${
                loading || !context.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow hover:shadow-md active:scale-[0.98]'
              }`}
            >
              {loading && generatedReply === null ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        )}

        {/* Result Area */}
        {generatedReply && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Draft (Click to Copy)
            </div>

            <button
              onClick={handleCopy}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full group text-left relative overflow-hidden bg-white border border-purple-200 hover:border-purple-400 rounded-xl p-0 transition-all shadow-sm hover:shadow-md"
            >
              <div className="p-3">
                <p className="text-slate-800 text-sm leading-relaxed mb-2">
                  {generatedReply.englishReply}
                </p>
                <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-1 flex items-center gap-1">
                  <span className="font-semibold text-purple-600">Hidden:</span> 
                  Copies {translation?.originalLanguage} version.
                </p>
              </div>

              {/* Overlay for "Copied" state */}
              <div className={`absolute inset-0 bg-green-500/90 flex items-center justify-center transition-opacity duration-300 ${copied ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="text-white flex flex-col items-center font-medium">
                  <ClipboardDocumentCheckIcon className="w-6 h-6 mb-1" />
                  <span className="text-sm">Copied!</span>
                </div>
              </div>
            </button>
          </div>
        )}
      </main>
      
      {/* Footer / Resizer Handle could go here */}
      <div className="bg-slate-100 p-1 flex justify-center border-t border-slate-200">
        <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
      </div>
    </div>
  );
};

export default App;
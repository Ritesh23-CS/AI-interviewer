import React from 'react';
import { Mic, MicOff, Square } from 'lucide-react';

/**
 * VoiceButton — animated mic button for the voice input tab.
 *
 * Props:
 *  - isListening   : boolean
 *  - isSupported   : boolean
 *  - onStart       : () => void
 *  - onStop        : () => void
 *  - wordCount     : number
 *  - error         : string | null
 */
export default function VoiceButton({ isListening, isSupported, onStart, onStop, wordCount, error }) {
  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="w-20 h-20 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
          <MicOff className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-sm text-text-muted text-center max-w-xs">
          Voice input requires <span className="text-white font-semibold">Chrome or Edge</span>.
          Switch to the Type tab to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-4">

      {/* Mic Button */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing rings when listening */}
        {isListening && (
          <>
            <span className="absolute inline-flex w-28 h-28 rounded-full bg-red-500/20 animate-ping" />
            <span className="absolute inline-flex w-24 h-24 rounded-full bg-red-500/15 animate-ping [animation-delay:150ms]" />
          </>
        )}

        <button
          onClick={isListening ? onStop : onStart}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl
            ${isListening
              ? 'bg-red-500 hover:bg-red-600 shadow-red-500/40'
              : 'bg-primary hover:bg-purple-600 shadow-primary/40'
            }`}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
        >
          {isListening
            ? <Square className="w-7 h-7 text-white fill-white" />
            : <Mic className="w-8 h-8 text-white" />
          }
        </button>
      </div>

      {/* Status Label */}
      <div className="text-center">
        {isListening ? (
          <div className="flex items-center gap-2 text-red-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recording… click to stop
          </div>
        ) : (
          <p className="text-text-muted text-sm">
            {wordCount > 0
              ? `${wordCount} words captured — click mic to continue`
              : 'Click the mic and speak your answer'}
          </p>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-3 rounded-xl max-w-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}

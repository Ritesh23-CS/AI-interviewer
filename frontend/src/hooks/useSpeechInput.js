/**
 * useSpeechInput — Custom hook wrapping the Web Speech API.
 *
 * Provides:
 *  - isListening    : boolean
 *  - transcript     : string (live, editable)
 *  - interimText    : string (grey "in-progress" text)
 *  - isSupported    : boolean (false on Firefox)
 *  - startListening : () => void
 *  - stopListening  : () => void
 *  - resetTranscript: () => void
 *  - setTranscript  : setter (allow manual edits)
 */
import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

export function useSpeechInput() {
  const isSupported = Boolean(SpeechRecognition);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const autoStopRef = useRef(null); // 60 s silence guard

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      clearTimeout(autoStopRef.current);
    };
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimText('');
    setError(null);
  }, []);

  const stopListening = useCallback(() => {
    clearTimeout(autoStopRef.current);
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText('');
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) return;

    setError(null);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      // Reset the auto-stop timer on every new speech result
      clearTimeout(autoStopRef.current);
      autoStopRef.current = setTimeout(() => {
        recognition.stop();
      }, 60000); // auto-stop after 60 s of no speech

      let finalPart = '';
      let interimPart = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalPart += result[0].transcript;
        } else {
          interimPart += result[0].transcript;
        }
      }

      if (finalPart) {
        setTranscript(prev => (prev ? prev + ' ' + finalPart.trim() : finalPart.trim()));
      }
      setInterimText(interimPart);
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setError('Microphone access was denied. Please allow mic permissions and try again.');
      } else if (event.error === 'network') {
        setError('Network error during speech recognition. Check your connection.');
      } else if (event.error !== 'aborted') {
        setError(`Speech error: ${event.error}`);
      }
      setIsListening(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
      clearTimeout(autoStopRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();

    // Safety: auto-stop after 60 s from start
    autoStopRef.current = setTimeout(() => recognition.stop(), 60000);
  }, [isSupported, isListening]);

  return {
    isSupported,
    isListening,
    transcript,
    interimText,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { useDailyLimit } from '../hooks/useDailyLimit';
import { useSpeechInput } from '../hooks/useSpeechInput';
import { generateQuestion } from '../services/questionGenerator';
import { countWords } from '../utils/wordCounter';
import ProgressBar from './ProgressBar';
import LoadingSpinner from './LoadingSpinner';
import VoiceButton from './VoiceButton';
import { Mic, Keyboard } from 'lucide-react';

const TOTAL_QUESTIONS = 5;

export default function QuestionScreen() {
  const navigate = useNavigate();
  const { session, addAnswer } = useSession();
  const { incrementAttempts } = useDailyLimit();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [loadingState, setLoadingState] = useState('preparing');
  // 'voice' | 'text'
  const [inputMode, setInputMode] = useState('voice');
  const hasFetched = useRef(false);

  const {
    isSupported: voiceSupported,
    isListening,
    transcript,
    interimText,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useSpeechInput();

  const currentQIndex = session.qaPairs.length + 1;

  // Combined answer: typed if text mode, transcript if voice mode
  const activeAnswer = inputMode === 'voice' ? transcript : answer;
  const wordCount = activeAnswer.trim() ? activeAnswer.trim().split(/\s+/).length : 0;
  const isAnswerSufficient = wordCount >= 30;

  // When the user switches modes, stop any active recording
  const handleModeSwitch = (mode) => {
    if (isListening) stopListening();
    setInputMode(mode);
  };

  // Sync textarea with transcript when in voice mode (allows manual edits)
  useEffect(() => {
    if (inputMode === 'voice') {
      setAnswer(transcript);
    }
  }, [transcript, inputMode]);

  // Load a new question whenever the question index advances
  useEffect(() => {
    if (!session.role) {
      navigate('/');
      return;
    }
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQIndex]);

  // Timer logic
  useEffect(() => {
    let timerId;
    if (loadingState === 'answering' && timeLeft > 0) {
      timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && loadingState === 'answering') {
      handleSubmit();
    }
    return () => clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingState, timeLeft]);

  const loadQuestion = () => {
    setLoadingState('preparing');
    resetTranscript();
    setAnswer('');
    const { question } = generateQuestion({
      role: session.role,
      difficulty: session.difficulty,
      interviewType: session.interviewType,
      questionNumber: currentQIndex,
    });
    setCurrentQuestion(question);
    setLoadingState('answering');
    setTimeLeft(120);
  };

  const handleSubmit = async () => {
    if (loadingState !== 'answering') return;
    if (isListening) stopListening();

    const finalAnswer = activeAnswer.trim();

    if (!isAnswerSufficient && timeLeft > 0) {
      alert('Please provide at least 30 words before submitting.');
      return;
    }

    setLoadingState('submitting');
    incrementAttempts();

    // Store the answer with the inputMode that was used
    addAnswer(currentQuestion, finalAnswer || '(No answer provided)', inputMode);
    setAnswer('');
    resetTranscript();

    const isLastQuestion = currentQIndex >= TOTAL_QUESTIONS;

    if (isLastQuestion) {
      navigate('/report');
    } else {
      hasFetched.current = false;
      navigate('/question');
    }
  };

  const handleSkip = () => {
    if (isListening) stopListening();
    addAnswer(currentQuestion, '(Skipped)', inputMode);
    setAnswer('');
    resetTranscript();
    const isLastQuestion = currentQIndex >= TOTAL_QUESTIONS;
    if (isLastQuestion) {
      navigate('/report');
    } else {
      hasFetched.current = false;
      navigate('/question');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loadingState === 'preparing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message={`Loading question ${currentQIndex} of ${TOTAL_QUESTIONS}...`} />
      </div>
    );
  }

  if (loadingState === 'submitting') {
    const isLast = currentQIndex >= TOTAL_QUESTIONS;
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message={isLast ? 'Preparing your evaluation...' : 'Next question loading...'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center py-8">

      {/* Top Bar */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 text-text-muted font-medium">
        <div className="flex gap-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm">{session.role}</span>
          <span className="bg-gray-800 px-3 py-1 rounded-md text-sm">{session.difficulty}</span>
        </div>
        <div>Question {currentQIndex} of {TOTAL_QUESTIONS}</div>
      </div>

      <div className="w-full max-w-4xl mb-6">
        <ProgressBar current={currentQIndex} total={TOTAL_QUESTIONS} />
      </div>

      <div className="glass-card w-full max-w-4xl p-6 md:p-8 rounded-2xl flex flex-col gap-6">
        {/* Question + Timer */}
        <div className="flex justify-between items-start">
          <h2 className="text-xl md:text-2xl font-semibold leading-relaxed pr-4">
            {currentQuestion}
          </h2>
          <div className={`flex-shrink-0 px-4 py-2 rounded-lg font-mono font-bold text-lg border ${timeLeft <= 30 ? 'text-error border-error/50 bg-error/10' : 'text-primary border-primary/20 bg-primary/10'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Input Mode Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-gray-700 w-fit">
          <button
            onClick={() => handleModeSwitch('voice')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
              inputMode === 'voice'
                ? 'bg-primary text-white'
                : 'bg-transparent text-text-muted hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            Speak
          </button>
          <button
            onClick={() => handleModeSwitch('text')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
              inputMode === 'text'
                ? 'bg-primary text-white'
                : 'bg-transparent text-text-muted hover:text-white'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Type
          </button>
        </div>

        {/* Voice Mode */}
        {inputMode === 'voice' && (
          <div className="flex flex-col gap-4">
            <VoiceButton
              isListening={isListening}
              isSupported={voiceSupported}
              onStart={startListening}
              onStop={stopListening}
              wordCount={wordCount}
              error={voiceError}
            />

            {/* Live transcript area */}
            <div className="relative">
              <div
                className={`w-full glass-input min-h-40 p-4 rounded-xl text-base font-medium leading-relaxed whitespace-pre-wrap ${
                  !transcript && !interimText ? 'text-text-muted' : ''
                }`}
              >
                {transcript || interimText ? (
                  <>
                    <span>{transcript}</span>
                    {interimText && (
                      <span className="text-gray-500 italic"> {interimText}</span>
                    )}
                  </>
                ) : (
                  'Your spoken words will appear here in real time…'
                )}
              </div>
              {/* Allow the user to manually clear and re-speak */}
              {transcript && (
                <button
                  onClick={() => { resetTranscript(); setAnswer(''); }}
                  className="absolute top-3 right-3 text-xs text-text-muted hover:text-error transition-colors px-2 py-1 rounded bg-bg-main/60"
                >
                  Clear
                </button>
              )}
              <div className="absolute bottom-4 right-4 text-sm font-medium">
                <span className={wordCount < 30 ? 'text-warning' : 'text-success'}>{wordCount}</span>
                <span className="text-text-muted"> / 30 words min</span>
              </div>
            </div>

            {/* Editable fallback — lets users fix mis-transcriptions */}
            {transcript && (
              <p className="text-xs text-text-muted text-center">
                Need to fix something? Click inside the box above — transcript is editable.
              </p>
            )}
          </div>
        )}

        {/* Text Mode */}
        {inputMode === 'text' && (
          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here... be specific and use examples."
              className="w-full glass-input h-64 p-4 rounded-xl resize-none text-base font-medium focus:ring-2 focus:ring-primary/50"
            />
            <div className="absolute bottom-4 right-4 text-sm font-medium">
              <span className={wordCount < 30 ? 'text-warning' : 'text-success'}>{wordCount}</span>
              <span className="text-text-muted"> / 30 words min</span>
            </div>
          </div>
        )}

        {/* Info note */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2 text-sm text-primary/80 font-medium">
          💡 Your answers will be evaluated together after all {TOTAL_QUESTIONS} questions.
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center bg-bg-main/50 p-4 rounded-xl">
          <button
            onClick={handleSkip}
            className="text-text-muted hover:text-white px-4 py-2 font-medium transition-colors"
          >
            Skip Question
          </button>
          <div className="flex items-center gap-4">
            {wordCount < 30 && activeAnswer.length > 0 && (
              <span className="text-warning text-sm font-medium animate-pulse">
                Add more detail to submit.
              </span>
            )}
            <button
              onClick={handleSubmit}
              disabled={!isAnswerSufficient}
              className="bg-primary hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-400 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all"
            >
              {currentQIndex >= TOTAL_QUESTIONS ? 'Finish Interview' : 'Next Question →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

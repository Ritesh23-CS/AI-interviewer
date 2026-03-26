import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import FeedbackCard from './FeedbackCard';

export default function ReviewScreen() {
  const navigate = useNavigate();
  const { session } = useSession();

  useEffect(() => {
    // Redirect if no session or no completed question
    if (!session.role || session.qaPairs.length === 0) {
      navigate('/');
    }
  }, [session, navigate]);

  if (!session.role || session.qaPairs.length === 0) return null;

  // The latest answered question is at the end of the array
  const latestQA = session.qaPairs[session.qaPairs.length - 1];
  const { question, answer, evaluation } = latestQA;
  
  const currentQIndex = session.qaPairs.length;
  const TOTAL_QUESTIONS = 10;

  const handleNext = () => {
    if (currentQIndex < TOTAL_QUESTIONS) {
      navigate('/question');
    } else {
      navigate('/report');
    }
  };

  const handleEnd = () => {
    navigate('/report');
  };

  return (
    <div className="min-h-screen p-4 py-8 flex justify-center">
      <div className="max-w-4xl w-full">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            Review: Question {currentQIndex}
          </h1>
          <div className="text-sm font-medium text-text-muted">
            {session.role} • {session.difficulty}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl mb-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-2 text-text-primary">Q: {question}</h2>
          <div className="bg-bg-main/50 p-4 rounded-xl mt-4 border border-gray-800">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Your Answer</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{answer}</p>
          </div>
        </div>

        <div className="glass-card p-2 rounded-2xl mb-8 shadow-xl">
          <FeedbackCard evaluation={evaluation} />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <button 
            onClick={handleEnd}
            className="px-6 py-3 font-semibold rounded-xl text-text-muted hover:text-white hover:bg-gray-800 transition-colors"
          >
            End Interview Early
          </button>
          <button 
            onClick={handleNext}
            className="px-8 py-3 bg-primary hover:bg-purple-600 font-bold rounded-xl text-white shadow-lg shadow-primary/30 transition-all"
          >
            {currentQIndex < TOTAL_QUESTIONS ? "Next Question" : "View Final Report"}
          </button>
        </div>

      </div>
    </div>
  );
}

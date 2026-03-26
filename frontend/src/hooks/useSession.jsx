import React, { createContext, useContext, useState } from 'react';
import { resetQuestionQueue } from '../services/questionGenerator';

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [session, setSession] = useState({
    name: '',
    role: '',
    difficulty: '',
    interviewType: '',
    qaPairs: [],      // { question, answer } — no evaluation until batch
    evaluations: [],  // set after batch AI evaluation
    startTime: null,
    endTime: null,
  });

  const startSession = (config) => {
    resetQuestionQueue();
    setSession({
      ...session,
      ...config,
      qaPairs: [],
      evaluations: [],
      startTime: Date.now(),
      endTime: null,
    });
  };

  // Store just question + answer (no evaluation yet)
  const addAnswer = (question, answer) => {
    setSession(prev => ({
      ...prev,
      qaPairs: [...prev.qaPairs, { question, answer }],
    }));
  };

  // Called once after batch Gemini evaluation — merges evaluations into qaPairs
  const setBatchEvaluations = (evaluations) => {
    setSession(prev => ({
      ...prev,
      evaluations,
      // Merge evaluations into each QA pair for easy access
      qaPairs: prev.qaPairs.map((qa, i) => ({
        ...qa,
        evaluation: evaluations[i] || null,
      })),
    }));
  };

  const endSession = () => {
    setSession(prev => ({
      ...prev,
      endTime: Date.now()
    }));
  };

  return (
    <SessionContext.Provider value={{ session, startSession, addAnswer, setBatchEvaluations, endSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { evaluateAllAnswers } from '../services/answerEvaluator';
import { generateFinalReport } from '../services/reportGenerator';
import ScoreRing from './ScoreRing';
import LoadingSpinner from './LoadingSpinner';
import FeedbackCard from './FeedbackCard';
import { Download, RotateCcw, Target, Award } from 'lucide-react';

export default function FinalReport() {
  const navigate = useNavigate();
  const { session, startSession, setBatchEvaluations, endSession } = useSession();
  const [report, setReport] = useState(null);
  const [loadingStep, setLoadingStep] = useState('evaluating'); // 'evaluating' | 'reporting' | 'done'
  const [expandedQ, setExpandedQ] = useState(null); // index of expanded question card

  useEffect(() => {
    if (!session.role || session.qaPairs.length === 0) {
      navigate('/');
      return;
    }
    // If already evaluated (e.g. hot reload), skip re-evaluation
    if (session.qaPairs[0]?.evaluation) {
      setLoadingStep('done');
      return;
    }
    runBatchFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runBatchFlow = async () => {
    setLoadingStep('evaluating');

    try {
      // STEP 1: Batch evaluate all answers in one API call
      const evaluations = await evaluateAllAnswers({
        role: session.role,
        difficulty: session.difficulty,
        interviewType: session.interviewType,
        qaList: session.qaPairs,
      });

      setBatchEvaluations(evaluations);

      // STEP 2: Generate the final report
      setLoadingStep('reporting');
      const qaWithEvals = session.qaPairs.map((qa, i) => ({
        question: qa.question,
        answer: qa.answer,
        evaluation: evaluations[i],
      }));

      const data = await generateFinalReport({
        candidateName: session.name,
        role: session.role,
        difficulty: session.difficulty,
        interviewType: session.interviewType,
        duration: session.startTime ? Math.round((Date.now() - session.startTime) / 60000) : 15,
        qaHistory: qaWithEvals,
      });

      endSession();
      setReport(data);
      setLoadingStep('done');

    } catch (e) {
      console.error('Report generation error:', e);
      setLoadingStep('done');
    }
  };

  if (loadingStep === 'evaluating') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Evaluating all your answers together... (1 AI call)" />
      </div>
    );
  }

  if (loadingStep === 'reporting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Generating your personalised final report..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-muted">
        <p>Could not generate report. <button className="text-primary underline" onClick={() => navigate('/')}>Go Home</button></p>
      </div>
    );
  }

  const durationMin = session.startTime && session.endTime
    ? Math.round((session.endTime - session.startTime) / 60000)
    : 15;

  const handleStartNew = () => {
    startSession({ name: session.name, role: session.role, difficulty: session.difficulty, interviewType: session.interviewType });
    navigate('/question');
  };

  return (
    <div className="min-h-screen p-4 py-8 flex justify-center">
      <div className="max-w-4xl w-full">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 mb-2">
            Interview Complete
          </h1>
          <p className="text-text-muted text-lg">Here's your full performance report, {session.name}.</p>
        </div>

        {/* Top Dashboard Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          {/* Info Card */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-center space-y-4">
            <div>
              <p className="text-text-muted text-sm uppercase tracking-wider font-semibold">Role</p>
              <p className="text-xl font-bold">{session.role}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm uppercase tracking-wider font-semibold">Difficulty</p>
              <p className="text-xl font-bold">{session.difficulty}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm uppercase tracking-wider font-semibold">Duration</p>
              <p className="text-xl font-bold">{durationMin} min</p>
            </div>
            <div>
              <p className="text-text-muted text-sm uppercase tracking-wider font-semibold">Recommendation</p>
              <p className={`text-xl font-bold ${
                report.hiring_recommendation?.includes('Yes') ? 'text-success' :
                report.hiring_recommendation === 'Maybe' ? 'text-warning' : 'text-error'
              }`}>{report.hiring_recommendation || '—'}</p>
            </div>
          </div>

          {/* Score Ring */}
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center col-span-1 md:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Award className="w-32 h-32" />
            </div>
            <h2 className="text-xl font-bold mb-4 z-10 w-full text-left">Overall Score</h2>
            <div className="flex items-center gap-8 w-full z-10">
              <ScoreRing score={report.overall_score} max={100} size={140} strokeWidth={12} />
              <div className="flex-1">
                <p className="text-gray-300 text-sm leading-relaxed">{report.overall_summary}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown + Strengths/Improvements */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Performance Breakdown
            </h3>
            <div className="space-y-4">
              {Object.entries(report.category_scores || {}).map(([category, score]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium capitalize">{category.replace(/_/g, ' ')}</span>
                    <span className="text-text-muted">{score}/10</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${(score / 10) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-success mb-3">Top Strengths</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                {(report.top_strengths || report.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-warning mb-3">Areas to Improve</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                {(report.areas_to_improve || report.improvements || []).map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Per-Question Evaluation (collapsible) */}
        <div className="glass-card p-6 rounded-2xl mb-8">
          <h3 className="text-lg font-bold mb-4">Answer Evaluations</h3>
          <div className="space-y-3">
            {session.qaPairs.map((qa, index) => (
              <div key={index} className="border border-gray-800 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between bg-bg-main/50 p-4 text-left hover:bg-bg-main/80 transition-colors"
                  onClick={() => setExpandedQ(expandedQ === index ? null : index)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-primary font-bold text-sm">Q{index + 1}</span>
                    {/* Voice / Type badge */}
                    <span
                      title={qa.inputMode === 'voice' ? 'Voice answer' : 'Typed answer'}
                      className="text-xs px-1.5 py-0.5 rounded bg-gray-700/60 text-text-muted select-none flex-shrink-0"
                    >
                      {qa.inputMode === 'voice' ? '🎤' : '⌨️'}
                    </span>
                    <span className="text-sm line-clamp-1 pr-2">{qa.question}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {qa.evaluation && (
                      <>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          qa.evaluation.verdict?.toLowerCase().includes('good') ? 'bg-success/20 text-success' :
                          qa.evaluation.verdict?.toLowerCase().includes('needs') ? 'bg-warning/20 text-warning' :
                          'bg-error/20 text-error'
                        }`}>{qa.evaluation.verdict}</span>
                        <span className="font-bold text-primary">{qa.evaluation.score}/10</span>
                      </>
                    )}
                    <span className="text-text-muted text-sm">{expandedQ === index ? '▲' : '▼'}</span>
                  </div>
                </button>
                {expandedQ === index && qa.evaluation && (
                  <div className="px-2 pb-2 bg-bg-main/30">
                    <FeedbackCard evaluation={qa.evaluation} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <button
            onClick={() => alert('PDF export coming soon!')}
            className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-text-muted hover:text-white hover:bg-gray-800 transition-colors w-full md:w-auto justify-center"
          >
            <Download className="w-5 h-5" /> Download PDF
          </button>
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={() => navigate('/')} className="flex-1 md:flex-none px-6 py-3 font-semibold rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-white">
              Home
            </button>
            <button onClick={handleStartNew} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-8 py-3 bg-primary hover:bg-purple-600 font-bold rounded-xl text-white shadow-lg shadow-primary/30 transition-all">
              <RotateCcw className="w-5 h-5" /> Start New
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

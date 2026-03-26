import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export default function FeedbackCard({ evaluation }) {
  const { verdict, score, strengths, weaknesses, better_answer, keywords_missed, fillers } = evaluation;

  return (
    <div className="bg-bg-main p-6 rounded-xl border border-gray-800 shadow-inner">
      <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            AI Evaluation
            {verdict.toLowerCase().includes('good') || verdict.toLowerCase().includes('excellent') ? (
              <span className="bg-success/20 text-success text-sm py-1 px-3 rounded-full flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> {verdict}
              </span>
            ) : verdict.toLowerCase().includes('needs') ? (
              <span className="bg-warning/20 text-warning text-sm py-1 px-3 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {verdict}
              </span>
            ) : (
              <span className="bg-error/20 text-error text-sm py-1 px-3 rounded-full flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {verdict}
              </span>
            )}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-primary">{score}<span className="text-xl text-text-muted">/10</span></div>
          <div className="text-sm font-medium text-text-muted uppercase tracking-wider">Score</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-4 rounded-lg bg-success/5 border-success/10">
          <h4 className="font-semibold text-success flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5" /> What you did well
          </h4>
          <ul className="list-disc pl-5 space-y-2 text-sm text-text-primary/90">
            {strengths?.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        
        <div className="glass-card p-4 rounded-lg bg-warning/5 border-warning/10">
          <h4 className="font-semibold text-warning flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" /> Areas to improve
          </h4>
          <ul className="list-disc pl-5 space-y-2 text-sm text-text-primary/90">
            {weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-text-primary mb-2">💡 Suggested Better Answer</h4>
        <div className="bg-gray-800/50 p-4 rounded-lg text-sm leading-relaxed border border-gray-700/50">
          {better_answer}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-start">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wide">Keywords You Missed</h4>
          <div className="flex flex-wrap gap-2">
            {keywords_missed?.map((kw, i) => (
              <span key={i} className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-md border border-gray-700">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {fillers?.count > 0 && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-3 w-full md:w-auto">
            <div className="text-error font-medium text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{fillers.count} filler word(s) detected</span>
            </div>
            <div className="text-xs text-error/70 mt-1">
              {fillers.wordsDetected.map(f => `${f.word} (${f.occurrences})`).join(', ')}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

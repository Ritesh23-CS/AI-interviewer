import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { useDailyLimit } from '../hooks/useDailyLimit';
import { useSession } from '../hooks/useSession';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { attempts, maxAttempts, hasReachedLimit } = useDailyLimit();
  const { startSession } = useSession();

  const [formData, setFormData] = useState({
    name: '',
    role: 'Software Engineer',
    difficulty: 'Intermediate',
    interviewType: 'Mixed'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (hasReachedLimit) return;
    
    // Validate
    if (!formData.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    startSession(formData);
    navigate('/question');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className={`glass-card p-8 rounded-2xl max-w-lg w-full z-10 ${hasReachedLimit ? 'blur-sm' : ''}`}>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 border border-primary/50">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            InterviewAI
          </h1>
          <p className="text-text-muted mt-2 tracking-wide text-sm font-medium uppercase">
            Practice. Improve. Get Hired.
          </p>
        </div>

        <form onSubmit={handleStart} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Your Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              className="glass-input w-full p-3 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Role</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              className="glass-input w-full p-3 rounded-xl appearance-none"
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Business Analyst">Business Analyst</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Difficulty</label>
              <select 
                name="difficulty" 
                value={formData.difficulty} 
                onChange={handleChange}
                className="glass-input w-full p-3 rounded-xl appearance-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Type</label>
              <select 
                name="interviewType" 
                value={formData.interviewType} 
                onChange={handleChange}
                className="glass-input w-full p-3 rounded-xl appearance-none"
              >
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral</option>
                <option value="HR">HR</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={hasReachedLimit}
            className="w-full bg-primary hover:bg-purple-600 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors duration-200 mt-6 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Interview
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium">
          <span className={`${hasReachedLimit ? 'text-error' : 'text-text-muted'}`}>
            {attempts}/{maxAttempts} free attempts used today
          </span>
        </div>
      </div>

      {hasReachedLimit && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg-main/40 backdrop-blur-md">
          <div className="glass-card p-8 rounded-xl max-w-sm text-center border-error/30 shadow-error/10 border">
            <h2 className="text-2xl font-bold text-error mb-2">Daily Limit Reached</h2>
            <p className="text-text-primary mb-6">
              You've used all {maxAttempts} of your free questions for today. Upgrade to continue practicing or come back tomorrow!
            </p>
            <button className="bg-primary px-6 py-2.5 rounded-lg font-medium text-white shadow-lg w-full">
              Upgrade to Pro (Mock)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import QuestionScreen from './components/QuestionScreen';
import ReviewScreen from './components/ReviewScreen';
import FinalReport from './components/FinalReport';
import { SessionProvider } from './hooks/useSession';

function App() {
  return (
    <SessionProvider>
      <Router>
        <div className="min-h-screen bg-bg-main text-text-primary text-base font-inter pb-10">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/question" element={<QuestionScreen />} />
            <Route path="/review" element={<ReviewScreen />} />
            <Route path="/report" element={<FinalReport />} />
          </Routes>
        </div>
      </Router>
    </SessionProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import AIEngine from './components/AIEngine';
// 1. අපේ අලුත් Marketplace Component එක Import කරගන්නවා
import Marketplace from './components/Marketplace/Marketplace';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ai-engine" element={<AIEngine />} />
        
        {/* 2. මෙන්න අපේ Marketplace එකට යන අලුත් පාර */}
        <Route path="/marketplace" element={<Marketplace />} />
      </Routes>
    </Router>
  );
}

export default App;
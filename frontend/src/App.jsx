import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import AIEngine from './components/AIEngine';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* මෙන්න අලුත් AI Engine Page එකට යන පාර */}
        <Route path="/ai-engine" element={<AIEngine />} />
      </Routes>
    </Router>
  );
}

export default App;
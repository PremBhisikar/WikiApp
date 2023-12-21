// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './Components/LandingPage';
import WikiPage from './Components/WikiPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/wiki/:title" element={<WikiPage />} />
      </Routes>
    </Router>
  );
};

export default App;

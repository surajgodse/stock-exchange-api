import React from 'react';
import StockTracker from './components/StockTracker';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="App">
      <StockTracker />
      <Footer />
    </div>
  );
}

export default App;
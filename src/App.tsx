import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen';
import { ListScreen } from './screens/ListScreen';
import { ShopScreen } from './screens/ShopScreen';
import { TeachScreen } from './screens/TeachScreen';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/list" element={<ListScreen />} />
        <Route path="/shop" element={<ShopScreen />} />
        <Route path="/teach" element={<TeachScreen />} />
      </Routes>
    </Router>
  );
};

export default App
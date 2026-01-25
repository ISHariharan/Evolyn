import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Components/Home/Home';
import NavBar from './Components/NavBar/NavBar';
import Header from './Components/Header/Header';
import Explore from './Components/Explore/Explore';
import Stride from "./Pages/Stride/Stride";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stride" element={<ProtectedRoute><Stride /></ProtectedRoute>} />
          <Route path="/explore" element={<Explore />} />
        </Routes>
        <Header/>
        <NavBar/>
      </BrowserRouter>
    </div>
  );
}

export default App;

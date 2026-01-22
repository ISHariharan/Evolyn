import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Components/Home/Home';
import NavBar from './Components/NavBar/NavBar';
import Header from './Components/Header/Header';
import Explore from './Components/Explore/Explore';
import SuccessToastMessage from "./Common/SuccessToastMessage/SuccessToastMessage";
import ErrorToastMessage from "./Common/ErrorToastMessage/ErrorToastMessage";
import InfoToastMessage from "./Common/InfoToastMessage/InfoToastMessage";
import WarningToastMessage from "./Common/WarningToastMessage/WarningToastMessage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/success" element={<SuccessToastMessage />} />
          <Route path="/error" element={<ErrorToastMessage/>} />
          <Route path="/info" element={<InfoToastMessage/>} />
          <Route path="/warning" element={<WarningToastMessage />} />
        </Routes>
        <Header/>
        <NavBar/>
      </BrowserRouter>
    </div>
  );
}

export default App;

import './App.css';
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Components/Home/Home';
import NavBar from './Components/NavBar/NavBar';
import Header from './Components/Header/Header';
import Explore from './Components/Explore/Explore';
import Stride from "./Pages/Stride/Stride";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import { getAllWorkspaces } from "./API/StrideWorkspace/Retrieve/index";
import { useStore } from './Store/GlobalStore/GlobalStore';

function App() {
  const {state, dispatch} = useStore();
  
  const getAllWorkspace = async (userId) => {
    try{
      const AllWorkspaces = await getAllWorkspaces(userId);
      dispatch({type : 'SET_WORKSPACE', payload: AllWorkspaces})
    } catch(err) {
      console.log('Get all errors. : ', err);
    }
  }
  
  
  useEffect(() => {
    if (!state.authenticated) return;
    const uid = state.userDetails?.id;
    if (uid) {
      getAllWorkspace(uid);
    }
  }, [state.authenticated, state.userDetails.id]);
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

import './App.css';
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home/Home';
import NavBar from './Components/NavBar/NavBar';
import Header from './Components/Header/Header';
import Explore from './Components/Explore/Explore';
import Stride from "./Pages/Stride/Stride";
import StrideDashBoard from "./Pages/StrideDashBoard/StrideDashBoard";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import { getAllWorkspaces } from "./API/StrideWorkspace/Retrieve/index";
import { useStore } from './Store/GlobalStore/GlobalStore';
import ApplicationLoader from './Common/ApplicationLoader/ApplicationLoader';
import {mountLoader} from "./Common/ApplicationLoader/loaderMount";

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

  useEffect(() => {
    mountLoader();
  }, []);
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stride" element={<ProtectedRoute><Stride /></ProtectedRoute>} />
          <Route path="/stride/dashboard" element={<ProtectedRoute><StrideDashBoard /></ProtectedRoute>} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/loader" element={<ApplicationLoader />} />
        </Routes>
        <Header/>
        <NavBar/>
      </BrowserRouter>
    </div>
  );
}

export default App;

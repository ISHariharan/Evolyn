import './App.css';
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home/Home';
import NavBar from './Components/NavBar/NavBar';
import Header from './Components/Header/Header';
import Explore from './Components/Explore/Explore';
import Stride from "./Pages/Stride/Stride";
import StrideDashBoard from "./Pages/StrideDashBoard/StrideDashBoard";
import TransactionsList from "./Pages/Expenses/Transactions/TransactionsList";
import TransactionForm from "./Pages/Expenses/Transactions/TransactionForm";
import TransactionDetails from "./Pages/Expenses/Transactions/TransactionDetails";
import Accounts from "./Pages/Expenses/Accounts/Accounts";
import ExpensesDashboard from "./Pages/Expenses/Dashboard/ExpensesDashboard";
import Categories from "./Pages/Expenses/Categories/Categories";
import TribeOverview from "./Pages/Tribe/Overview/TribeOverview";
import LogActivity from "./Pages/Tribe/Activities/LogActivity";
import WeightPrompt from "./Pages/Tribe/Weight/WeightPrompt";
import ProfileIdPrompt from "./Components/ProfileId/ProfileIdPrompt";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import { getAllWorkspaces } from "./API/StrideWorkspace/Retrieve/index";
import { useStore } from './Store/GlobalStore/GlobalStore';
import ApplicationLoader from './Common/ApplicationLoader/ApplicationLoader';
import {mountLoader} from "./Common/ApplicationLoader/loaderMount";
import { LOGGED_OUT_EVENT } from "./API/auth";

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

  // The API rejected the login token (expired or invalid): log out
  useEffect(() => {
    const loggedOut = () => {
      dispatch({ type: "SET_AUTHENTICATED", payload: false });
      dispatch({ type: "SET_USERDETAILS", payload: { email: "", id: "" } });
    };
    window.addEventListener(LOGGED_OUT_EVENT, loggedOut);
    return () => window.removeEventListener(LOGGED_OUT_EVENT, loggedOut);
  }, [dispatch]);
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stride" element={<ProtectedRoute><Stride /></ProtectedRoute>} />
          <Route path="/stride/dashboard" element={<StrideDashBoard />} />
          <Route path="/expenses" element={<ProtectedRoute><ExpensesDashboard /></ProtectedRoute>} />
          <Route path="/expenses/transactions" element={<ProtectedRoute><TransactionsList /></ProtectedRoute>} />
          <Route path="/expenses/transactions/new" element={<ProtectedRoute><TransactionForm /></ProtectedRoute>} />
          <Route path="/expenses/transactions/:transactionId" element={<ProtectedRoute><TransactionDetails /></ProtectedRoute>} />
          <Route path="/expenses/transactions/:transactionId/edit" element={<ProtectedRoute><TransactionForm key="edit" /></ProtectedRoute>} />
          <Route path="/expenses/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
          <Route path="/expenses/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/tribe" element={<ProtectedRoute><TribeOverview /></ProtectedRoute>} />
          <Route path="/tribe/activities/new" element={<ProtectedRoute><LogActivity /></ProtectedRoute>} />
          <Route path="/tribe/activities/:activityId/edit" element={<ProtectedRoute><LogActivity key="edit" /></ProtectedRoute>} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/loader" element={<ApplicationLoader />} />
        </Routes>
        <Header/>
        <NavBar/>
        <ProfileIdPrompt/>
        <WeightPrompt/>
      </BrowserRouter>
    </div>
  );
}

export default App;

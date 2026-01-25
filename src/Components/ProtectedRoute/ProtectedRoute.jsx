import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useStore } from "../../Store/GlobalStore/GlobalStore";

const ProtectedRoute = ({ children }) => {
  const { state } = useStore();
  const location = useLocation();
  console.log("Location : ", location);

  if (state?.authenticated) {
    return children;
  }

  return <Navigate to="/" replace state={{ from: location }} />;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// This component checks if the user is logged in.
// If yes, it renders the child routes (Outlet).
// If no, it redirects to the /login page.
function ProtectedRoute({ user, children }) {
  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the children (which will be the Layout + specific page via Outlet)
  return children ? children : <Outlet />; 
}

export default ProtectedRoute;

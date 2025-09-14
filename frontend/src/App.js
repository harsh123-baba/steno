import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthContext from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TestList from './pages/TestList';
import TestDetail from './pages/TestDetail';
import TestResults from './pages/TestResults';
import ResultsOverview from './pages/ResultsOverview';
import AdminUpload from './pages/AdminUpload';
import AdminAssign from './pages/AdminAssign';
import AdminUsers from './pages/AdminUsers';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user && user.isAdmin ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/tests"
            element={
              <PrivateRoute>
                <TestList />
              </PrivateRoute>
            }
          />
          <Route
            path="/tests/:id"
            element={
              <PrivateRoute>
                <TestDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/tests/:id/results"
            element={
              <PrivateRoute>
                <TestResults />
              </PrivateRoute>
            }
          />
          <Route
            path="/results"
            element={
              <PrivateRoute>
                <ResultsOverview />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/upload"
            element={
              <AdminRoute>
                <AdminUpload />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/assign"
            element={
              <AdminRoute>
                <AdminAssign />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

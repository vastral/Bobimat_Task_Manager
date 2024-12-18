import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTask from './pages/CreateTask';
import SearchTask from './pages/SearchTask';
import TaskDetail from './pages/TaskDetail';
import EditTask from './pages/EditTask';
import UserManagement from './pages/UserManagement';
import Logs from './pages/Logs';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/task/new" element={<CreateTask />} />
            <Route path="/task/search" element={<SearchTask />} />
            <Route path="/task/:id" element={<TaskDetail />} />
            <Route path="/task/:id/edit" element={<EditTask />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/logs" element={<Logs />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

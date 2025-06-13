import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ProtectedRoute, PublicRoute } from './components/shared/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DesignSystemPage from './pages/design/DesignSystemPage';
import NotFoundPage from './pages/NotFoundPage';
import { Notifications } from './components/shared/Notifications';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Notifications />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="design" element={<DesignSystemPage />} />
            
            {/* Add more protected routes here as your app grows */}
          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

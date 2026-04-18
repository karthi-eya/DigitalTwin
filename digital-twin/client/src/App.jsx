import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

const LandingPage = lazy(() => import('./pages/auth/LandingPage'));
const AuthPage = lazy(() => import('./pages/auth/AuthPage'));
const ProfileSetup = lazy(() => import('./pages/patient/ProfileSetup'));
const Dashboard = lazy(() => import('./pages/patient/Dashboard'));
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));

const Loading = () => (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="relative"><div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full" /><div className="absolute inset-0 w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>
            <p className="text-gray-500 text-lg font-light tracking-wide">Loading...</p>
        </div>
    </div>
);

const Guard = ({ children, role }) => {
    const { isAuthenticated, user, profile, loading } = useAuth();
    if (loading) return <Loading />;
    if (!isAuthenticated) return <Navigate to="/auth" replace />;
    if (role && user?.role !== role) return <Navigate to="/auth" replace />;
    return children;
};

const SetupGuard = ({ children }) => {
    const { isAuthenticated, user, profile, loading } = useAuth();
    if (loading) return <Loading />;
    if (!isAuthenticated) return <Navigate to="/auth" replace />;
    if (profile?.isSetup) return <Navigate to={`/${user.role}/dashboard`} replace />;
    return children;
};

const DashGuard = ({ children }) => {
    const { isAuthenticated, user, profile, loading } = useAuth();
    if (loading) return <Loading />;
    if (!isAuthenticated) return <Navigate to="/auth" replace />;
    if (!profile?.isSetup) return <Navigate to={`/${user.role}/setup`} replace />;
    return children;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/patient/setup" element={<SetupGuard><ProfileSetup /></SetupGuard>} />
            <Route path="/doctor/setup" element={<SetupGuard><ProfileSetup /></SetupGuard>} />
            <Route path="/patient/dashboard" element={<DashGuard><Dashboard /></DashGuard>} />
            <Route path="/doctor/dashboard" element={<DashGuard><DoctorDashboard /></DashGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" toastOptions={{
                    duration: 4000,
                    style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '14px' },
                    success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
                }} />
                <Suspense fallback={<Loading />}>
                    <AppRoutes />
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;

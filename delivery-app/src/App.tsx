// delivery-app/src/App.tsx
// Main application component. Handles authentication state, JWT management,
// fetches current user, and controls top-level routing/layout.

import  { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './layouts/DashboardLayout';
import DeliveryPage from './pages/DeliveryPage';
import RiderPage from './pages/RiderPage';
import PlanPage from './pages/PlanPage';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCurrentUser } from './api'; // Import getCurrentUser
import { type UserResponse } from './interfaces'; // Import UserResponse type

// Main App Component
function App() {
    const [authToken, setAuthToken] = useState<string | null>(null); // Stores the JWT
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null); // Stores authenticated user data
    const [activeTab, setActiveTab] = useState<'deliveries' | 'riders' | 'plan'>('deliveries');
    const [message, setMessage] = useState<string>('');
    const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');
    const [isMessageDialogOpen, setIsMessageDialogOpen] = useState<boolean>(false);
    const [appLoading, setAppLoading] = useState<boolean>(true); // New state for initial app load

    // Load token from localStorage on initial app load
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setAuthToken(storedToken);
            // Attempt to fetch current user to validate token and populate user data
            fetchCurrentUser(storedToken);
        } else {
            setAppLoading(false); // No token, no user, app is ready
        }
    }, []);

    // Fetch current user whenever authToken changes (after login/logout/initial load)
    // This validates the token against the backend.
    const fetchCurrentUser = async (token: string) => {
        try {
            setAppLoading(true); // Indicate loading while fetching user
            const user = await getCurrentUser(token);
            setCurrentUser(user);
            setAuthToken(token); // Ensure token is set if validation is successful
            localStorage.setItem('authToken', token); // Persist valid token
            showMessage(`Welcome, ${user.email}!`, 'success');
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Failed to fetch current user or token invalid:', err);
            // If token is invalid or user not found, clear token and log out
            handleLogout();
            showMessage(`Session expired or invalid: ${err.message}. Please log in again.`, 'error');
        } finally {
            setAppLoading(false); // App is ready after user fetch attempt
        }
    };

    const showMessage = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
        setMessage(msg);
        setMessageType(type);
        setIsMessageDialogOpen(true);
        setTimeout(() => setIsMessageDialogOpen(false), 5000); // Close dialog after 5 seconds
    };

    const handleAuthSuccess = (token: string) => {
        // When login/register is successful, fetch the user with the new token
        fetchCurrentUser(token);
    };

    const handleLogout = () => {
        setAuthToken(null);
        setCurrentUser(null);
        localStorage.removeItem('authToken'); // Clear token from storage
        setActiveTab('deliveries'); // Reset to default tab on logout
        showMessage('Logged out successfully.', 'info');
    };

    // Show a loading spinner or message while app is initializing (checking auth)
    if (appLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                <p className="ml-4 text-lg text-gray-700">Loading application...</p>
            </div>
        );
    }

    return (
        <>
            {/* Global Message Dialog */}
            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                <DialogContent className={`w-full max-w-sm rounded-lg ${messageType === 'error' ? 'bg-red-100 border-red-500' : 'bg-blue-100 border-blue-500'} text-${messageType === 'error' ? 'red' : 'blue'}-700`}>
                    <DialogHeader>
                        <DialogTitle className={`text-lg font-semibold text-${messageType === 'error' ? 'red' : 'blue'}-800`}>
                            {messageType === 'error' ? 'Error' : (messageType === 'success' ? 'Success' : 'Info')}
                        </DialogTitle>
                        <DialogDescription className={`text-${messageType === 'error' ? 'red' : 'blue'}-600`}>
                            {message}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* Main Application Content */}
            <div className="font-sans antialiased">
                {/* Tailwind CSS config for Inter font and rounded corners, injected for Canvas preview */}
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
            }
          `}
                </style>

                {authToken && currentUser ? ( // Only show dashboard if authenticated AND user data is loaded
                    <DashboardLayout
                        onTabChange={setActiveTab}
                        activeTab={activeTab}
                        onLogout={handleLogout}
                        currentUserEmail={currentUser.email} // Pass user email to layout
                    >
                        {activeTab === 'deliveries' && <DeliveryPage showMessage={showMessage} authToken={authToken} />}
                        {activeTab === 'riders' && <RiderPage showMessage={showMessage} authToken={authToken} />}
                        {activeTab === 'plan' && <PlanPage showMessage={showMessage} authToken={authToken} />}
                    </DashboardLayout>
                ) : (
                    <AuthPage onAuthSuccess={handleAuthSuccess} showMessage={showMessage} />
                )}
            </div>
        </>
    );
}

export default App;

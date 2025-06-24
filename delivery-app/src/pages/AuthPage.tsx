// delivery-app/src/pages/AuthPage.tsx
// Handles user login and registration with backend integration.

import  { useState,type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { loginUser, registerUser } from '../api'; // Import new API functions

interface AuthPageProps {
    onAuthSuccess: (token: string) => void; // Now passes the token
    showMessage: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

const AuthPage= ({ onAuthSuccess, showMessage }:AuthPageProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        showMessage(''); // Clear previous messages

        try {
            if (isLogin) {
                const tokenData = await loginUser({ email, password });
                showMessage('Login successful!', 'success');
                onAuthSuccess(tokenData.access_token); // Pass the token up
            } else {
                const userData = await registerUser({ email, password });
                showMessage(`Registration successful for ${userData.email}! Please login.`, 'success');
                setIsLogin(true); // Switch to login tab after successful registration
            }
        } catch (error: unknown) {
            const err=error as Error;
            console.error(`Error during ${isLogin ? 'login' : 'registration'}:`, err);
            showMessage(`Error: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-sm rounded-lg shadow-xl">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-800">{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
                    <CardDescription className="text-gray-600">
                        {isLogin ? 'Enter your credentials to access the dashboard.' : 'Create an account to get started.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-gray-700">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="rounded-md border border-gray-300 focus-visible:ring-blue-500"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-gray-700">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="password123"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="rounded-md border border-gray-300 focus-visible:ring-blue-500"
                            />
                        </div>
                        <Button type="submit" className="w-full rounded-md" disabled={loading}>
                            {loading ? (isLogin ? 'Logging In...' : 'Signing Up...') : (isLogin ? 'Login' : 'Sign Up')}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-gray-600">
                        {isLogin ? (
                            <>
                                Don't have an account?{' '}
                                <Button variant="link" onClick={() => setIsLogin(false)} className="px-0 py-0 h-auto text-blue-600 hover:text-blue-700">
                                    Sign up
                                </Button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <Button variant="link" onClick={() => setIsLogin(true)} className="px-0 py-0 h-auto text-blue-600 hover:text-blue-700">
                                    Login
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthPage;

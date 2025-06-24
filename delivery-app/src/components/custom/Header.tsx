// delivery-app/src/components/custom/Header.tsx
// Simple header component for the dashboard, now displaying user email.

import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react'; // Logout and User icons

interface HeaderProps {
    children?: React.ReactNode; // For mobile hamburger menu trigger
    onLogout: () => void;
    currentUserEmail: string; // New prop to display
}

const Header = ({ children, onLogout, currentUserEmail }:HeaderProps) => {
    return (
        <header className="flex items-center justify-between p-4 bg-white shadow-md rounded-b-lg">
            <div className="flex items-center space-x-2">
                {children} {/* This is where the mobile menu trigger will go */}
                <span className="text-xl font-bold text-gray-800">Delivery AI Dashboard</span>
            </div>
            <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2 text-gray-700">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{currentUserEmail}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onLogout} className="text-gray-700">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
};

export default Header;

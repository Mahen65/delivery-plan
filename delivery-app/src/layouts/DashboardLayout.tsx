// delivery-app/src/layouts/DashboardLayout.tsx
// This component provides the main dashboard layout, including sidebar and header.

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react'; // For the hamburger icon
import Sidebar from '@/components/custom/Sidebar';
import Header from '@/components/custom/Header';

interface DashboardLayoutProps {
    children: React.ReactNode;
    onTabChange: (tab: 'deliveries' | 'riders' | 'plan') => void;
    activeTab: 'deliveries' | 'riders' | 'plan';
    onLogout: () => void;
    currentUserEmail: string; // New prop for displaying user email
}

const DashboardLayout = ({ children, onTabChange, activeTab, onLogout, currentUserEmail }:DashboardLayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleTabClick = (tab: 'deliveries' | 'riders' | 'plan') => {
        onTabChange(tab);
        setIsMobileMenuOpen(false); // Close mobile menu on item click
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 bg-gray-800 text-white flex-col rounded-r-lg shadow-lg">
                <Sidebar activeTab={activeTab} onTabChange={handleTabClick} onLogout={onLogout} currentUserEmail={currentUserEmail} />
            </div>

            {/* Mobile Header and Sidebar */}
            <div className="md:hidden w-full">
                <Header onLogout={onLogout} currentUserEmail={currentUserEmail}>
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-800">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0 rounded-r-lg bg-gray-800 text-white">
                            <Sidebar activeTab={activeTab} onTabChange={handleTabClick} onLogout={onLogout} currentUserEmail={currentUserEmail} />
                        </SheetContent>
                    </Sheet>
                </Header>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Desktop Header */}
                <div className="hidden md:block">
                    <Header onLogout={onLogout} currentUserEmail={currentUserEmail} />
                </div>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

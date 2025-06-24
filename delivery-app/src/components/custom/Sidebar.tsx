// delivery-app/src/components/custom/Sidebar.tsx
// Reusable sidebar component for navigation, now displaying user email.

import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, Truck, Compass, LogOut, User } from 'lucide-react'; // Icons from lucide-react
import { cn } from '@/lib/utils'; // cn helper for combining tailwind classes

type Tab = 'deliveries' | 'riders' | 'plan';

interface SidebarProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    onLogout: () => void;
    currentUserEmail: string; // <-- CRITICAL: This prop was missing in your provided code
}

const navItems: { name: string; icon: React.ElementType; tab: Tab }[] = [
    { name: 'Deliveries', icon: Package, tab: 'deliveries' },
    { name: 'Riders', icon: Truck, tab: 'riders' },
    { name: 'AI Plan', icon: Compass, tab: 'plan' },
];

const Sidebar= ({ activeTab, onTabChange, onLogout, currentUserEmail }:SidebarProps) => { // <-- CRITICAL: Destructure currentUserEmail here
    return (
        <nav className="flex flex-col h-full p-4 bg-gray-800"> {/* Changed from gray-900 for consistency with previous */}
            <div className="text-2xl font-bold text-white mb-8 text-center">Delivery AI</div>

            {/* User Info in Sidebar for Desktop */}
            <div className="mb-6 px-2 py-3 bg-gray-700 rounded-md flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-300" />
                <span className="text-gray-200 text-sm font-medium truncate">{currentUserEmail}</span> {/* <-- CRITICAL: Display currentUserEmail */}
            </div>

            <ul className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <li key={item.tab}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start text-lg px-4 py-3",
                                activeTab === item.tab
                                    ? "bg-blue-700 text-white shadow-lg hover:bg-blue-800"
                                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            )}
                            onClick={() => onTabChange(item.tab)}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.name}
                        </Button>
                    </li>
                ))}
            </ul>
            <div className="mt-auto pt-4 border-t border-gray-700">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-lg px-4 py-3 text-red-300 hover:bg-red-800 hover:text-white"
                    onClick={onLogout}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </Button>
            </div>
        </nav>
    );
};

export default Sidebar;

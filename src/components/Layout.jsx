// src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom'; 
import {
  List, 
  Sparkles, 
  Settings, 
  Mail, // Added Mail icon for Contact Me
  LogOut, 
  Menu, 
  X, 
} from 'lucide-react'; 

function Layout({ user, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define navigation items for reusability
  const navItems = [
    { to: '/', icon: List, label: 'My Tasks' }, // Changed path to root for HomePage
    { to: '/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const activeClassName = "bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary font-bold";
  const inactiveClassName = "text-[#111618] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-medium";

  // Sidebar content component
  const SidebarContent = () => (
    <>
      {/* User/App Info */}
      <div className="flex gap-3 items-center mb-4">
        {/* Placeholder for logo/avatar */}
        <div className="bg-gray-300 dark:bg-gray-700 rounded-full size-10 shrink-0"></div>
        <div className="flex flex-col">
          <h1 className="text-[#111618] dark:text-white text-base font-medium leading-normal">iTask</h1>
          {/* Show username */}
          <p className="text-[#617c89] dark:text-gray-400 text-sm font-normal leading-normal truncate">
             {user ? `Hi, ${user.username}` : 'Welcome!'}
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            // Apply active styles using NavLink's isActive prop
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm leading-normal ${
                isActive ? activeClassName : inactiveClassName
              }`
            }
            onClick={() => setIsMobileMenuOpen(false)} // Close menu on mobile nav click
          >
            <item.icon className={`h-5 w-5 ${ 'text-primary' || 'text-inherit' }`} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Links */}
      <div className="flex flex-col gap-1 mt-auto pt-4"> {/* Added mt-auto here */}
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm leading-normal ${
              isActive ? activeClassName : inactiveClassName
            }`
          }
          onClick={() => setIsMobileMenuOpen(false)} // Close menu on mobile nav click
        >
          <Mail className="h-5 w-5" />
          <span className="truncate">Contact Me</span>
        </NavLink>
        <button
          onClick={() => {
            onLogout();
            setIsMobileMenuOpen(false); // Close menu on logout
          }}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm leading-normal w-full text-left ${inactiveClassName}`}
        >
          <LogOut className="h-5 w-5" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </>
  );


  return (
    <div className="relative flex h-auto min-h-screen w-full bg-background-light dark:bg-background-dark font-display text-[#111618] dark:text-white">
       {/* Static Sidebar for Medium screens and up */}
       <aside className="hidden md:flex w-64 flex-col gap-4 p-4 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shrink-0 h-screen sticky top-0">
         <SidebarContent />
       </aside>

       {/* Mobile Menu Button */}
       <button
         className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
         onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
         aria-label="Toggle menu"
       >
         {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
       </button>

      {/* Mobile Sidebar (Slide-in/Overlay) */}
       <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col`}
       >
         <SidebarContent />
       </div>
       {/* Overlay for Mobile Menu */}
        {isMobileMenuOpen && (
            <div
                className="fixed inset-0 z-30 bg-black/30 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>
        )}

       {/* Main Content Area */}
       {/* Use pl-0 md:pl-64 structure if sidebar is fixed, or simple flex-1 if it pushes content */}
       <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          {/* Outlet renders the specific page (HomePage, AiAssistantPage, etc.) */}
          {/* Added padding to prevent content from hiding behind potential fixed header/sidebar */}
           <div className="grow p-4 sm:p-6 lg:p-8 mt-16 md:mt-0"> {/* Add margin-top for mobile header */}
             <Outlet />
           </div>
       </main>
    </div>
  );
}

export default Layout;
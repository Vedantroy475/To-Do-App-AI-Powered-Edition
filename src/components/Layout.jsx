// src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  List,
  Sparkles,
  Settings,
  Mail,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

function Layout({ user, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', icon: List, label: 'My Tasks' },
    { to: '/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const activeClassName =
    'bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary font-bold';
  const inactiveClassName =
    'text-[#111618] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-medium';

  const SidebarContent = () => (
    <>
      {/* Ensure top padding so internal close button doesn't overlap */}
      <div className="relative pt-3">
        {/* Internal close button shown only on mobile and when menu is open */}
        {/* It is positioned inside the sidebar so it won't overlap the left edge or text */}
        <button
          className="md:hidden absolute right-0 top-0 -mt-1 -mr-1 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm z-50"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* User/App Info */}
        <div className="flex gap-3 items-center mb-4 pl-1 pr-8">
          {/* small left padding to keep text off the very edge */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-[#111618] dark:text-white text-base md:text-lg font-medium leading-none">
              iTask
            </h1>
            {/* Show username - make sure truncation works on tiny widths */}
            <p className="text-[#617c89] dark:text-gray-400 text-sm md:text-sm font-normal leading-tight truncate max-w-[11rem]">
              {user ? `Hi, ${user.username}` : 'Welcome!'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm leading-normal ${
                isActive ? activeClassName : inactiveClassName
              }`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <item.icon className="h-5 w-5 text-primary" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Links */}
      <div className="flex flex-col gap-1 mt-auto pt-4">
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm leading-normal ${
              isActive ? activeClassName : inactiveClassName
            }`
          }
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Mail className="h-5 w-5" />
          <span className="truncate">Contact Me</span>
        </NavLink>
        <button
          onClick={() => {
            onLogout();
            setIsMobileMenuOpen(false);
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

      {/* Mobile Menu Button - only visible when menu is closed */}
      <button
        className={`md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md transition-opacity ${
          isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open menu"
        title="Open menu"
      >
        <Menu className="h-6 w-6" />
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
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <div className="grow p-4 sm:p-6 lg:p-8 mt-16 md:mt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;

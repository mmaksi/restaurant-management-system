'use client';

import { useState, useEffect } from 'react';
import { LogoutButton } from '@/components/logout-button';

const Header = () => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Only access current date in the browser
    setCurrentDate(
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Restaurant Management System
            </h1>
            <p className="text-slate-600 mt-1">Welcome back, Manager</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-slate-600">Current Week</p>
              <p className="text-lg font-semibold text-slate-900">
                {currentDate}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

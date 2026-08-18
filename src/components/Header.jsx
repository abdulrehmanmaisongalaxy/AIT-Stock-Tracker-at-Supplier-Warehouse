import React from 'react';

export default function Header({ user }) {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200">
      <div className="text-lg font-semibold text-gray-800">
        Portal Overview
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
          Branch: {user.branch}
        </span>
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
          {user.name.charAt(0)}
        </div>
      </div>
    </header>
  );
}

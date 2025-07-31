'use client';

import { Bell, User } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex items-center">
        {title && (
          <h1 className="text-lg md:text-xl font-semibold text-gray-900 truncate">{title}</h1>
        )}
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <Bell className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white">
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
'use client';
import { AuthProvider } from './context/authContext';
import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 text-gray-800">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
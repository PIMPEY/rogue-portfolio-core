'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StartPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Simple MVP after 2 seconds
    const timer = setTimeout(() => {
      router.push('/simple-mvp');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Project Rogue</h1>
        <p className="text-gray-600">Redirecting to Simple MVP...</p>
        <p className="text-sm text-gray-500 mt-4">
          <a href="/simple-mvp" className="text-blue-600 hover:underline">
            Click here if not redirected
          </a>
        </p>
      </div>
    </div>
  );
}

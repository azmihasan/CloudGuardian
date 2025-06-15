'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import LogoutButton from '@/components/auth/LogoutButton';
import { VulnerabilityReport } from '@/lib/security-analysis';
import Navbar from '@/components/layout/Navbar';

export default function SecurityPage() {
  const [reports, setReports] = useState<VulnerabilityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch('/api/vulnerability-reports');
        if (!response.ok) {
          throw new Error('Failed to fetch vulnerability reports');
        }
        const data = await response.json();
        setReports(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Error Loading Security Data</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <LogoutButton />
        </div>

        <SecurityDashboard reports={reports} />
      </main>
    </div>
  );
} 
"use client";

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useRouter } from 'next/navigation';

export default function AddRepositoryPage() {
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleAddRepository = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/add-repository', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repositoryUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add repository');
      } else {
        setSuccess(data.message || 'Repository added successfully!');
        setRepositoryUrl(''); // Clear input after success
        // Optionally, redirect to the homepage or project list after a delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding repository:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <h1 className="text-2xl font-bold mb-6">Add New Repository</h1>
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <div className="mb-4">
            <label htmlFor="repositoryUrl" className="block text-sm font-medium text-gray-300 mb-2">
              GitHub Repository URL
            </label>
            <input
              type="text"
              id="repositoryUrl"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md py-2 px-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., https://github.com/open-telemetry/opentelemetry-demo.git"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            onClick={handleAddRepository}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Repository'}
          </button>

          {error && <p className="text-red-500 mt-4">Error: {error}</p>}
          {success && <p className="text-green-500 mt-4">{success}</p>}
        </div>
      </main>
    </div>
  );
} 
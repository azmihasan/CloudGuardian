"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Project } from '@/types';

export default function ProjectOverviewPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/repositories/${id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch project: ${response.statusText}`);
          }
          const data: Project = await response.json();
          setProject(data);
        } catch (err) {
          console.error('Error fetching project:', err);
          setError('Could not load project details.');
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [id]);

  const handleRunSecurityAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysisResult(null);
    try {
      // This is a placeholder for your actual security measurement script endpoint
      const response = await fetch(`/api/analyze-project/${id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to run analysis: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisResult(data.message || 'Security analysis completed.');
      // Optionally, update project data after analysis if it affects the overview
    } catch (err) {
      console.error('Error running security analysis:', err);
      setAnalysisResult('Failed to run security analysis.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <p>Loading project...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <p className="text-red-500">Error: {error}</p>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <p>Project not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Project: {project.name}</h1>
          <button
            onClick={handleRunSecurityAnalysis}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={analysisLoading}
          >
            {analysisLoading ? 'Analyzing...' : 'Run Security Analysis'}
          </button>
        </div>

        {analysisResult && (
          <p className={`mt-4 ${analysisResult.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {analysisResult}
          </p>
        )}

        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <p className="text-gray-300 mb-2">Owner: {project.owner}</p>
          <p className="text-gray-300 mb-2">Repository URL: <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{project.repoUrl}</a></p>
          <p className="text-gray-300 mb-2">Last Updated: {project.lastUpdated}</p>
          {/* Add more project details here as needed */}

          <h2 className="text-xl font-semibold mt-6 mb-4">Vulnerabilities (Summary)</h2>
          {project.securityRecommendations.length > 0 ? (
            <ul className="list-disc list-inside text-gray-300">
              {/* This will need more detailed rendering based on actual vulnerability data */}
              <li>Critical: {project.securityRecommendations.filter(rec => rec.id.startsWith("sec-critical")).length}</li>
              <li>High: {project.securityRecommendations.filter(rec => rec.id.startsWith("sec-high")).length}</li>
              <li>Medium: {project.securityRecommendations.filter(rec => rec.id.startsWith("sec-medium")).length}</li>
              <li>Low: {project.securityRecommendations.filter(rec => rec.id.startsWith("sec-low")).length}</li>
              <li>Unknown: {project.securityRecommendations.filter(rec => rec.id.startsWith("sec-unknown")).length}</li>
            </ul>
          ) : (
            <p className="text-gray-400">No security recommendations available yet.</p>
          )}
        </div>
      </main>
    </div>
  );
} 
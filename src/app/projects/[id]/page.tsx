'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Project } from '@/types/project';

export default function ProjectOverview() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (params.id === 'new') {
      setLoading(false);
      return; // Do not attempt to fetch a project if the ID is 'new'
    }

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  const handleSecurityScan = async () => {
    setScanning(true);
    try {
      const response = await fetch(`/api/projects/${params.id}/scan`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to start security scan');
      }
      // Refresh project data after scan
      const { project: updatedProjectData } = await response.json();
      setProject(updatedProjectData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="p-8 pt-24">Loading project details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="p-8 pt-24">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="p-8 pt-24">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="p-8 pt-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <Button
            onClick={handleSecurityScan}
            disabled={scanning}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {scanning ? 'Scanning...' : 'Run Security Analysis'}
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Path:</strong> {project.path}</p>
                <p><strong>Last Scan:</strong> {project.lastScan ? new Date(project.lastScan).toLocaleString() : 'Never'}</p>
              </div>
            </CardContent>
          </Card>

          {project.vulnerabilities && (
            <Card>
              <CardHeader>
                <CardTitle>Security Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-red-100 rounded-lg">
                    <p className="text-red-800 font-bold">{project.vulnerabilities.critical}</p>
                    <p className="text-sm">Critical</p>
                  </div>
                  <div className="p-4 bg-orange-100 rounded-lg">
                    <p className="text-orange-800 font-bold">{project.vulnerabilities.high}</p>
                    <p className="text-sm">High</p>
                  </div>
                  <div className="p-4 bg-yellow-100 rounded-lg">
                    <p className="text-yellow-800 font-bold">{project.vulnerabilities.medium}</p>
                    <p className="text-sm">Medium</p>
                  </div>
                  <div className="p-4 bg-blue-100 rounded-lg">
                    <p className="text-blue-800 font-bold">{project.vulnerabilities.low}</p>
                    <p className="text-sm">Low</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 
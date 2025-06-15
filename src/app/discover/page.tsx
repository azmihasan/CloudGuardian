'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Project, KubernetesDeployment } from '@/types/project';
import { toast } from 'react-hot-toast';

interface DockerImage {
  ID: string;
  Repository: string;
  Tag: string;
  Size: string;
}

export default function DiscoverPage() {
  const [dockerImages, setDockerImages] = useState<DockerImage[]>([]);
  const [kubernetesDeployments, setKubernetesDeployments] = useState<KubernetesDeployment[]>([]);
  const [existingProjects, setExistingProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'docker' | 'kubernetes'>('docker');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Docker images
        const imagesResponse = await fetch('/api/docker/images');
        if (!imagesResponse.ok) {
          throw new Error(`HTTP error! status: ${imagesResponse.status} (Docker Images)`);
        }
        const imageData = await imagesResponse.json();
        setDockerImages(imageData.images);

        // Fetch Kubernetes deployments
        const kubernetesResponse = await fetch('/api/kubernetes/projects');
        if (!kubernetesResponse.ok) {
          throw new Error(`HTTP error! status: ${kubernetesResponse.status} (Kubernetes Deployments)`);
        }
        const kubernetesData = await kubernetesResponse.json();
        // Extract relevant deployment info, assuming `items` field in the response
        const parsedDeployments: KubernetesDeployment[] = kubernetesData.deployments.items.map((item: any) => ({
          name: item.metadata.name,
          namespace: item.metadata.namespace,
          readyReplicas: item.status.readyReplicas || 0,
          totalReplicas: item.spec.replicas || 0,
          containers: item.spec.template.spec.containers.map((container: any) => ({
            name: container.name,
            image: container.image,
          })),
        }));
        setKubernetesDeployments(parsedDeployments);

        // Fetch existing projects
        const projectsResponse = await fetch('/api/projects');
        if (!projectsResponse.ok) {
          throw new Error(`HTTP error! status: ${projectsResponse.status} (Projects)`);
        }
        const projectData = await projectsResponse.json();
        setExistingProjects(projectData);

      } catch (err: any) {
        setError(err.message);
        toast.error(`Failed to fetch data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddProject = async (data: DockerImage | KubernetesDeployment, type: 'docker' | 'kubernetes') => {
    try {
      let repoUrl: string;
      let projectName: string;

      if (type === 'docker') {
        const image = data as DockerImage;
        repoUrl = `docker-image://${image.Repository}:${image.Tag}`;
        projectName = image.Repository;
      } else {
        const deployment = data as KubernetesDeployment;
        repoUrl = `kubernetes-deployment://${deployment.namespace}/${deployment.name}`;
        projectName = `${deployment.name}-${deployment.namespace}`;
      }

      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl,
          name: projectName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add project');
      }

      const { message, project: newProject }: { message: string, project: Project } = await response.json();
      toast.success(message || `Project '${newProject.name}' added successfully!`);
      // Refresh the list of projects after adding a new one
      setExistingProjects(prev => [...prev, newProject]);
    } catch (err: any) {
      toast.error(`Error adding project: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8">Loading data...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-8 pt-24">
      <h1 className="text-3xl font-bold mb-6">Discover Projects</h1>

      <div className="mb-6 flex space-x-4">
        <Button
          onClick={() => setActiveTab('docker')}
          variant={activeTab === 'docker' ? 'default' : 'outline'}
        >
          Docker Images
        </Button>
        <Button
          onClick={() => setActiveTab('kubernetes')}
          variant={activeTab === 'kubernetes' ? 'default' : 'outline'}
        >
          Kubernetes Deployments
        </Button>
      </div>

      {activeTab === 'docker' && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Discovered Docker Images</h2>
          {dockerImages.length === 0 ? (
            <p>No Docker images found on this machine.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dockerImages.map((image) => {
                const isAdded = existingProjects.some(project => project.name === image.Repository);
                return (
                  <Card key={image.ID}>
                    <CardHeader>
                      <CardTitle>{image.Repository}:{image.Tag}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p><strong>ID:</strong> {image.ID.substring(0, 12)}</p>
                      <p><strong>Size:</strong> {image.Size}</p>
                      {isAdded ? (
                        <p className="text-green-500 mt-4">Already Added as Project</p>
                      ) : (
                        <Button className="mt-4" onClick={() => handleAddProject(image, 'docker')}>
                          Add as Project
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'kubernetes' && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Discovered Kubernetes Deployments</h2>
          {kubernetesDeployments.length === 0 ? (
            <p>No Kubernetes deployments found. Make sure kubectl is configured and connected to a cluster.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kubernetesDeployments.map((deployment) => {
                const projectName = `${deployment.name}-${deployment.namespace}`;
                const isAdded = existingProjects.some(project => project.name === projectName);
                return (
                  <Card key={`${deployment.namespace}-${deployment.name}`}>
                    <CardHeader>
                      <CardTitle>{deployment.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p><strong>Namespace:</strong> {deployment.namespace}</p>
                      <p><strong>Replicas:</strong> {deployment.readyReplicas}/{deployment.totalReplicas}</p>
                      <p><strong>Images:</strong></p>
                      <ul className="list-disc list-inside ml-4">
                        {deployment.containers.map((container, index) => (
                          <li key={index}>{container.image}</li>
                        ))}
                      </ul>
                      {isAdded ? (
                        <p className="text-green-500 mt-4">Already Added as Project</p>
                      ) : (
                        <Button className="mt-4" onClick={() => handleAddProject(deployment, 'kubernetes')}>
                          Add as Project
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
} 
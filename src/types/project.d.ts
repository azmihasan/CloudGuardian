export interface ProjectMetadata {
  lastScan?: string;
  vulnerabilities?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  updatedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  type: 'git' | 'docker' | 'kubernetes';
  lastScan?: string;
  vulnerabilities?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KubernetesDeployment {
  name: string;
  namespace: string;
  readyReplicas: number;
  totalReplicas: number;
  containers: {
    name: string;
    image: string;
  }[];
} 
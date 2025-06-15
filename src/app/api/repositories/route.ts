import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { exec } from 'child_process';
import { promisify } from 'util';
import { Project } from "@/types/project";

const execAsync = promisify(exec);

const PROJECTS_FILE = path.join(process.cwd(), 'data', 'projects.json');

async function readProjectsFile(): Promise<Project[]> {
  try {
    const fileContent = await fs.readFile(PROJECTS_FILE, 'utf-8');
    if (fileContent.trim() === '') {
      // If file is empty, initialize with an empty array
      await fs.writeFile(PROJECTS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      // If file does not exist or is corrupted, initialize with an empty array
      await fs.writeFile(PROJECTS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    console.error('Error reading projects file:', error);
    throw new Error('Failed to read projects data');
  }
}

async function writeProjectsFile(projects: Project[]): Promise<void> {
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

export async function GET() {
  try {
    const projects = await readProjectsFile();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error listing repositories:", error);
    return NextResponse.json({ error: "Failed to list repositories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { repoUrl, name } = await request.json();

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
    }

    let projects = await readProjectsFile();

    let newProject: Project;
    // Ensure projectId is URL-safe by replacing problematic characters
    const baseId = name || repoUrl.split('/').pop()?.replace('.git', '') || `project-${Date.now()}`;
    const projectId = baseId.replace(/[^a-zA-Z0-9-]/g, '-').replace(/[:/]/g, '-').toLowerCase();

    // Check if project already exists
    if (projects.some(p => p.id === projectId)) {
      return NextResponse.json({ error: 'Project with this name or URL already exists' }, { status: 409 });
    }

    if (repoUrl.startsWith('kubernetes-deployment://')) {
      // Handle Kubernetes deployment
      const parts = repoUrl.replace('kubernetes-deployment://', '').split('/');
      const namespace = parts[0];
      const deploymentName = parts.slice(1).join('/');

      if (!namespace || !deploymentName) {
        return NextResponse.json({ error: 'Invalid Kubernetes deployment URL format' }, { status: 400 });
      }

      newProject = {
        id: projectId,
        name: name || deploymentName, // Use provided name or deployment name
        path: repoUrl, // Store the Kubernetes URL as path
        type: 'kubernetes',
        createdAt: new Date(),
        updatedAt: new Date(),
        vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
      };

    } else if (repoUrl.startsWith('docker-image://')) {
      // Handle Docker image
      const parts = repoUrl.replace('docker-image://', '').split(':');
      const repository = parts[0];
      const tag = parts[1] || 'latest';

      if (!repository) {
        return NextResponse.json({ error: 'Invalid Docker image URL format' }, { status: 400 });
      }

      newProject = {
        id: projectId,
        name: name || repository, // Use provided name or repository name
        path: repoUrl, // Store the Docker URL as path
        type: 'docker',
        createdAt: new Date(),
        updatedAt: new Date(),
        vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
      };

    } else {
      // Handle Git repository (existing logic)
      const projectsDir = path.join(process.cwd(), 'projects');
      await fs.mkdir(projectsDir, { recursive: true });

      const projectPath = path.join(projectsDir, projectId);

      try {
        await fs.access(projectPath);
        // If it exists, it means the project already exists locally as a Git repo.
        return NextResponse.json({ error: 'Git repository already cloned locally' }, { status: 409 });
      } catch (e) {
        // Expected if the directory does not exist, proceed to clone
      }

      console.log(`Cloning ${repoUrl} into ${projectPath}`);
      const { stdout, stderr } = await execAsync(`git clone ${repoUrl} ${projectPath}`);
      console.log(`stdout: ${stdout}`);
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        throw new Error(`Git clone failed: ${stderr}`);
      }

      newProject = {
        id: projectId,
        name: name || projectId, // Use provided name or derived project ID
        path: projectPath,
        type: 'git',
        createdAt: new Date(),
        updatedAt: new Date(),
        vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
      };
    }

    projects.push(newProject);
    await writeProjectsFile(projects);

    return NextResponse.json({
      message: `Project '${newProject.name}' added successfully!`,
      project: newProject,
    });

  } catch (error: any) {
    console.error('Error adding project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add project' },
      { status: 500 }
    );
  }
} 
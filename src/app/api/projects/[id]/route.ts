import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Project } from '@/types/project';

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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: projectId } = await params;

  if (projectId === 'new') {
    // This is a special case for the add new repository page, skip fetching
    return NextResponse.json({});
  }

  try {
    const projects = await readProjectsFile();
    const project = projects.find(p => p.id === projectId);

    if (!project) {
      console.warn(`Project with ID '${projectId}' not found.`);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);

  } catch (error) {
    console.error(`Error fetching project with ID ${projectId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch project details' },
      { status: 500 }
    );
  }
} 
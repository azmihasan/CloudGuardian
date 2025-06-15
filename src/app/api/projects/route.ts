import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Project } from '@/types/project'; // Import Project interface

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

export async function GET() {
  try {
    const projects = await readProjectsFile();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error listing projects:', error);
    return NextResponse.json(
      { error: 'Failed to list projects due to internal error' },
      { status: 500 }
    );
  }
} 
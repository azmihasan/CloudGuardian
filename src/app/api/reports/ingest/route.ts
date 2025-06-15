import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ProjectMetadata {
  lastScan?: string;
  vulnerabilities?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export async function POST(request: Request) {
  try {
    const { projectId, report: vulnerabilityReport } = await request.json();

    if (!projectId || !vulnerabilityReport) {
      return NextResponse.json(
        { error: 'Missing projectId or report in request body' },
        { status: 400 }
      );
    }

    const projectsDir = path.join(process.cwd(), 'projects');
    const projectPath = path.join(projectsDir, projectId);

    // Check if project exists
    try {
      await fs.access(projectPath);
    } catch {
      // Optionally create the project if it doesn't exist, or return an error
      return NextResponse.json(
        { error: `Project with ID '${projectId}' not found` },
        { status: 404 }
      );
    }

    // Create .cloudguardian directory if it doesn't exist
    const cloudguardianDir = path.join(projectPath, '.cloudguardian');
    await fs.mkdir(cloudguardianDir, { recursive: true });

    const reportFilePath = path.join(cloudguardianDir, 'ci_report.json');
    await fs.writeFile(reportFilePath, JSON.stringify(vulnerabilityReport, null, 2));
    console.log(`CI report saved to: ${reportFilePath}`);

    let vulnerabilities = { critical: 0, high: 0, medium: 0, low: 0 };
    try {
      const pythonScriptPath = path.join(process.cwd(), 'measurements.py');
      const pythonExecutable = path.join(process.cwd(), 'venv', 'bin', 'python3');
      const command = `'${pythonExecutable}' ${pythonScriptPath} --report_file ${reportFilePath}`;
      console.log(`Executing Python script with CI report: ${command}`);

      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        console.error(`Python script stderr: ${stderr}`);
      }

      console.log(`Python script stdout: ${stdout}`);
      const parsedResults = JSON.parse(stdout);
      
      if (parsedResults.error) {
        console.error('Error from measurements.py:', parsedResults.error);
      } else {
        vulnerabilities = parsedResults;
      }
    } catch (pythonErr) {
      console.error('Error running measurements.py:', pythonErr);
      vulnerabilities = { critical: 0, high: 0, medium: 0, low: 0 };
    } finally {
      // Clean up the temporary report file
      try {
        await fs.unlink(reportFilePath);
        console.log(`CI report file deleted: ${reportFilePath}`);
      } catch (cleanupErr) {
        console.error(`Error deleting CI report file ${reportFilePath}:`, cleanupErr);
      }
    }

    // Update metadata
    const metadata: ProjectMetadata = {
      lastScan: new Date().toISOString(),
      vulnerabilities,
    };

    // Save metadata
    const metadataPath = path.join(cloudguardianDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({
      message: 'Vulnerability report ingested successfully',
      project: {
        id: projectId,
        lastScan: metadata.lastScan,
        vulnerabilities: metadata.vulnerabilities,
      },
    });
  } catch (error) {
    console.error('Top-level error ingesting report:', error);
    return NextResponse.json(
      { error: 'Failed to ingest vulnerability report due to internal error' },
      { status: 500 }
    );
  }
} 
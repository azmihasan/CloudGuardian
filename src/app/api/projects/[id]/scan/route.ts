import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Project } from '@/types/project';

const execAsync = promisify(exec);

const PROJECTS_FILE = path.join(process.cwd(), 'data', 'projects.json');
const MEASUREMENTS_SCRIPT = path.join(process.cwd(), 'measurements.py');
const PYTHON_EXECUTABLE = path.join(process.cwd(), 'venv', 'bin', 'python3');

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

async function runMeasurementsScript(reportFilePath: string): Promise<any> {
  try {
    const command = `'${PYTHON_EXECUTABLE}' ${MEASUREMENTS_SCRIPT} --report_file ${reportFilePath}`;
    console.log(`Executing Python script: ${command}`);
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.warn(`Python script stderr: ${stderr}`);
    }

    console.log(`Python script stdout: ${stdout}`);
    const parsedResults = JSON.parse(stdout);

    if (parsedResults.error) {
      console.error('Error from measurements.py:', parsedResults.error);
      throw new Error(parsedResults.error);
    }
    return parsedResults;
  } catch (error) {
    console.error('Error running measurements.py:', error);
    throw error;
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: projectId } = await params;
    let projects = await readProjectsFile();
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projects[projectIndex];
    let vulnerabilities = { critical: 0, high: 0, medium: 0, low: 0 };
    const tempReportFile = path.join(process.cwd(), 'temp_trivy_report.json');

    try {
      if (project.type === 'git') {
        // Existing Git repository scan logic
        const projectPath = project.path;
        const trivyCommand = `trivy fs --format json --output ${tempReportFile} ${projectPath}`;
        console.log(`Executing Trivy fs scan for Git project: ${trivyCommand}`);
        const { stdout: trivyStdout, stderr: trivyStderr } = await execAsync(trivyCommand);
        if (trivyStderr) console.warn(`Trivy stderr: ${trivyStderr}`);
        console.log(`Trivy stdout: ${trivyStdout}`);

        vulnerabilities = await runMeasurementsScript(tempReportFile);

      } else if (project.type === 'docker') {
        // Docker image scan logic
        const dockerImage = project.path.replace('docker-image://', '');
        const trivyCommand = `trivy image --format json --output ${tempReportFile} ${dockerImage}`;
        console.log(`Executing Trivy image scan for Docker project: ${trivyCommand}`);
        const { stdout: trivyStdout, stderr: trivyStderr } = await execAsync(trivyCommand);
        if (trivyStderr) console.warn(`Trivy stderr: ${trivyStderr}`);
        console.log(`Trivy stdout: ${trivyStdout}`);

        vulnerabilities = await runMeasurementsScript(tempReportFile);

      } else if (project.type === 'kubernetes') {
        // Kubernetes deployment scan logic
        const parts = project.path.replace('kubernetes-deployment://', '').split('/');
        const namespace = parts[0];
        const deploymentName = parts.slice(1).join('/');

        if (!namespace || !deploymentName) {
          throw new Error('Invalid Kubernetes project path');
        }

        // Get images from running pods in the deployment
        const kubectlCommand = `kubectl get pods -n ${namespace} -l app=${deploymentName} -o json`;
        console.log(`Executing kubectl command: ${kubectlCommand}`);
        const { stdout: kubectlStdout, stderr: kubectlStderr } = await execAsync(kubectlCommand);
        if (kubectlStderr) console.warn(`Kubectl stderr: ${kubectlStderr}`);
        const podData = JSON.parse(kubectlStdout);

        const imagesToScan: string[] = [];
        podData.items.forEach((pod: any) => {
          pod.spec.containers.forEach((container: any) => {
            if (!imagesToScan.includes(container.image)) {
              imagesToScan.push(container.image);
            }
          });
        });

        console.log(`Found images to scan for Kubernetes deployment: ${imagesToScan.join(', ')}`);

        let critical = 0, high = 0, medium = 0, low = 0;

        for (const image of imagesToScan) {
          const imageReportFile = path.join(process.cwd(), `temp_trivy_report_${image.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
          const trivyImageCommand = `trivy image --format json --output ${imageReportFile} ${image}`;
          console.log(`Executing Trivy image scan for Kubernetes image: ${trivyImageCommand}`);
          const { stdout: imageStdout, stderr: imageStderr } = await execAsync(trivyImageCommand);
          if (imageStderr) console.warn(`Trivy stderr for image ${image}: ${imageStderr}`);
          console.log(`Trivy stdout for image ${image}: ${imageStdout}`);

          const imageVulnerabilities = await runMeasurementsScript(imageReportFile);
          critical += imageVulnerabilities.critical;
          high += imageVulnerabilities.high;
          medium += imageVulnerabilities.medium;
          low += imageVulnerabilities.low;

          try {
            await fs.unlink(imageReportFile);
            console.log(`Temporary image report file deleted: ${imageReportFile}`);
          } catch (cleanupErr: any) {
            console.error(`Error deleting temporary image report file ${imageReportFile}:`, cleanupErr);
          }
        }

        vulnerabilities = { critical, high, medium, low };

      } else {
        return NextResponse.json({ error: 'Unsupported project type' }, { status: 400 });
      }

      // Update project metadata
      projects[projectIndex].lastScan = new Date().toISOString();
      projects[projectIndex].vulnerabilities = vulnerabilities;
      await writeProjectsFile(projects);

      return NextResponse.json({
        message: 'Security scan completed successfully',
        project: projects[projectIndex],
      });
    } finally {
      // Clean up the main temporary report file for Git/Docker scans
      try {
        await fs.unlink(tempReportFile);
        console.log(`Main temporary report file deleted: ${tempReportFile}`);
      } catch (cleanupErr: any) {
        if (cleanupErr.code !== 'ENOENT') { // Ignore if file already doesn't exist
          console.error(`Error deleting main temporary report file ${tempReportFile}:`, cleanupErr);
        }
      }
    }

  } catch (error: any) {
    console.error('Error scanning project:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scan project' },
      { status: 500 }
    );
  }
} 
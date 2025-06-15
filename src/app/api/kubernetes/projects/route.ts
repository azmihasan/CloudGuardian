import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Execute 'kubectl get deployments -A -o json' to list deployments across all namespaces
    const { stdout, stderr } = await execAsync('kubectl get deployments -A -o json');

    if (stderr) {
      console.warn(`Kubectl stderr: ${stderr}`);
      // Depending on the nature of stderr, you might want to return an error here.
    }

    const deployments = JSON.parse(stdout);

    // You might want to filter or transform this data to a more project-friendly format
    // For now, we return the raw deployments structure
    return NextResponse.json({ deployments });
  } catch (error) {
    console.error('Error listing Kubernetes deployments:', error);
    return NextResponse.json(
      { error: 'Failed to list Kubernetes deployments. Is kubectl configured and cluster accessible?' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Execute 'docker images' command to list local Docker images in JSON format
    const { stdout, stderr } = await execAsync('docker images --format json');

    if (stderr) {
      console.warn(`Docker images stderr: ${stderr}`);
      // Depending on the nature of stderr, you might want to return an error here.
    }

    // Docker outputs each image as a separate JSON object on a new line.
    // We need to parse each line and then collect them into an array.
    const imageLines = stdout.trim().split('\n');
    const images = imageLines.map(line => JSON.parse(line));

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error listing Docker images:', error);
    return NextResponse.json(
      { error: 'Failed to list Docker images' },
      { status: 500 }
    );
  }
} 
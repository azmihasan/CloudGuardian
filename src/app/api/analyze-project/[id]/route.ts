import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

export async function POST(request: Request) {
  const { pathname } = new URL(request.url);
  const projectId = pathname.split('/').pop(); // Extract project ID from URL

  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  try {
    console.log(`Starting security analysis for project: ${projectId}`);

    // Construct the path to measurements.py. Assumes it's at the project root.
    const scriptPath = path.join(process.cwd(), 'measurements.py');

    // Execute the Python script. You might need to pass the project ID or repo path to the script.
    // For now, we'll just run it. You may need to adjust the command if your measurements.py
    // requires arguments or needs to be run with a specific python environment.
    return new Promise((resolve, reject) => {
      exec(`python3 ${scriptPath} --project-id ${projectId}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return reject(NextResponse.json({ error: `Failed to run analysis: ${stderr || error.message}` }, { status: 500 }));
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`); // stderr can contain warnings or non-fatal info
        resolve(NextResponse.json({ message: `Security analysis completed for ${projectId}. Output: ${stdout.substring(0, 100)}...` }));
      });
    });
  } catch (error) {
    console.error("Error in analyze-project API:", error);
    return NextResponse.json({ error: "Internal server error during analysis" }, { status: 500 });
  }
} 
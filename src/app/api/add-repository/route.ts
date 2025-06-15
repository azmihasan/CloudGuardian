import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    const { repositoryUrl } = await request.json();

    if (!repositoryUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    // Validate repository URL format (basic check)
    if (!repositoryUrl.startsWith("https://github.com/") && !repositoryUrl.startsWith("git@github.com:")) {
      return NextResponse.json({ error: "Invalid GitHub repository URL format" }, { status: 400 });
    }

    console.log(`Attempting to clone: ${repositoryUrl}`);

    const repoName = repositoryUrl.split('/').pop()?.replace('.git', '') || 'unknown-repo';
    const targetDir = path.join(process.cwd(), 'repositories');
    const repoPath = path.join(targetDir, repoName);

    // Create repositories directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Check if the repository already exists
    if (fs.existsSync(repoPath)) {
      return NextResponse.json({ message: `Repository ${repoName} already exists.` });
    }

    return new Promise((resolve, reject) => {
      exec(`git clone ${repositoryUrl} ${repoPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject(new Error(`Failed to clone repository: ${stderr || error.message}`));
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        resolve(NextResponse.json({ message: `Repository ${repoName} cloned successfully!` }));
      });
    });
  } catch (error) {
    console.error("Error adding repository:", error);
    return NextResponse.json({ error: "Failed to add repository" }, { status: 500 });
  }
} 
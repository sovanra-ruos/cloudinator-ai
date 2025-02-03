// src/app/api/create-repo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import { promises as fs } from "fs";

const execCommand = (command: string, cwd: string) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }



    const projectPath = path.join(process.cwd(), "tmp", projectId);

    // Ensure the project directory exists
    await fs.access(projectPath);

    console.log("Creating Git repository for project:", projectId);

    // https://git.cloudinator.cloud/argocd/chnage-version.git

    // Initialize Git repository and push to GitLab
    await execCommand("git init --initial-branch=main ", projectPath);
    await execCommand("git add .", projectPath);
    await execCommand(`git commit -m "Initial commit"`, projectPath);
    await execCommand(`git remote add origin https://git.cloudinator.cloud/argocd/${projectId}.git`, projectPath);
    await execCommand("git push -u origin main", projectPath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating repo:", error);
    return NextResponse.json({ error: "Failed to create repo" }, { status: 500 });
  }
}
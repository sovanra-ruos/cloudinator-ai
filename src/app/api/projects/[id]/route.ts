// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTempProject } from "@/utils/tempFiles";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectFiles = await getTempProject(params.id);
    
    // Return files in the expected format
    return NextResponse.json({
      files: projectFiles.map(file => ({
        name: file.filename,
        path: file.filename,
        content: file.content
      }))
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Project not found or invalid" },
      { status: 404 }
    );
  }
}
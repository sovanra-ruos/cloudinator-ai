import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const { path: filePath, content } = await request.json()

    // Create the full path
    const fullPath = path.join(process.cwd(), "generated", filePath)

    // Ensure the directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true })

    // Write the file
    await fs.writeFile(fullPath, content)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving file:", error)
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 })
  }
}


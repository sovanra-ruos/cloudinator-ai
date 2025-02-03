import { NextResponse } from "next/server"
import { simpleGit } from "simple-git"
import { promises as fs } from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const { files } = await request.json()
    const git = simpleGit()

    // Create directories and write files
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(process.cwd(), "generated", filePath)
      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, content)
    }

    // Git operations
    await git.add(".")
    await git.commit("Add generated files")
    await git.push("origin", "main")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error pushing to Git:", error)
    return NextResponse.json({ error: "Failed to push to Git" }, { status: 500 })
  }
}


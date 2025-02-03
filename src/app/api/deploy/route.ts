import { NextResponse } from "next/server"
import * as fs from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const { files } = await request.json()

    // Create public and src directories
    await fs.mkdir(path.join(process.cwd(), "public"), { recursive: true })
    await fs.mkdir(path.join(process.cwd(), "src"), { recursive: true })

    // Write files to appropriate directories
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = filePath.startsWith("public/")
        ? path.join(process.cwd(), filePath)
        : path.join(process.cwd(), "src", filePath)

      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, content as string)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deploying files:", error)
    return NextResponse.json({ error: "Failed to deploy files" }, { status: 500 })
  }
}


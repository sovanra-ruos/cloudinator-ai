import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const result = await model.generateContent(`
      Based on this description, generate a complete file structure with code:
      ${prompt}
      
      Respond with a JSON object where each key is a file path and each value is the complete code for that file.
      The response should be in the following format:
      {
        "files": {
          "filename1.tsx": "content1",
          "filename2.css": "content2"
        }
      }
      
      Ensure that the content is properly escaped for JSON.
    `)

    const response = result.response
    const text = response.text()

    try {
      // Try to parse the entire response as JSON first
      const parsedResponse = JSON.parse(text)
      return NextResponse.json(parsedResponse)
    } catch (e) {
      // If that fails, try to extract JSON from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("Could not extract valid JSON from response")
      }
      const parsedResponse = JSON.parse(jsonMatch[0])
      return NextResponse.json(parsedResponse)
    }

  } catch (error) {
    console.error("Error in generate route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate code" },
      { status: 500 }
    )
  }
}

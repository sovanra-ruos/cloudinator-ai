import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

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

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format")
    }

    let parsedResponse
    try {
      parsedResponse = JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error("Error parsing JSON:", error)
      throw new Error("Invalid JSON in response")
    }

    // Validate response structure
    if (!parsedResponse.files || typeof parsedResponse.files !== "object") {
      throw new Error("Invalid response structure")
    }

    // Ensure all file contents are strings
    for (const [key, value] of Object.entries(parsedResponse.files)) {
      if (typeof value !== "string") {
        parsedResponse.files[key] = JSON.stringify(value)
      }
    }

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error("Error in generate route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate code" },
      { status: 500 },
    )
  }
}


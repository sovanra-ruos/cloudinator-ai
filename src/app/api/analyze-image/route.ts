import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    // Convert image to base64
    const buffer = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(buffer).toString('base64')
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision" })

    const prompt = "Extract and analyze any code from this image. Return the result as a JSON object with file paths and content. Format the response as: { \"files\": { \"filename\": \"content\" } }"

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image
        }
      }
    ])

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
    console.error("Error in analyze route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze image" },
      { status: 500 }
    )
  }
}

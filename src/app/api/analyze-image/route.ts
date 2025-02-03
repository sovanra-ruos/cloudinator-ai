// app/api/analyze-image/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { saveTempFiles, type GeneratedFile } from "@/utils/tempFiles";

const initializeGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function POST(request: Request) {
  try {
    const genAI = initializeGeminiAI();
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const userPrompt = formData.get('prompt') as string || '';
    
    if (!imageFile) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    // Convert image to base64
    const buffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image
        }
      },
      {
        text: `
          ${userPrompt ? `User Instructions: ${userPrompt}\n` : ''}
          
          Analyze this image and create a web project.
          Return a JSON object with this format:
          {
            "files": {
              "index.html": "YOUR_HTML_CONTENT",
              "styles.css": "YOUR_CSS_CONTENT",
              "script.js": "YOUR_JS_CONTENT",
              "README.md": "YOUR_README_CONTENT"
            }
          }
          
          IMPORTANT:
          - Response must be valid JSON only
          - No text before or after the JSON object
          - No code block markers`
      }
    ]);

    const text = result.response.text();
    console.log('Raw AI response:', text);

    // Clean the response text
    const cleanedText = text.replace(/```json\n|\n```|```/g, '').trim();
    
    try {
      const parsedResponse = JSON.parse(cleanedText);
      
      if (!parsedResponse.files) {
        throw new Error('Response missing files object');
      }

      // Convert the files object to our expected format
      const files: GeneratedFile[] = Object.entries(parsedResponse.files).map(([name, content]) => ({
        name,
        content: content as string
      }));

      // Save the files
      const { id, files: savedFiles } = await saveTempFiles(files);

      return NextResponse.json({
        success: true,
        projectId: id,
        files: savedFiles
      });

    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Cleaned text:', cleanedText);
      return NextResponse.json({
        error: 'Failed to parse AI response',
        details: process.env.NODE_ENV === 'development' ? {
          error: parseError.message,
          rawResponse: text.slice(0, 500) + '...' // Truncate for readability
        } : undefined
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in analyze route:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to analyze image",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
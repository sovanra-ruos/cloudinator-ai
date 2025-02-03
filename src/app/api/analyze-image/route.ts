import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Type for the expected response structure
interface CodeAnalysisResponse {
  files: {
    [filename: string]: string;
  };
}

// Initialize Gemini AI with error checking
const initializeGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function POST(request: Request) {
  try {
    // Initialize Gemini
    const genAI = initializeGeminiAI();
    
    // Get form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const userPrompt = formData.get('prompt') as string || '';
    
    // Validate image
    if (!imageFile) {
      return NextResponse.json(
        { error: "Image file is required" }, 
        { status: 400 }
      );
    }

    // Validate mime type and size
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit for Gemini Flash
    
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed" },
        { status: 400 }
      );
    }
    
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 20MB limit" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const buffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    
    // Setup Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a specific prompt for HTML generation
    const prompt = `
      ${userPrompt ? `User Instructions: ${userPrompt}\n` : ''}
      
      Analyze this image and create a webpage that represents its content.
      Return ONLY a JSON object with this structure, no additional text or code blocks:
      {
        "files": {
          "index.html": "(your HTML code here)"
        }
      }
      
      The HTML should:
      - Be clean and properly formatted
      - Include appropriate styling
      - Preserve all text content from the image
      - Use modern HTML5 and CSS3 features
      
      Requirements:
      - Always name the file "index.html"
      - Include complete, valid HTML structure with <!DOCTYPE html>, <html>, <head>, and <body> tags
      - Include appropriate meta tags and title
      - Make sure all HTML is properly formatted and indented
      - If the image contains text content, incorporate it appropriately into the HTML structure
    `;

    // Generate content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image
        }
      }
    ]);

    const response = result.response;
    const text = response.text();

    // Parse response
    try {
      // Try to extract valid JSON from the response
      let responseText = text;
      
      // If the response contains JSON as a string (like in a code block), extract it
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }
      
      // Parse the JSON response
      const parsedResponse = JSON.parse(responseText) as CodeAnalysisResponse;
      
      // If we have HTML content in the files object, clean it up
      if (parsedResponse.files?.["index.html"]) {
        // The HTML might be escaped, so unescape it
        parsedResponse.files["index.html"] = parsedResponse.files["index.html"]
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"');
      } else {
        // If no index.html is found, create a default one
        parsedResponse.files = {
          "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Content</title>
</head>
<body>
    ${text}
</body>
</html>`
        };
      }
      
      return NextResponse.json(parsedResponse);
    } catch (e) {
      // If parsing fails, create a basic HTML file with the content
      const response: CodeAnalysisResponse = {
        files: {
          "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated HTML</title>
</head>
<body>
    ${text}
</body>
</html>`
        }
      };
      return NextResponse.json(response);
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
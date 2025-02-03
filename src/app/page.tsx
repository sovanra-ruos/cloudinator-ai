"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar"
import { CodePreview } from "@/components/code-preview"
import { FileTree } from "@/components/file-tree"
import { ImageUpload } from "@/components/image-upload"

export interface ProjectResponse {
  projectId: string;
  files: GeneratedFile[];
}

interface GeneratedFile {
  name: string;
  path: string;
  content: string;
}

export default function Page() {
  const [files, setFiles] = useState<GeneratedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [inputMode, setInputMode] = useState<"text" | "image">("text")
  const [prompt, setPrompt] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  async function handleImageAnalysis(file: File, imagePrompt: string) {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("prompt", imagePrompt || prompt) // Use image-specific prompt or main prompt
  
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
        contentType: false,
      })
  
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(
          data.error || 
          (data.details ? `${data.error}: ${JSON.stringify(data.details)}` : "Failed to analyze image")
        )
      }
  
      if (!data.files || !Array.isArray(data.files)) {
        throw new Error("Invalid response format: missing files array")
      }
  
      const newFiles = data.files.map(file => ({
        name: file.name,
        path: file.path,
        content: file.content
      }))
  
      setFiles(newFiles)
      if (newFiles.length > 0) {
        setSelectedFile(newFiles[0])
      }
  
      toast({
        title: "Success",
        description: "Files generated successfully",
      })
    } catch (error) {
      console.error("Error analyzing image:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate code");
      }
  
      // Check if the response contains the expected 'files' property
      if (!data.files || !Array.isArray(data.files)) {
        throw new Error("Invalid response format: missing files array");
      }
  
      const newFiles = data.files.map((file) => ({
        name: file.name,
        path: file.path,
        content: file.content,
      }));
  
      setFiles(newFiles);
      if (newFiles.length > 0) {
        setSelectedFile(newFiles[0]);
      }
  
      toast({
        title: "Success",
        description: "Code generated successfully",
      });
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }
  const handleDeploy = async () => {
    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: files.reduce(
            (acc, file) => ({
              ...acc,
              [file.path]: file.content,
            }),
            {},
          ),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to deploy")
      }

      toast({
        title: "Success",
        description: "Files deployed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deploy files",
        variant: "destructive",
      })
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <header className="border-b">
            <div className="container flex items-center justify-between h-14 px-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">AI Code Generator</h1>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleDeploy}>Deploy</Button>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="p-6">
                <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as "text" | "image")}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="text">Text Only</TabsTrigger>
                    <TabsTrigger value="image">With Image</TabsTrigger>
                  </TabsList>
                  
                  <div className="space-y-4">
                    <Textarea
                      placeholder={inputMode === "text" ? 
                        "Describe what code you want to generate..." : 
                        "Add any specific instructions for the image analysis (optional)..."
                      }
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                    
                    {inputMode === "image" && (
                      <ImageUpload 
                        ref={fileInputRef} 
                        onImageSelected={handleImageAnalysis} 
                        isLoading={isProcessing} 
                      />
                    )}
                    
                    {inputMode === "text" && (
                      <Button 
                        onClick={handleGenerate} 
                        disabled={isProcessing || !prompt.trim()}
                        className="w-full"
                      >
                        {isProcessing ? "Generating..." : "Generate Code"}
                      </Button>
                    )}
                  </div>
                </Tabs>
              </Card>

              <Tabs value={activeTab}>
                <TabsContent value="preview">
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Preview</h2>
                    {selectedFile ? (
                      selectedFile.name.endsWith('.html') ? (
                        <iframe
                          srcDoc={selectedFile.content}
                          className="w-full h-[400px] border rounded"
                          title="Code Preview"
                        />
                      ) : (
                        <CodePreview
                          file={selectedFile}
                          onSave={async (filename, content) => {
                            setFiles(files.map((f) => 
                              f.name === filename ? { ...f, content } : f
                            ))
                          }}
                        />
                      )
                    ) : (
                      <p>No file selected for preview.</p>
                    )}
                  </Card>
                </TabsContent>
                <TabsContent value="code">
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Code</h2>
                    {selectedFile && (
                      <CodePreview
                        file={selectedFile}
                        onSave={async (filename, content) => {
                          setFiles(files.map((f) => 
                            f.name === filename ? { ...f, content } : f
                          ))
                        }}
                      />
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
        <Sidebar className="w-64 border-l" side="right">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Generated Files</h2>
          </div>
          <div className="p-2">
            <FileTree files={files} selectedFile={selectedFile} onSelect={setSelectedFile} />
          </div>
        </Sidebar>
      </div>
    </SidebarProvider>
  )
}
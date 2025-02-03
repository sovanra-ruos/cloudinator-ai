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
import { Code, FileText, Loader2 } from "lucide-react"

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  async function handleImageAnalysis(file: File, imagePrompt: string) {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("prompt", imagePrompt || prompt)

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

      const newFiles = data.files.map((file: { name: string; path: string; content: string }) => ({
        name: file.name,
        path: file.path,
        content: file.content
      }));

      setFiles(newFiles)
      if (newFiles.length > 0) {
        setSelectedFile(newFiles[0])
      }

      toast({
        title: "Success",
        description: "Files generated successfully",
        variant: "success"
      })
    } catch (error) {
      console.error("Error analyzing image:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "error",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setIsProcessing(true);

    try {
      localStorage.removeItem("projectId");

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate code");
      }

      localStorage.setItem("projectId", data.projectId);

      if (!data.files || !Array.isArray(data.files)) {
        throw new Error("Invalid response format: missing files array");
      }

      const newFiles = data.files.map((file: { name: string; path: string; content: string }) => ({
        name: file.name,
        path: file.path,
        content: file.content,
      }));

      setFiles(newFiles);
      if (newFiles.length > 0) {
        setSelectedFile(newFiles[0]);
      }

      // Switch to code tab after successful generation
      setActiveTab("code");

      toast({
        title: "Success",
        description: "Code generated successfully",
        variant: "success"
      });
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "error",
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
        variant: "success"
      })
    } catch (error) {
      console.log("Error deploying files:", error)
      toast({
        title: "Error",
        description: "Failed to deploy files",
        variant: "error",
      })
    }
  }

  const handlePushCode = async () => {
    try {
      const projectId = localStorage.getItem("projectId");
      if (!projectId) {
        throw new Error("No projectId found in localStorage");
      }

      const response = await fetch("/api/git-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error("Failed to make the project public");
      }

      toast({
        title: "Success",
        description: "Project made public successfully",
        variant: "success"
      });
    } catch (error) {
      console.error("Error making project public:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to make project public",
        variant: "error",
      });
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <header className="border-b py-2">
            <div className="container flex items-center justify-between h-14 px-4">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-purple-500">Cloudinator AI</h1>
                <p className="text-purple-500">Code Generator</p>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger
                      value="preview"
                      className="data-[state=active]:bg-purple-500 data-[state=active]:text-white flex items-center justify-center space-x-2"
                    >
                      <FileText size={20} /> {/* Preview Tab Icon */}
                      <span>Preview</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="code"
                      className="data-[state=active]:bg-purple-500 data-[state=active]:text-white flex items-center justify-center space-x-2"
                    >
                      <Code size={20} /> {/* Code Tab Icon */}
                      <span>Code</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handlePushCode}>Public</Button>
                <Button onClick={handleDeploy}>Deploy</Button>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              <Card className="p-6">
                <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as "text" | "image")}>
                  <TabsList className="mb-4 w-full grid grid-cols-2">
                    <TabsTrigger
                      value="text"
                      className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                    >
                      Input Text
                    </TabsTrigger>
                    <TabsTrigger
                      value="image"
                      className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                    >
                      Add Image
                    </TabsTrigger>
                  </TabsList>

                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative">
                        <Textarea
                          placeholder={inputMode === "text" ?
                            "Describe what code you want to generate..." :
                            "Add any specific instructions for the image analysis (optional)..."
                          }
                          value={prompt}
                          onChange={(e) => {
                            setPrompt(e.target.value);
                            // Add typing animation effect
                            const el = e.target;
                            el.style.height = 'auto';
                            el.style.height = el.scrollHeight + 'px';
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.shiftKey === false && !isProcessing && prompt.trim()) {
                              e.preventDefault();
                              handleGenerate();
                            }
                          }}
                          className="min-h-[150px] w-full bg-background/80 border-2 border-purple-500/20 rounded-lg p-4 font-mono text-sm transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 resize-none overflow-hidden shadow-lg focus:border-purple-500"
                        />


                        <div className="absolute bottom-2 right-2 text-xs text-purple-400 opacity-70">
                          {prompt.length > 0 && `${prompt.length} characters`}
                        </div>
                        {prompt.length > 0 && (
                          <div className="absolute -bottom-1 left-0 h-1 bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
                            style={{ width: `${Math.min((prompt.length / 500) * 100, 100)}%` }}>
                          </div>
                        )}
                      </div>
                    </div>

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
                        className="w-full bg-purple-500 hover:bg-purple-700 transition-all ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Generating...</span>
                          </div>
                        ) : (
                          "Generate Code"
                        )}
                      </Button>
                    )}
                  </div>
                </Tabs>
              </Card>

              <Tabs value={activeTab}>
                <TabsContent value="preview">
                  <Card className="p-6">
                    <div className="flex gap-2">
                      <FileText size={20} />
                      <h2 className="text-lg font-semibold mb-4">Preview</h2>
                    </div>                  
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
                    <div className="flex gap-2">
                      <Code size={20} />
                      <h2 className="text-lg font-semibold mb-4">Code</h2>
                    </div>                 
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
        <Sidebar className="w-64 border-l py-4" side="right">
          <div className="p-4 border-b flex items-center space-x-2">
            <FileText className="text-purple-500" size={20} />
            <h2 className="font-semibold text-md text-purple-500">Generated Files</h2>
          </div>
          <div className="p-2">
            <FileTree files={files} selectedFile={selectedFile} onSelect={setSelectedFile} />
          </div>
        </Sidebar>
      </div>
    </SidebarProvider>
  )
}
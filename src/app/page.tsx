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

interface GeneratedFile {
  path: string
  content: string
}

export default function Page() {
  const [files, setFiles] = useState<GeneratedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [prompt, setPrompt] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  async function handleImageAnalysis(file: File, prompt: string) {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("prompt", prompt) // Add the prompt to the form data
  
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      })
  
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze image")
      }
  
      const newFiles = Object.entries(data.files || {}).map(([path, content]) => ({
        path,
        content: content as string,
      }))
  
      setFiles(newFiles)
      if (newFiles.length > 0) {
        setSelectedFile(newFiles[0])
      }
  
      toast({
        title: "Success",
        description: "Code extracted successfully from image",
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

  async function handlePromptSubmit() {
    if (!prompt.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate code")
      }

      const newFiles = Object.entries(data.files || {}).map(([path, content]) => ({
        path,
        content: content as string,
      }))

      setFiles(newFiles)
      if (newFiles.length > 0) {
        setSelectedFile(newFiles[0])
      }

      toast({
        title: "Success",
        description: "Code generated successfully",
      })
    } catch (error) {
      console.error("Error generating code:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
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
                <Button onClick={() => fileInputRef.current?.click()}>Upload Image</Button>
                <Button onClick={handleDeploy}>Deploy</Button>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="p-6">
                <Tabs defaultValue="text" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="text">Text Prompt</TabsTrigger>
                    <TabsTrigger value="image">Image Upload</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text" className="space-y-4">
                    <Textarea
                      placeholder="Example: Create an index.html file with a basic React setup"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button onClick={handlePromptSubmit} disabled={isProcessing || !prompt.trim()}>
                      {isProcessing ? "Generating..." : "Generate Code"}
                    </Button>
                  </TabsContent>
                  <TabsContent value="image">
                    <ImageUpload ref={fileInputRef} onImageSelected={handleImageAnalysis} isLoading={isProcessing} />
                  </TabsContent>
                </Tabs>
              </Card>
              <Tabs value={activeTab}>
                <TabsContent value="preview">
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Preview</h2>
                    {selectedFile ? (
                      <iframe
                        srcDoc={selectedFile.content}
                        className="w-full h-[400px] border rounded"
                        title="Code Preview"
                      />
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
                        onSave={async (path, content) => {
                          setFiles(files.map((f) => (f.path === path ? { ...f, content } : f)))
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


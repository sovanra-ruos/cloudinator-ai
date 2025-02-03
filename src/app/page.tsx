"use client"

import { useState, useCallback } from "react"
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import CodeGenerator from "@/components/CodeGenerator"
import FileTree from "@/components/FileTree"
import CodePreview from "@/components/CodePreview"
import { useToast } from "@/hooks/use-toast"

interface GeneratedFile {
  path: string
  content: string
}

export default function Home() {
  const [files, setFiles] = useState<GeneratedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null)
  const { toast } = useToast()
  const { isOpen, setIsOpen } = useSidebar()

  const handleCodeGeneration = useCallback(
    (newFiles: GeneratedFile[]) => {
      setFiles(newFiles)
      if (newFiles.length > 0 && !selectedFile) {
        setSelectedFile(newFiles[0])
      }
    },
    [selectedFile],
  )

  const handleSaveFile = async (path: string, content: string) => {
    try {
      // Save to API
      const response = await fetch("/api/save-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content }),
      })

      if (!response.ok) {
        throw new Error("Failed to save file")
      }

      // Update local state
      setFiles((prev) => prev.map((file) => (file.path === path ? { ...file, content } : file)))

      // Update selected file if it's the one being saved
      if (selectedFile?.path === path) {
        setSelectedFile({ path, content })
      }
    } catch (error) {
      throw error
    }
  }

  const handlePublish = async () => {
    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      })

      if (!response.ok) {
        throw new Error("Failed to publish")
      }

      toast({
        title: "Success",
        description: "Files published successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish files",
        variant: "destructive",
      })
    }
  }

  const handleDeploy = async () => {
    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      })

      if (!response.ok) {
        throw new Error("Failed to deploy")
      }

      toast({
        title: "Success",
        description: "Deployment successful",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Deployment failed",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarHeader className="border-b p-4">
          <h2 className="font-semibold">Project Structure</h2>
        </SidebarHeader>
        <SidebarContent>
          <FileTree files={files} onSelect={setSelectedFile} selectedFile={selectedFile} />
        </SidebarContent>
      </Sidebar>

      <main className="flex-1 overflow-auto">
        <div className="border-b">
          <div className="container flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold">AI Code Generator</h1>
            <div className="flex gap-2">
              <Button onClick={() => setIsOpen(!isOpen)}>Toggle Sidebar</Button>
              <Button onClick={handlePublish}>Publish</Button>
              <Button onClick={handleDeploy} variant="default">
                Deploy
              </Button>
            </div>
          </div>
        </div>

        <div className="container grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            <CodeGenerator onGenerate={handleCodeGeneration} />
          </div>
          <div className="space-y-6">{selectedFile && <CodePreview file={selectedFile} onSave={handleSaveFile} />}</div>
        </div>
      </main>
    </div>
  )
}


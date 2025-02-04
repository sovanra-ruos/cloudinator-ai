"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Editor from "@monaco-editor/react"

interface CodePreviewProps {
  file: {
    path: string
    content: string
  }
  onSave?: (path: string, content: string) => Promise<void>
}

export default function CodePreview({ file, onSave }: CodePreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(file.content)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Determine language based on file extension
  const getLanguage = (filename: string) => {
    const ext = filename.split(".").pop()
    switch (ext) {
      case "ts":
      case "tsx":
        return "typescript"
      case "js":
      case "jsx":
        return "javascript"
      case "css":
        return "css"
      case "html":
        return "html"
      default:
        return "text"
    }
  }

  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave(file.path, content)
      toast({
        title: "Success",
        description: "File saved successfully",
      })
    } catch (error) {
      console.log("Error saving file:", error)
      toast({
        title: "Error",
        description: "Failed to save file",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setContent(value)
    }
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{file.path}</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Preview" : "Edit"}
          </Button>
          {isEditing && (
            <Button variant="default" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative min-h-[300px]">
          <Editor
            height="300px"
            language={getLanguage(file.path)}
            value={content}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              readOnly: !isEditing,
              wordWrap: "on",
              theme: "vs-dark",
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}


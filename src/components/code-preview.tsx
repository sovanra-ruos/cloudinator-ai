"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Save } from "lucide-react"
import Editor from "@monaco-editor/react"

interface CodePreviewProps {
  file: {
    path: string
    content: string
  }
  onSave?: (path: string, content: string) => Promise<void>
}

export function CodePreview({ file, onSave }: CodePreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(file.content)
  const [isSaving, setIsSaving] = useState(false)

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
    } finally {
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-mono text-sm">{file.path}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Preview" : "Edit"}
          </Button>
          {isEditing && (
            <Button variant="default" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>
      <div className="p-0">
        <Editor
          height="400px"
          language={getLanguage(file.path)}
          value={content}
          onChange={(value) => value && setContent(value)}
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
    </Card>
  )
}


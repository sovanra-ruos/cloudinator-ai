"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface FolderCreatorProps {
  onCreateFolder: (folderName: string) => void
}

export default function FolderCreator({ onCreateFolder }: FolderCreatorProps) {
  const [folderName, setFolderName] = useState("")

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim())
      setFolderName("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Folder Creator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          placeholder="Enter folder name..."
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
        />
        <Button onClick={handleCreateFolder} disabled={!folderName.trim()} className="w-full">
          Create Folder
        </Button>
      </CardContent>
    </Card>
  )
}


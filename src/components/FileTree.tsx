import { File, Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface GeneratedFile {
  path: string
  content: string
}

interface FileTreeProps {
  files: GeneratedFile[]
  selectedFile: GeneratedFile | null
  onSelect: (file: GeneratedFile) => void
}

export default function FileTree({ files, selectedFile, onSelect }: FileTreeProps) {
  const [tree, setTree] = useState<any>({})

  useEffect(() => {
    const newTree = createTree(files)
    setTree(newTree)
  }, [files])

  // Create a tree structure from flat file paths
  const createTree = (paths: GeneratedFile[]) => {
    const tree: any = {}

    paths.forEach((file) => {
      const parts = file.path.split("/")
      let current = tree

      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          current[part] = file
        } else {
          current[part] = current[part] || {}
          current = current[part]
        }
      })
    })

    return tree
  }

  const renderTree = (node: any, path = "") => {
    return Object.entries(node).map(([key, value]) => {
      const currentPath = path ? `${path}/${key}` : key
      const isFile = "content" in value

      return (
        <div key={currentPath} className="ml-4">
          {isFile ? (
            <button
              onClick={() => onSelect(value as GeneratedFile)}
              className={cn(
                "flex items-center gap-2 px-2 py-1 w-full text-left rounded hover:bg-accent",
                selectedFile?.path === (value as GeneratedFile).path && "bg-accent",
              )}
            >
              <File className="h-4 w-4" />
              {key}
            </button>
          ) : (
            <div>
              <div className="flex items-center gap-2 px-2 py-1">
                <Folder className="h-4 w-4" />
                {key}
              </div>
              {renderTree(value, currentPath)}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="p-2">
      {Object.keys(tree).length === 0 ? (
        <p className="text-sm text-muted-foreground p-4 text-center">No files generated yet</p>
      ) : (
        renderTree(tree)
      )}
    </div>
  )
}


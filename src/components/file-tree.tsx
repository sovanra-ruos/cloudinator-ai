// components/file-tree.tsx
import { FileIcon } from "lucide-react";

interface FileTreeProps {
  files: Array<{
    name: string;
    path: string;
    content: string;
  }>;
  selectedFile: { name: string; content: string } | null;
  onSelect: (file: { name: string; content: string }) => void;
}

export function FileTree({ files, selectedFile, onSelect }: FileTreeProps) {
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <button
          key={file.path}
          className={`w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-accent text-left ${
            selectedFile?.name === file.name ? "bg-accent" : ""
          }`}
          onClick={() => onSelect(file)}
        >
          <FileIcon className="h-4 w-4" />
          <span className="text-sm truncate">{file.name}</span>
        </button>
      ))}
    </div>
  );
}
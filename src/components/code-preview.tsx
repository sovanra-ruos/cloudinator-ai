// components/code-preview.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CodePreviewProps {
  file: {
    name: string;
    content: string;
  };
  onSave?: (filename: string, content: string) => Promise<void>;
}

export function CodePreview({ file, onSave }: CodePreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(file.content);
  console.log(file);
  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'plaintext';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{file.name}</h3>
        <div className="flex gap-2">
          {onSave && (
            <>
              <Button
                size="sm"
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              {isEditing && (
                <Button
                  size="sm"
                  onClick={async () => {
                    await onSave(file.name, content);
                    setIsEditing(false);
                  }}
                >
                  Save
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <Card className="relative">
        {isEditing ? (
          <textarea
            className="w-full h-[400px] p-4 font-mono text-sm bg-background resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        ) : (
          <pre className="p-4 overflow-auto h-[400px] text-sm">
            <code className={`language-${getLanguage(file.name)}`}>
              {file.content}
            </code>
          </pre>
        )}
      </Card>
    </div>
  );
}
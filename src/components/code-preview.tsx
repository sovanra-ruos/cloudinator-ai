// components/code-preview.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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
  const [language, setLanguage] = useState('plaintext');

  // Set the language based on file extension
  useEffect(() => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html': setLanguage('html'); break;
      case 'css': setLanguage('css'); break;
      case 'js': setLanguage('javascript'); break;
      case 'ts': setLanguage('typescript'); break;
      case 'json': setLanguage('json'); break;
      case 'md': setLanguage('markdown'); break;
      default: setLanguage('plaintext'); break;
    }
  }, [file]);

  // Define custom syntax highlighter theme
  const customTheme = {
    'hljs': {
      background: '#2d2d2d', // dark background
      color: '#f8f8f2', // light text color
    },
    'hljs-keyword': {
      color: '#ff79c6', // pink
    },
    'hljs-string': {
      color: '#f1fa8c', // light yellow
    },
    'hljs-comment': {
      color: '#6272a4', // soft blue for comments
      fontStyle: 'italic',
    },
    'hljs-variable': {
      color: '#50fa7b', // green for variables
    },
    'hljs-function': {
      color: '#8be9fd', // cyan for functions
    },
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

      <Card className="relative bg-gray-900 text-white">
        {isEditing ? (
          <textarea
            className="w-full h-[400px] p-4 font-mono text-sm bg-gray-800 text-white resize-none border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 rounded-lg shadow-lg"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        ) : (
          <SyntaxHighlighter
            language={language}
            style={customTheme} // Apply custom theme
            className="p-4 overflow-auto h-[400px] text-sm rounded-lg"
          >
            {file.content}
          </SyntaxHighlighter>
        )}
      </Card>
    </div>
  );
}

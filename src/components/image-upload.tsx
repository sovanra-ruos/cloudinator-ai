import { forwardRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type React from "react"

interface ImageUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onImageSelected: (file: File, prompt: string) => void
  isLoading?: boolean
}

export const ImageUpload = forwardRef<HTMLInputElement, ImageUploadProps>(
  ({ className, onImageSelected, isLoading, ...props }, ref) => {
    const [prompt, setPrompt] = useState("")
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileSelect = (file: File) => {
      setSelectedFile(file)
      setSelectedFileName(file.name)
    }

    const handleSubmit = () => {
      if (selectedFile) {
        onImageSelected(selectedFile, prompt)
      }
    }

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              {isLoading ? (
                <Icons.spinner className="h-12 w-12 animate-spin text-muted-foreground" />
              ) : (
                <div 
                  className="rounded-lg border-2 border-dashed p-8 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => {
                    const input = document.querySelector(`input[type="file"]`) as HTMLInputElement
                    input?.click()
                  }}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Icons.upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      {selectedFileName ? (
                        <span className="text-primary">{selectedFileName}</span>
                      ) : (
                        "Drag and drop an image, or click to select"
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <input
            ref={ref}
            type="file"
            accept="image/*"
            className={cn("hidden", className)}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileSelect(file)
              }
            }}
            {...props}
          />
        </div>

        <div className="space-y-2">
        
          <Button 
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? "Processing..." : "Analyze Image"}
          </Button>
        </div>
      </div>
    )
  }
)

ImageUpload.displayName = "ImageUpload"
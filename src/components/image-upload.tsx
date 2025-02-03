import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import type React from "react" // Added import for React

interface ImageUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onImageSelected: (file: File) => void
  isLoading?: boolean
}

export const ImageUpload = forwardRef<HTMLInputElement, ImageUploadProps>(
  ({ className, onImageSelected, isLoading, ...props }, ref) => {
    return (
      <div className="text-center">
        <div className="space-y-2">
          <div className="flex items-center justify-center">
            {isLoading ? (
              <Icons.spinner className="h-12 w-12 animate-spin text-muted-foreground" />
            ) : (
              <div className="rounded-lg border-2 border-dashed p-12">
                <div className="flex flex-col items-center space-y-2">
                  <Icons.upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Drag and drop an image, or click to select</div>
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
              onImageSelected(file)
            }
          }}
          {...props}
        />
      </div>
    )
  },
)
ImageUpload.displayName = "ImageUpload"


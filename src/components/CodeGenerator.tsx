"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import debounce from "lodash/debounce"

interface CodeGeneratorProps {
  onGenerate: (files: Array<{ path: string; content: string }>) => void
}

export default function CodeGenerator({ onGenerate }: CodeGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const generateCode = useCallback(
    async (promptText: string) => {
      if (!promptText.trim()) return

      setIsLoading(true)
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptText.trim() }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to generate code")
        }

        if (!data.files || typeof data.files !== "object") {
          throw new Error("Invalid response format")
        }

        const files = Object.entries(data.files).map(([path, content]) => ({
          path,
          content: content as string,
        }))

        onGenerate(files)
      } catch (error) {
        console.error("Error generating code:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to generate code",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [onGenerate, toast],
  )

  const debouncedGenerateCode = useCallback(
    debounce((promptText: string) => generateCode(promptText), 1000),
    [generateCode],
  )

  useEffect(() => {
    debouncedGenerateCode(prompt)
    return () => {
      debouncedGenerateCode.cancel()
    }
  }, [prompt, debouncedGenerateCode])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Code Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Example: Create a React button component with TypeScript"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[200px]"
        />
        {isLoading && <p className="text-sm text-muted-foreground text-center">Generating code...</p>}
      </CardContent>
    </Card>
  )
}


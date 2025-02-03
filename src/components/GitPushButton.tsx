"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface GitPushButtonProps {
  files: { [key: string]: string }
}

export default function GitPushButton({ files }: GitPushButtonProps) {
  const [isPushing, setIsPushing] = useState(false)
  const { toast } = useToast()

  const handlePush = async () => {
    setIsPushing(true)
    try {
      const response = await fetch("/api/git-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      })

      if (!response.ok) {
        throw new Error("Failed to push to Git")
      }

      toast({
        title: "Success",
        description: "Successfully pushed to Git repository",
      })
    } catch (error) {
      console.error("Error pushing to Git:", error)
      toast({
        title: "Error",
        description: "Failed to push to Git repository",
        variant: "destructive",
      })
    } finally {
      setIsPushing(false)
    }
  }

  return (
    <Button onClick={handlePush} disabled={isPushing}>
      {isPushing ? "Pushing to Git..." : "Push to Git"}
    </Button>
  )
}


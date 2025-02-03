"use client"

import * as React from "react"
import {ReactNode} from "react";

type SidebarContextType = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}


interface SidebarProps {
  children: ReactNode
  className?: string
  side: "left" | "right"
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true)

  return <SidebarContext.Provider value={{ isOpen, setIsOpen }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export const Sidebar: React.FC<SidebarProps> = ({ children, className, side }) => {
  return (
      <div className={`${className} ${side === "right" ? "border-l" : "border-r"}`}>
        {children}
      </div>
  )
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>
}


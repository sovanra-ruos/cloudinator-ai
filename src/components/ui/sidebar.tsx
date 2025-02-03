"use client"

import * as React from "react"

type SidebarContextType = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
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

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar()
  return (
    <aside className={`w-64 bg-gray-100 p-4 transition-all ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {children}
    </aside>
  )
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>
}


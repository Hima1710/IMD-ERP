'use client'

import * as React from "react"
import { GripVertical } from "lucide-react"

import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelGroup>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.PanelGroup>
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.PanelGroup
    ref={ref}
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
))
ResizablePanelGroup.displayName = ResizablePrimitive.PanelGroup.displayName

const ResizablePanel = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.Panel>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.Panel>
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.Panel
    ref={ref}
    className={cn(
      "relative flex w-full grow overflow-hidden data-[panel-group-direction=vertical]:flex-col data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=horizontal]:flex-row",
      className
    )}
    {...props}
  />
))
ResizablePanel.displayName = ResizablePrimitive.Panel.displayName

const ResizablePanelResizeHandle = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelResizeHandle>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.PanelResizeHandle>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ResizablePrimitive.PanelResizeHandle
    ref={ref}
    className={cn(
      "flex touch-none select-none items-center justify-center p-1 data-[panel-resize-handle-direction=horizontal]:w-[2px] data-[panel-resize-handle-direction=horizontal]:h-4 data-[panel-resize-handle-direction=vertical]:h-[2px] data-[panel-resize-handle-direction=vertical]:w-4 data-[panel-resize-handle-direction=vertical]:rotate-90",
      className
    )}
    orientation={orientation}
    {...props}
  >
    <div className="w-2 h-2 bg-border rounded-full" />
  </ResizablePrimitive.PanelResizeHandle>
))
ResizablePanelResizeHandle.displayName =
  ResizablePrimitive.PanelResizeHandle.displayName

const ResizableHandle = ({ className, orientation, ...props }: React.ComponentProps<typeof ResizablePanelResizeHandle>) => (
  <ResizablePanelResizeHandle
    className={cn(
      "touch-none select-none flex h-px w-full items-center justify-center bg-border",
      '[data-orientation=vertical]:h-full [data-orientation=vertical]:w-px',
      className
    )}
    orientation={orientation}
    {...props}
  >
    <GripVertical className="h-3 w-3" />
  </ResizablePanelResizeHandle>
)

export { ResizablePanel, ResizablePanelGroup, ResizableHandle }

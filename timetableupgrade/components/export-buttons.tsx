"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Table, FileImage } from "lucide-react"
import { exportTimetable } from "../services/api"

interface ExportButtonsProps {
  type: string
  id: number | string
}

export default function ExportButtons({ type, id }: ExportButtonsProps) {
  const [downloading, setDownloading] = useState(false)

  const handleExport = async (format: string) => {
    setDownloading(true)
    try {
      console.log("Exporting:", { type, id, format })
      await exportTimetable(type, id, format)
    } finally {
      setDownloading(false)
    }
  }

  if (!id) return null

  const exportOptions = [
    { format: "html", label: "HTML", icon: FileText, variant: "default" as const },
    { format: "csv", label: "CSV", icon: Table, variant: "secondary" as const },
    { format: "pdf", label: "PDF", icon: FileImage, variant: "destructive" as const },
  ]

  return (
    <div className="flex flex-wrap gap-2 my-4">
      {exportOptions.map(({ format, label, icon: Icon, variant }) => (
        <Button
          key={format}
          onClick={() => handleExport(format)}
          disabled={downloading}
          variant={variant}
          size="sm"
          className="flex items-center gap-2"
        >
          <Icon className="h-4 w-4" />
          {downloading ? "Exporting..." : `Export ${label}`}
        </Button>
      ))}
    </div>
  )
}

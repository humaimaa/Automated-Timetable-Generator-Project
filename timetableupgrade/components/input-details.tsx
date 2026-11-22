"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar } from "lucide-react"
import SubjectForm from "./subject-form"
import TeacherForm from "./teacher-form"
import ClassroomForm from "./classroom-form"
import SectionForm from "./section-form"
import SectionTimetable from "./section-timetable"
import ExportButtons from "./export-buttons"

interface Batch {
  id: number
  name: string
}

interface InputDetailsProps {
  selectedBatch: Batch | null
  selectedSection: string | null
  onBack?: () => void
}

export default function InputDetails({ selectedBatch, selectedSection, onBack }: InputDetailsProps) {
  const [timetableData, setTimetableData] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDataUpdate = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // Add null checks for selectedBatch and selectedSection
  if (!selectedBatch || !selectedSection) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Please select a batch and section to continue.</p>
            {onBack && (
              <Button variant="outline" onClick={onBack} className="mt-4 bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calendar className="h-6 w-6" />
              Input Details for {selectedBatch.name} - {selectedSection}
            </CardTitle>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Section Management */}
      <SectionForm onCreated={handleDataUpdate} />

      {/* Subject Management */}
      <SubjectForm selectedBatch={selectedBatch} onCreated={handleDataUpdate} />

      {/* Teacher Management */}
      <TeacherForm selectedBatch={selectedBatch} onCreated={handleDataUpdate} />

      {/* Classroom Management */}
      <ClassroomForm onCreated={handleDataUpdate} />

      {/* Display Generated Timetable */}
      {timetableData.length > 0 && (
        <div className="space-y-6">
          <SectionTimetable timetable={timetableData} />
          <ExportButtons type="section" id={`${selectedBatch.id}-${selectedSection}`} />
        </div>
      )}
    </div>
  )
}

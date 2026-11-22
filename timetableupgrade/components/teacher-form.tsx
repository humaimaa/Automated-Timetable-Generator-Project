"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserCheck, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"
import api from "../services/api"

interface Batch {
  id: number
  name: string
}

interface Subject {
  id: number
  code: string
  name: string
  periods_per_week: number
  batch: Batch
}

interface Teacher {
  id: number
  name: string
  max_periods_per_week: number
  subjects: Subject[]
  batches: Batch[]
}

interface TeacherFormProps {
  selectedBatch?: Batch | null
  onCreated?: () => void
}

export default function TeacherForm({ selectedBatch, onCreated }: TeacherFormProps) {
  const [name, setName] = useState("")
  const [maxPeriods, setMaxPeriods] = useState("30")
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedBatches, setSelectedBatches] = useState<string[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showTeachers, setShowTeachers] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  // Fetch all batches on component mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/batches/")
        setBatches(res.data || [])
      } catch (err) {
        console.error("Error fetching batches:", err)
        setBatches([])
      }
    }
    fetchBatches()
  }, [])

  // Fetch batch-specific data when selectedBatch changes
  useEffect(() => {
    const fetchBatchData = async () => {
      if (selectedBatch && selectedBatch.id) {
        setLoadingData(true)
        try {
          // Fetch subjects for this specific batch
          const subjectsRes = await api.get(`/subjects/?batch_id=${selectedBatch.id}`)
          setSubjects(subjectsRes.data || [])

          // Fetch teachers for this specific batch
          const teachersRes = await api.get(`/teachers/?batch_id=${selectedBatch.id}`)
          setTeachers(teachersRes.data || [])

          // Set selected batch
          setSelectedBatches([selectedBatch.id.toString()])

          console.log("Fetched batch-specific data:", {
            batchId: selectedBatch.id,
            subjects: subjectsRes.data?.length || 0,
            teachers: teachersRes.data?.length || 0,
          })
        } catch (err) {
          console.error("Error fetching batch-specific data:", err)
          setSubjects([])
          setTeachers([])
        } finally {
          setLoadingData(false)
        }
      } else {
        // Clear data when no batch is selected
        setSubjects([])
        setTeachers([])
        setSelectedBatches([])
      }
    }

    fetchBatchData()
  }, [selectedBatch, onCreated])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBatches.length) {
      setError("Please select at least one batch")
      return
    }

    setLoading(true)
    setError("")

    api
      .post("/teachers/", {
        name,
        max_periods_per_week: Number.parseInt(maxPeriods),
        subject_ids: selectedSubjects.map((id) => Number.parseInt(id)),
        batches: selectedBatches.map((id) => Number.parseInt(id)),
        daily_unavailable: {},
      })
      .then(() => {
        setName("")
        setMaxPeriods("30")
        setSelectedSubjects([])
        setError("")
        onCreated && onCreated()

        // Refresh teachers list for current batch
        if (selectedBatch && selectedBatch.id) {
          api
            .get(`/teachers/?batch_id=${selectedBatch.id}`)
            .then((res) => setTeachers(res.data || []))
            .catch((err) => console.error("Error refreshing teachers:", err))
        }
      })
      .catch(() => setError("Failed to add teacher"))
      .finally(() => setLoading(false))
  }

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return

    api.delete(`/teachers/${id}/`).then(() => {
      // Refresh teachers list for current batch
      if (selectedBatch && selectedBatch.id) {
        api
          .get(`/teachers/?batch_id=${selectedBatch.id}`)
          .then((res) => setTeachers(res.data || []))
          .catch((err) => console.error("Error refreshing teachers:", err))
      }
      onCreated && onCreated()
    })
  }

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId],
    )
  }

  const handleBatchToggle = (batchId: string) => {
    setSelectedBatches((prev) => (prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <UserCheck className="h-5 w-5" />
            Add Teacher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-name">Name</Label>
                <Input
                  id="teacher-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter teacher name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-periods">Max periods per week</Label>
                <Input
                  id="max-periods"
                  type="number"
                  min="1"
                  max="50"
                  value={maxPeriods}
                  onChange={(e) => setMaxPeriods(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subjects:</Label>
              <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                {loadingData ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading subjects...</span>
                  </div>
                ) : !selectedBatch ? (
                  <p className="text-muted-foreground text-sm">Please select a batch first to see subjects.</p>
                ) : subjects.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No subjects found for batch "{selectedBatch.name}". Please add subjects for this batch first.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {subjects.map((subject) => (
                      <label key={subject.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject.id.toString())}
                          onChange={() => handleSubjectToggle(subject.id.toString())}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {subject.code} - {subject.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Batches:</Label>
              <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                {batches.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No batches available. Please add batches first.</p>
                ) : (
                  <div className="space-y-1">
                    {batches.map((batch) => (
                      <label key={batch.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBatches.includes(batch.id.toString())}
                          onChange={() => handleBatchToggle(batch.id.toString())}
                          className="rounded"
                        />
                        <span className="text-sm">{batch.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading || !selectedBatches.length}>
                {loading ? "Adding..." : "Add"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowTeachers(!showTeachers)}>
                {showTeachers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                VIEW
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Debug Information */}
          <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs">
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>Selected Batch: {selectedBatch ? `${selectedBatch.name} (ID: ${selectedBatch.id})` : "None"}</p>
            <p>Subjects for this batch: {subjects.length}</p>
            <p>Teachers for this batch: {teachers.length}</p>
            <p>Loading: {loadingData ? "Yes" : "No"}</p>
          </div>
        </CardContent>
      </Card>

      {showTeachers && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Teachers in this Batch{selectedBatch ? ` (${selectedBatch.name})` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading teachers...</span>
              </div>
            ) : !selectedBatch ? (
              <p className="text-muted-foreground">Please select a batch to view teachers.</p>
            ) : teachers.length === 0 ? (
              <p className="text-muted-foreground">No teachers found for batch "{selectedBatch.name}".</p>
            ) : (
              <div className="space-y-2">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{teacher.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(teacher.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        (Max: {teacher.max_periods_per_week} periods/week)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Trash2, Eye, EyeOff } from "lucide-react"
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

interface SubjectFormProps {
  selectedBatch?: Batch | null
  onCreated?: () => void
}

export default function SubjectForm({ selectedBatch, onCreated }: SubjectFormProps) {
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [periodsPerWeek, setPeriodsPerWeek] = useState("1")
  const [batchId, setBatchId] = useState(selectedBatch && selectedBatch.id ? selectedBatch.id.toString() : "")
  const [batches, setBatches] = useState<Batch[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [error, setError] = useState("")
  const [showSubjects, setShowSubjects] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    if (selectedBatch && selectedBatch.id) {
      setBatchId(selectedBatch.id.toString())
    }
  }, [selectedBatch])

  useEffect(() => {
    if (batchId) {
      fetchSubjects()
    }
  }, [batchId, onCreated])

  const fetchBatches = () => {
    api.get("/batches/").then((res) => setBatches(res.data || []))
  }

  const fetchSubjects = () => {
    if (!batchId) return
    api.get(`/subjects/?batch_id=${batchId}`).then((res) => setSubjects(res.data || []))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    api
      .post("/subjects/", {
        code,
        name,
        periods_per_week: Number.parseInt(periodsPerWeek),
        batch_id: batchId,
      })
      .then(() => {
        setCode("")
        setName("")
        setPeriodsPerWeek("1")
        setError("")
        onCreated && onCreated()
        fetchSubjects()
      })
      .catch(() => setError("Failed to add subject"))
      .finally(() => setLoading(false))
  }

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return

    api.delete(`/subjects/${id}/`).then(() => {
      fetchSubjects()
      onCreated && onCreated()
    })
  }

  const selectedBatchName = batches.find((b) => b.id.toString() === batchId)?.name || "Unknown Batch"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <BookOpen className="h-5 w-5" />
            Add Subject
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject-code">Subject Code</Label>
                <Input
                  id="subject-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g., cs 500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject-name">Subject Name</Label>
                <Input
                  id="subject-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., oop"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periods-per-week">Periods per week</Label>
                <Input
                  id="periods-per-week"
                  type="number"
                  min="1"
                  max="10"
                  value={periodsPerWeek}
                  onChange={(e) => setPeriodsPerWeek(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-select">Batches</Label>
                <Select value={batchId} onValueChange={setBatchId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id.toString()}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowSubjects(!showSubjects)}>
                {showSubjects ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                VIEW
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {showSubjects && batchId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subjects in this Batch ({selectedBatchName})</CardTitle>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <p className="text-muted-foreground">No subjects found for this batch.</p>
            ) : (
              <ul className="space-y-2">
                {subjects.map((subject) => (
                  <li key={subject.id} className="flex items-center justify-between p-2 border rounded">
                    <span>
                      <Badge variant="outline" className="mr-2">
                        {subject.code}
                      </Badge>
                      {subject.name} ({subject.periods_per_week} periods/week)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(subject.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Users, Loader2 } from "lucide-react"
import api from "../services/api"

interface Batch {
  id: number
  name: string
}

interface Section {
  id: number
  name: string
  batch: Batch
}

interface SectionFormProps {
  onCreated?: () => void
}

export default function SectionForm({ onCreated }: SectionFormProps) {
  const [name, setName] = useState("")
  const [batchId, setBatchId] = useState("")
  const [batches, setBatches] = useState<Batch[]>([])
  const [error, setError] = useState("")
  const [sections, setSections] = useState<Section[]>([])
  const [loadingSections, setLoadingSections] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchBatches = () => {
    api.get("/batches/").then((res) => setBatches(res.data))
  }

  const fetchSections = () => {
    if (!batchId) return setSections([])
    setLoadingSections(true)
    api
      .get(`/sections/?batch_id=${batchId}`)
      .then((res) => setSections(res.data))
      .catch(() => setSections([]))
      .finally(() => setLoadingSections(false))
  }

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    if (onCreated) fetchBatches()
  }, [onCreated])

  useEffect(() => {
    fetchSections()
  }, [batchId, onCreated])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    api
      .post("/sections/", { name, batch_id: batchId })
      .then(() => {
        setName("")
        setError("")
        onCreated && onCreated()
        fetchSections()
      })
      .catch(() => setError("Failed to add section"))
      .finally(() => setLoading(false))
  }

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return

    api.delete(`/sections/${id}/`).then(() => {
      fetchSections()
      onCreated && onCreated()
    })
  }

  const selectedBatch = batches.find((b) => b.id.toString() === batchId)
  const filteredSections = sections.filter((sec) => sec.batch.id.toString() === batchId)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add Section
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="section-name">Section Name</Label>
                <Input
                  id="section-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter section name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-select">Select Batch</Label>
                <Select value={batchId} onValueChange={setBatchId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a batch" />
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
              <div className="flex items-end">
                <Button type="submit" disabled={loading || !batchId}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Section"
                  )}
                </Button>
              </div>
            </div>
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {batchId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sections for Batch: {selectedBatch?.name || batchId}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSections ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading sections...</span>
              </div>
            ) : filteredSections.length === 0 ? (
              <p className="text-muted-foreground">No sections found for this batch.</p>
            ) : (
              <div className="space-y-2">
                {filteredSections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <span className="font-medium">{section.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(section.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

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
import { Eye, EyeOff, Building } from "lucide-react"
import api from "../services/api"

interface Classroom {
  id: number
  name: string
  type: string
}

interface ClassroomFormProps {
  onCreated?: () => void
}

export default function ClassroomForm({ onCreated }: ClassroomFormProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState("regular")
  const [error, setError] = useState("")
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [showView, setShowView] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchClassrooms()
  }, [onCreated])

  const fetchClassrooms = () => {
    api.get("/classrooms/").then((res) => setClassrooms(res.data))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    api
      .post("/classrooms/", { name, type })
      .then(() => {
        setName("")
        setType("regular")
        setError("")
        onCreated && onCreated()
        fetchClassrooms()
      })
      .catch(() => setError("Failed to add classroom"))
      .finally(() => setLoading(false))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black">
          <Building className="h-5 w-5" />
          Add Classroom
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classroom-name">Classroom Name</Label>
              <Input
                id="classroom-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter classroom name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classroom-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowView(!showView)}>
                {showView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                VIEW
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showView && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Existing Classrooms</CardTitle>
            </CardHeader>
            <CardContent>
              {classrooms.length === 0 ? (
                <p className="text-muted-foreground">No classrooms found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {classrooms.map((classroom) => (
                    <div key={classroom.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{classroom.name}</span>
                      <Badge variant={classroom.type === "lab" ? "secondary" : "default"}>{classroom.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

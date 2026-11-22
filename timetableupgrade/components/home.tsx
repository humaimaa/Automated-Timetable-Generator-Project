"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Plus, Zap, ArrowRight } from "lucide-react"
import BatchForm from "./batch-form"

interface HomeProps {
  onStart?: () => void
  onGenerateAll?: () => void
}

export default function Home({ onStart, onGenerateAll }: HomeProps) {
  const [showBatchForm, setShowBatchForm] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Calendar className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">Automatic Timetable Generator</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Welcome! Create and manage timetables for your institution with ease. Manage batches, sections, subjects,
            teachers, and classrooms, then generate and export professional timetables.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onStart}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit">
                <ArrowRight className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">Begin setting up your timetable system</p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setShowBatchForm(!showBatchForm)}
          >
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-green-100 rounded-full w-fit">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Add Batch</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">Create new batches for your institution</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onGenerateAll}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-purple-100 rounded-full w-fit">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Generate Timetable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">Automatically generate optimized timetables</p>
            </CardContent>
          </Card>
        </div>

        {/* Batch Form Modal */}
        {showBatchForm && (
          <div className="mt-8">
            <BatchForm onCreated={() => setShowBatchForm(false)} />
          </div>
        )}
      </div>
    </div>
  )
}

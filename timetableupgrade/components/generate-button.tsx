"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import api from "../services/api"

interface GenerateButtonProps {
  onGenerated?: () => void
}

export default function GenerateButton({ onGenerated }: GenerateButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [generationDetails, setGenerationDetails] = useState<any>(null)

  const handleGenerateAll = async () => {
    console.log("Starting timetable generation for ALL batches...")
    setLoading(true)
    setError("")
    setSuccess("")
    setGenerationDetails(null)

    try {
      // First, get all batches
      const batchesResponse = await api.get("/batches/")
      const batches: any[] = batchesResponse.data || []

      if (batches.length === 0) {
        setError("No batches found. Please add batches first.")
        setLoading(false)
        return
      }

      console.log(
        `Found ${batches.length} batches:`,
        batches.map((b: any) => b.name),
      )

      // Call the generate API for all batches. The GA can easily exceed 30 seconds, so give it 5 minutes.
      await api.post("/timetable/generate_all/", undefined, { timeout: 2400000 /* 40 min */ })
      console.log("Generation API POST sent. Now polling for new timetables...")

      // Poll for new timetables every 5 seconds, up to 10 minutes
      const pollIntervalMs = 5000
      const maxPollCycles = (10 * 60 * 1000) / pollIntervalMs // 120 cycles
      let pollCount = 0
      let foundNewTimetables = false
      let lastTimetableCount = 0
      while (pollCount < maxPollCycles && !foundNewTimetables) {
        try {
          const pollResponse = await api.get("/timetable/")
          const timetableData = pollResponse.data || []
          console.log(`[Polling] Timetables found: ${timetableData.length}`)
          if (timetableData.length > 0 && timetableData.length !== lastTimetableCount) {
            foundNewTimetables = true
            break
          }
          lastTimetableCount = timetableData.length
        } catch (pollErr) {
          console.log("Polling error:", pollErr)
        }
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
        pollCount++
      }

      if (foundNewTimetables) {
        setSuccess(`Successfully generated timetables for ${batches.length} batches!`)
        setGenerationDetails({
          batches_processed: batches.length,
          batch_names: batches.map((b: any) => b.name),
          timestamp: new Date().toISOString(),
        })
        if (onGenerated) {
          console.log("Calling onGenerated callback to refresh timetables display")
          onGenerated()
        }
      } else {
        setError("Timetable generation took too long or failed. Please refresh and try again.")
      }
    } catch (error) {
      console.error("Generation failed:", error)
      setError("Failed to generate timetables. Please check your backend connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Generate Timetables for All Batches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This will generate optimized timetables for all batches and sections in your system.
          </p>

          <Button onClick={handleGenerateAll} disabled={loading} size="lg" className="w-full flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Timetables...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Generate All Timetables
              </>
            )}
          </Button>

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {generationDetails && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-blue-900 mb-2">Generation Details:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Batches processed: {generationDetails.batches_processed}</li>
                  <li>• Batches: {generationDetails.batch_names.join(", ")}</li>
                  <li>• Generated at: {new Date(generationDetails.timestamp).toLocaleString()}</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

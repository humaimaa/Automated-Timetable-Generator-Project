"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar } from "lucide-react"
import ExportButtons from "./export-buttons"
import api from "../services/api"

interface TimetableEntry {
  day: number
  period: number
  subject: string
  subject_code?: string
  teacher: string
  classroom?: string
  section: string
  batch: string
}

interface BatchSection {
  batch_id: number
  batch_name: string
  section_name: string
  timetable: TimetableEntry[]
}

interface AllTimetablesDisplayProps {
  refreshTrigger?: number
}

const PERIOD_TIMINGS = {
  1: "08:00–09:30",
  2: "09:30–11:00",
  3: "11:00–12:30",
  4: "12:30–14:00",
  5: "14:00–15:30",
  6: "15:30–17:00",
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export default function AllTimetablesDisplay({ refreshTrigger }: AllTimetablesDisplayProps) {
  const [timetables, setTimetables] = useState<BatchSection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAllTimetables()
  }, [refreshTrigger])

  const fetchAllTimetables = async () => {
    setLoading(true)
    setError("")

    try {
      console.log("Fetching all generated timetables...")

      // Try to fetch all timetables at once - adjust this endpoint based on your backend
      // This could be something like /timetable/all/ or /timetables/
      // Changed to /timetable/ to match backend
      let allTimetablesData = []

      try {
        // First try to get all timetables from a single endpoint
        const allTimetablesResponse = await api.get("/timetable/")
        // DRF may return a paginated object { results: [...], count, next, previous }
        // Handle both array and paginated object formats
        const responsePayload = allTimetablesResponse.data

        if (Array.isArray(responsePayload)) {
          // Non-paginated list
          allTimetablesData = responsePayload
        } else if (responsePayload && Array.isArray(responsePayload.results)) {
          // Paginated response – collect all pages
          allTimetablesData = [...responsePayload.results]

          let nextUrl = responsePayload.next
          while (nextUrl) {
            try {
              // Axios with absolute URL works; we proxy through the same api instance to keep headers
              const nextResp = await api.get(nextUrl.replace(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api", ""))
              const nextPayload = nextResp.data
              if (nextPayload && Array.isArray(nextPayload.results)) {
                allTimetablesData.push(...nextPayload.results)
                nextUrl = nextPayload.next
              } else {
                // Unexpected format – break to avoid infinite loop
                nextUrl = null
              }
            } catch (pageErr) {
              console.warn("Failed to load paginated timetable page", pageErr)
              break
            }
          }
        } else {
          console.warn("Unexpected timetable payload format", responsePayload)
          allTimetablesData = []
        }
        console.log("Fetched all timetables:", allTimetablesData.length)
      } catch (singleEndpointError) {
        console.log("Single endpoint failed, trying alternative approach...")

        // If that fails, try the alternative approach
        const batchesResponse = await api.get("/batches/")
        const batches = batchesResponse.data || []

        if (batches.length === 0) {
          setTimetables([])
          setError("No batches found. Please add batches first.")
          return
        }

        // For each batch, get its timetable data
        for (const batch of batches) {
          try {
            // Try different possible endpoints for getting batch timetables
            let batchTimetables = []

            try {
              // Try /timetable/batch/{batch_id}/
              const batchResponse = await api.get(`/timetable/batch/${batch.id}/`)
              batchTimetables = batchResponse.data || []
            } catch (batchError) {
              try {
                // Try /timetable/{batch_id}/
                const altResponse = await api.get(`/timetable/${batch.id}/`)
                batchTimetables = altResponse.data || []
              } catch (altError) {
                console.log(`No timetables found for batch ${batch.name}`)
                continue
              }
            }

            // Add batch info to each timetable entry
            batchTimetables.forEach((entry: any) => {
              entry.batch = batch.name
              entry.batch_id = batch.id
            })

            allTimetablesData.push(...batchTimetables)
          } catch (batchError) {
            console.log(`Error fetching timetables for batch ${batch.name}:`, batchError)
          }
        }
      }

      if (allTimetablesData.length === 0) {
        setTimetables([])
        setError("No generated timetables found. Click 'Generate Timetable' to create them.")
        return
      }

      // Debug: log the fetched timetable data
      console.log("Fetched all timetables data:", allTimetablesData)

      // Group timetables by batch and section
      const groupedData: { [key: string]: BatchSection } = {}

      allTimetablesData.forEach((entry: any) => {
        const key = `${entry.batch_id || entry.batch}-${entry.section}`

        if (!groupedData[key]) {
          groupedData[key] = {
            batch_id: entry.batch_id || 0,
            batch_name: entry.batch || "Unknown Batch",
            section_name: entry.section || "Unknown Section",
            timetable: [],
          }
        }

        groupedData[key].timetable.push({
          day: entry.day,
          period: entry.period,
          subject: entry.subject,
          subject_code: entry.subject_code,
          teacher: entry.teacher,
          classroom: entry.classroom,
          section: entry.section,
          batch: entry.batch,
        })
      })

      const organizedTimetables = Object.values(groupedData)
      setTimetables(organizedTimetables)
      console.log(`Organized timetables: ${organizedTimetables.length} sections`)
    } catch (err) {
      console.error("Error fetching timetables:", err)
      setError("Failed to load timetables from database. Make sure timetables are generated first.")
      setTimetables([])
    } finally {
      setLoading(false)
    }
  }

  const renderTimetableGrid = (timetableData: TimetableEntry[]) => {
    // Group by day and period
    const periods = [1, 2, 3, 4, 5, 6]
    const table: Record<number, Record<number, TimetableEntry>> = {}

    timetableData.forEach((entry) => {
      if (!table[entry.day]) table[entry.day] = {}
      table[entry.day][entry.period] = entry
    })

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-semibold bg-muted/50">Day</th>
              {periods.map((period) => (
                <th key={period} className="text-center p-3 font-semibold bg-muted/50 min-w-[140px]">
                  <div className="text-blue-600">P{period}</div>
                  <div className="text-xs text-muted-foreground font-normal">
                    {PERIOD_TIMINGS[period as keyof typeof PERIOD_TIMINGS]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, dayIndex) => (
              <tr key={day} className="border-b hover:bg-muted/20">
                <td className="p-3 font-semibold text-primary bg-muted/30">{day}</td>
                {periods.map((period) => (
                  <td key={period} className="p-3 border-l text-center">
                    {table[dayIndex] && table[dayIndex][period] ? (
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {table[dayIndex][period].subject_code && (
                            <div className="text-blue-600 font-semibold">
                              [{table[dayIndex][period].subject_code}] {table[dayIndex][period].subject}
                            </div>
                          )}
                          {!table[dayIndex][period].subject_code && (
                            <div className="text-blue-600 font-semibold">{table[dayIndex][period].subject}</div>
                          )}
                        </div>
                        <div className="text-sm text-gray-700">{table[dayIndex][period].teacher}</div>
                        {table[dayIndex][period].classroom && (
                          <div className="text-sm text-gray-600">{table[dayIndex][period].classroom}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Group timetables by batch
  const groupedTimetables = timetables.reduce(
    (acc, item) => {
      const key = `${item.batch_id}-${item.batch_name}`
      if (!acc[key]) {
        acc[key] = {
          batch_id: item.batch_id,
          batch_name: item.batch_name,
          sections: [],
        }
      }
      acc[key].sections.push(item)
      return acc
    },
    {} as Record<string, { batch_id: number; batch_name: string; sections: BatchSection[] }>,
  )

  // Debug: log the grouped timetables before rendering
  console.log("Grouped timetables:", groupedTimetables)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading timetables from database...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground italic">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (Object.keys(groupedTimetables).length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground italic">
            No timetables generated yet. Click "Generate Timetable" to create them.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6" />
            All Generated Timetables ({timetables.length} sections)
          </CardTitle>
        </CardHeader>
      </Card>

      {Object.values(groupedTimetables).map((batch) => (
        <div key={`${batch.batch_id}-${batch.batch_name}`} className="space-y-6">
          <div className="text-xl font-bold text-gray-800">{batch.batch_name}</div>

          {batch.sections.map((section) => (
            <div key={`${batch.batch_id}-${section.section_name}`} className="space-y-4">
              <div className="text-lg font-semibold text-gray-700">Section {section.section_name}</div>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Section Timetable ({section.timetable.length} periods)
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderTimetableGrid(section.timetable)}</CardContent>
              </Card>

              <ExportButtons type="section" id={`${batch.batch_id}-${section.section_name}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

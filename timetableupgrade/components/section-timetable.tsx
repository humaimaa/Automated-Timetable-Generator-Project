"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, MapPin } from "lucide-react"

interface TimetableEntry {
  day: number
  period: number
  subject: string
  subject_code?: string
  teacher: string
  classroom?: string
}

interface SectionTimetableProps {
  timetable: TimetableEntry[]
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

export default function SectionTimetable({ timetable }: SectionTimetableProps) {
  if (!timetable || timetable.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground italic">No timetable data available.</p>
        </CardContent>
      </Card>
    )
  }

  // Group by day and period
  const periods = [1, 2, 3, 4, 5, 6]
  const table: Record<number, Record<number, TimetableEntry>> = {}

  timetable.forEach((entry) => {
    if (!table[entry.day]) table[entry.day] = {}
    table[entry.day][entry.period] = entry
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Section Timetable
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold bg-muted/50">Day</th>
                {periods.map((period) => (
                  <th key={period} className="text-center p-3 font-semibold bg-muted/50 min-w-[140px]">
                    <div>Period {period}</div>
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
                    <td key={period} className="p-3 border-l">
                      {table[dayIndex] && table[dayIndex][period] ? (
                        <div className="space-y-2">
                          <div className="font-medium text-sm">
                            {table[dayIndex][period].subject_code && (
                              <Badge variant="outline" className="mr-1 text-xs">
                                {table[dayIndex][period].subject_code}
                              </Badge>
                            )}
                            {table[dayIndex][period].subject}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {table[dayIndex][period].teacher}
                          </div>
                          {table[dayIndex][period].classroom && (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <MapPin className="h-3 w-3" />
                              {table[dayIndex][period].classroom}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

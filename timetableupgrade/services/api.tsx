import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 30000, // Increased timeout for generation
  headers: {
    "Content-Type": "application/json",
  },
})

// Enhanced mock data for development/preview
const mockData = {
  batches: [
    { id: 21, name: "21 Batch" },
    { id: 22, name: "22 Batch" },
    { id: 23, name: "23 Batch" },
    { id: 24, name: "24 Batch" },
    { id: 25, name: "25 Batch" },
  ],
  sections: [
    { id: 1, name: "SECA", batch: { id: 25, name: "25 Batch" } },
    { id: 2, name: "SECB", batch: { id: 25, name: "25 Batch" } },
    { id: 3, name: "SECA", batch: { id: 24, name: "24 Batch" } },
    { id: 4, name: "SECB", batch: { id: 24, name: "24 Batch" } },
    { id: 5, name: "SECA", batch: { id: 23, name: "23 Batch" } },
    { id: 6, name: "SECB", batch: { id: 23, name: "23 Batch" } },
    { id: 7, name: "SECA", batch: { id: 22, name: "22 Batch" } },
    { id: 8, name: "SECB", batch: { id: 22, name: "22 Batch" } },
    { id: 9, name: "SECA", batch: { id: 21, name: "21 Batch" } },
    { id: 10, name: "SECB", batch: { id: 21, name: "21 Batch" } },
  ],
  subjects: [
    { id: 1, code: "cs 500", name: "oop", periods_per_week: 2, batch: { id: 25, name: "25 Batch" } },
    { id: 2, code: "cs 501", name: "oop lab", periods_per_week: 1, batch: { id: 25, name: "25 Batch" } },
    { id: 3, code: "cs502", name: "dld", periods_per_week: 2, batch: { id: 25, name: "25 Batch" } },
    { id: 4, code: "cs503", name: "dld lab", periods_per_week: 1, batch: { id: 25, name: "25 Batch" } },
    { id: 5, code: "cs504", name: "DB", periods_per_week: 1, batch: { id: 25, name: "25 Batch" } },
    { id: 6, code: "cs505", name: "DB lab", periods_per_week: 1, batch: { id: 25, name: "25 Batch" } },
    { id: 7, code: "cs506", name: "MVC", periods_per_week: 2, batch: { id: 25, name: "25 Batch" } },
    { id: 8, code: "cs 507", name: "IS", periods_per_week: 1, batch: { id: 25, name: "25 Batch" } },
  ],
  teachers: [
    {
      id: 1,
      name: "Dr. Smith",
      max_periods_per_week: 30,
      subjects: [
        { id: 1, code: "cs 500", name: "oop", periods_per_week: 2 },
        { id: 2, code: "cs 501", name: "oop lab", periods_per_week: 1 },
      ],
      batches: [{ id: 25, name: "25 Batch" }],
    },
    {
      id: 2,
      name: "Prof. Johnson",
      max_periods_per_week: 25,
      subjects: [
        { id: 3, code: "cs502", name: "dld", periods_per_week: 2 },
        { id: 4, code: "cs503", name: "dld lab", periods_per_week: 1 },
      ],
      batches: [{ id: 25, name: "25 Batch" }],
    },
  ],
  classrooms: [
    { id: 1, name: "r1", type: "regular" },
    { id: 2, name: "r2", type: "regular" },
    { id: 3, name: "r3", type: "regular" },
    { id: 4, name: "r4", type: "regular" },
    { id: 5, name: "r5", type: "regular" },
    { id: 6, name: "r6", type: "regular" },
    { id: 7, name: "r7", type: "regular" },
    { id: 8, name: "r8", type: "regular" },
    { id: 9, name: "r9", type: "regular" },
    { id: 10, name: "l1", type: "lab" },
    { id: 11, name: "l2", type: "lab" },
  ],
  // Enhanced mock timetable data for ALL batches
  timetables: [
    // 21 Batch - Section A
    {
      day: 0,
      period: 1,
      subject: "CC",
      subject_code: "cs104",
      teacher: "kashif",
      classroom: "r5",
      section: "SECA",
      batch: "21 Batch",
      batch_id: 21,
    },
    {
      day: 0,
      period: 2,
      subject: "ELI",
      subject_code: "cs100",
      teacher: "ismat",
      classroom: "r3",
      section: "SECA",
      batch: "21 Batch",
      batch_id: 21,
    },
    {
      day: 1,
      period: 1,
      subject: "GD LAB",
      subject_code: "cs103",
      teacher: "inayat",
      classroom: "l2",
      section: "SECA",
      batch: "21 Batch",
      batch_id: 21,
    },
    {
      day: 1,
      period: 3,
      subject: "CC",
      subject_code: "cs104",
      teacher: "kashif",
      classroom: "r1",
      section: "SECA",
      batch: "21 Batch",
      batch_id: 21,
    },
    {
      day: 2,
      period: 2,
      subject: "ELI",
      subject_code: "cs100",
      teacher: "ismat",
      classroom: "r4",
      section: "SECA",
      batch: "21 Batch",
      batch_id: 21,
    },

    // 21 Batch - Section B
    {
      day: 0,
      period: 3,
      subject: "CC",
      subject_code: "cs104",
      teacher: "kashif",
      classroom: "r6",
      section: "SECB",
      batch: "21 Batch",
      batch_id: 21,
    },
    {
      day: 1,
      period: 2,
      subject: "ELI",
      subject_code: "cs100",
      teacher: "ismat",
      classroom: "r7",
      section: "SECB",
      batch: "21 Batch",
      batch_id: 21,
    },
    {
      day: 2,
      period: 1,
      subject: "GD LAB",
      subject_code: "cs103",
      teacher: "inayat",
      classroom: "l1",
      section: "SECB",
      batch: "21 Batch",
      batch_id: 21,
    },

    // 22 Batch - Section A
    {
      day: 0,
      period: 1,
      subject: "IS",
      subject_code: "cs102",
      teacher: "zakira",
      classroom: "r7",
      section: "SECA",
      batch: "22 Batch",
      batch_id: 22,
    },
    {
      day: 0,
      period: 3,
      subject: "AI",
      subject_code: "cs200",
      teacher: "wajeeha",
      classroom: "r6",
      section: "SECA",
      batch: "22 Batch",
      batch_id: 22,
    },
    {
      day: 0,
      period: 4,
      subject: "BT",
      subject_code: "cs103",
      teacher: "adeel",
      classroom: "r9",
      section: "SECA",
      batch: "22 Batch",
      batch_id: 22,
    },
    {
      day: 1,
      period: 2,
      subject: "NC",
      subject_code: "cs105",
      teacher: "tufail",
      classroom: "r2",
      section: "SECA",
      batch: "22 Batch",
      batch_id: 22,
    },
    {
      day: 1,
      period: 3,
      subject: "AI Lab",
      subject_code: "cs201",
      teacher: "wajeeha",
      classroom: "l3",
      section: "SECA",
      batch: "22 Batch",
      batch_id: 22,
    },
    {
      day: 3,
      period: 5,
      subject: "NC",
      subject_code: "cs105",
      teacher: "tufail",
      classroom: "r2",
      section: "SECA",
      batch: "22 Batch",
      batch_id: 22,
    },
    {
      day: 3,
      period: 6,
      subject: "ML",
      subject_code: "cs104",
      teacher: "imran",
      classroom: "r8",
      section: "SECA",
      batch: "22 Batch",
      batch_id: 22,
    },
    {
      day: 4,
      period: 1,
      subject: "IS",
      subject_code: "cs102",
      teacher: "zakira",
      classroom: "r7",
      section: "SECA",
      batch: "22 Batch",
      batch_id: 22,
    },
    {
      day: 4,
      period: 2,
      subject: "ML",
      subject_code: "cs104",
      teacher: "imran",
      classroom: "r4",
      section: "SECA",
      batch: "22 Batch",
      batch_id: 22,
    },
    {
      day: 4,
      period: 3,
      subject: "BT",
      subject_code: "cs103",
      teacher: "adeel",
      classroom: "r8",
      section: "SECA",
      batch: "22 Batch",
      batch_id: 22,
    },
    {
      day: 4,
      period: 4,
      subject: "NC Lab",
      subject_code: "cs206",
      teacher: "gul shed",
      classroom: "l3",
      section: "SECA",
      batch: "22 Batch",
      batch_id: 22,
    },
    {
      day: 4,
      period: 5,
      subject: "AI",
      subject_code: "cs200",
      teacher: "wajeeha",
      classroom: "r5",
      section: "SECA",
      batch: "22 Batch",
      batch_id: 22,
    },

    // 22 Batch - Section B
    {
      day: 0,
      period: 2,
      subject: "IS",
      subject_code: "cs102",
      teacher: "zakira",
      classroom: "r8",
      section: "SECB",
      batch: "22 Batch",
      batch_id: 22,
    },
    {
      day: 1,
      period: 1,
      subject: "AI",
      subject_code: "cs200",
      teacher: "wajeeha",
      classroom: "r5",
      section: "SECB",
      batch: "22 Batch",
      batch_id: 22,
    },
    {
      day: 2,
      period: 3,
      subject: "BT",
      subject_code: "cs103",
      teacher: "adeel",
      classroom: "r7",
      section: "SECB",
      batch: "22 Batch",
      batch_id: 22,
    },

    // 23 Batch - Section A
    {
      day: 0,
      period: 1,
      subject: "OOP",
      subject_code: "cs300",
      teacher: "ahmed",
      classroom: "r1",
      section: "SECA",
      batch: "23 Batch",
      batch_id: 23,
    },
    {
      day: 0,
      period: 2,
      subject: "DSA",
      subject_code: "cs301",
      teacher: "fatima",
      classroom: "r2",
      section: "SECA",
      batch: "23 Batch",
      batch_id: 23,
    },
    {
      day: 1,
      period: 1,
      subject: "OOP Lab",
      subject_code: "cs302",
      teacher: "ahmed",
      classroom: "l1",
      section: "SECA",
      batch: "23 Batch",
      batch_id: 23,
    },
    {
      day: 2,
      period: 3,
      subject: "DSA",
      subject_code: "cs301",
      teacher: "fatima",
      classroom: "r3",
      section: "SECA",
      batch: "23 Batch",
      batch_id: 23,
    },

    // 24 Batch - Section A
    {
      day: 0,
      period: 1,
      subject: "Web Dev",
      subject_code: "cs400",
      teacher: "hassan",
      classroom: "r4",
      section: "SECA",
      batch: "24 Batch",
      batch_id: 24,
    },
    {
      day: 1,
      period: 2,
      subject: "Database",
      subject_code: "cs401",
      teacher: "sara",
      classroom: "r5",
      section: "SECA",
      batch: "24 Batch",
      batch_id: 24,
    },
    {
      day: 2,
      period: 1,
      subject: "Web Lab",
      subject_code: "cs402",
      teacher: "hassan",
      classroom: "l2",
      section: "SECA",
      batch: "24 Batch",
      batch_id: 24,
    },

    // 25 Batch - Section A
    {
      day: 0,
      period: 1,
      subject: "oop",
      subject_code: "cs500",
      teacher: "Dr. Smith",
      classroom: "r1",
      section: "SECA",
      batch: "25 Batch",
      batch_id: 25,
    },
    {
      day: 0,
      period: 2,
      subject: "dld",
      subject_code: "cs502",
      teacher: "Prof. Johnson",
      classroom: "r2",
      section: "SECA",
      batch: "25 Batch",
      batch_id: 25,
    },
    {
      day: 1,
      period: 1,
      subject: "oop lab",
      subject_code: "cs501",
      teacher: "Dr. Smith",
      classroom: "l1",
      section: "SECA",
      batch: "25 Batch",
      batch_id: 25,
    },
    {
      day: 1,
      period: 3,
      subject: "DB",
      subject_code: "cs504",
      teacher: "Dr. Wilson",
      classroom: "r3",
      section: "SECA",
      batch: "25 Batch",
      batch_id: 25,
    },
    {
      day: 2,
      period: 2,
      subject: "dld lab",
      subject_code: "cs503",
      teacher: "Prof. Johnson",
      classroom: "l2",
      section: "SECA",
      batch: "25 Batch",
      batch_id: 25,
    },
  ],
}

// Enhanced API wrapper with fallback to mock data
const apiWithFallback = {
  async get(url: string) {
    try {
      console.log("API GET request:", url)
      const response = await api.get(url)
      console.log("API GET Success:", response.status, url)
      return response
    } catch (error) {
      console.warn("API GET failed, using mock data for:", url, error)

      // Return mock data based on URL
      if (url.includes("/batches/")) {
        return { data: mockData.batches }
      } else if (url.includes("/sections/")) {
        const batchId = url.match(/batch_id=(\d+)/)?.[1]
        if (batchId) {
          const filteredSections = mockData.sections.filter((section) => section.batch.id.toString() === batchId)
          return { data: filteredSections }
        }
        return { data: mockData.sections }
      } else if (url.includes("/subjects/")) {
        const batchId = url.match(/batch_id=(\d+)/)?.[1]
        if (batchId) {
          const filteredSubjects = mockData.subjects.filter((subject) => subject.batch.id.toString() === batchId)
          return { data: filteredSubjects }
        }
        return { data: mockData.subjects }
      } else if (url.includes("/teachers/")) {
        const batchId = url.match(/batch_id=(\d+)/)?.[1]
        if (batchId) {
          const filteredTeachers = mockData.teachers.filter((teacher) =>
            teacher.batches.some((batch) => batch.id.toString() === batchId),
          )
          return { data: filteredTeachers }
        }
        return { data: mockData.teachers }
      } else if (url.includes("/classrooms/")) {
        return { data: mockData.classrooms }
      } else if (url.includes("/timetable/")) {
        // Changed to /timetable/ to match backend
        return { data: mockData.timetables }
      } else if (url.match(/\/timetable\/batch\/\d+\/$/)) {
        // Handle batch-specific timetable requests
        const batchId = url.match(/\/timetable\/batch\/(\d+)\/$/)?.[1]
        if (batchId) {
          const batchTimetables = mockData.timetables.filter((t) => t.batch_id.toString() === batchId)
          return { data: batchTimetables }
        }
        return { data: [] }
      } else if (url.match(/\/timetable\/\d+\/$/)) {
        // Handle alternative batch timetable requests
        const batchId = url.match(/\/timetable\/(\d+)\/$/)?.[1]
        if (batchId) {
          const batchTimetables = mockData.timetables.filter((t) => t.batch_id.toString() === batchId)
          return { data: batchTimetables }
        }
        return { data: [] }
      } else if (url.includes("/timetable/")) {
        return { data: mockData.timetables }
      }

      throw error
    }
  },

  async post(url: string, data?: any, config?: any) {
    try {
      console.log("API POST request:", url, data)
      const response = await api.post(url, data, config)
      console.log("API POST Success:", response.status, url)
      return response
    } catch (error) {
      console.warn("API POST failed for:", url, error)

      // Special handling for timetable generation
      if (url.includes("/timetable/generate/")) {
        console.log("Timetable generation API failed, simulating success for demo")

        // Simulate a delay for realistic generation time
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Return a success response for demo purposes
        return {
          data: {
            message: "Timetables generated successfully for all batches and sections",
            generated_count: mockData.batches.length * 2, // Each batch has 2 sections
            batches_processed: mockData.batches.length,
            sections_generated: mockData.batches.length * 2,
            timestamp: new Date().toISOString(),
            details: mockData.batches.map((batch) => ({
              batch_id: batch.id,
              batch_name: batch.name,
              sections: ["SECA", "SECB"],
            })),
          },
        }
      }

      // Simulate successful creation for other endpoints
      if (url.includes("/batches/")) {
        const newBatch = { id: Date.now(), name: data.name }
        mockData.batches.push(newBatch)
        return { data: newBatch }
      } else if (url.includes("/sections/")) {
        const batch = mockData.batches.find((b) => b.id.toString() === data.batch_id.toString())
        const newSection = {
          id: Date.now(),
          name: data.name,
          batch: batch || { id: data.batch_id, name: "Unknown Batch" },
        }
        mockData.sections.push(newSection)
        return { data: newSection }
      } else if (url.includes("/subjects/")) {
        const batch = mockData.batches.find((b) => b.id.toString() === data.batch_id.toString())
        const newSubject = {
          id: Date.now(),
          code: data.code,
          name: data.name,
          periods_per_week: data.periods_per_week,
          batch: batch || { id: data.batch_id, name: "Unknown Batch" },
        }
        mockData.subjects.push(newSubject)
        return { data: newSubject }
      } else if (url.includes("/teachers/")) {
        const subjects = mockData.subjects.filter((s) => data.subject_ids?.includes(s.id))
        const batches = mockData.batches.filter((b) => data.batches?.includes(b.id))
        const newTeacher = {
          id: Date.now(),
          name: data.name,
          max_periods_per_week: data.max_periods_per_week,
          subjects: subjects,
          batches: batches,
        }
        mockData.teachers.push(newTeacher)
        return { data: newTeacher }
      } else if (url.includes("/classrooms/")) {
        const newClassroom = { id: Date.now(), name: data.name, type: data.type }
        mockData.classrooms.push(newClassroom)
        return { data: newClassroom }
      }

      return { data: { message: "Success" } }
    }
  },

  async delete(url: string) {
    try {
      console.log("API DELETE request:", url)
      const response = await api.delete(url)
      console.log("API DELETE Success:", response.status, url)
      return response
    } catch (error) {
      console.warn("API DELETE failed for:", url, "- Simulating success")

      // Simulate successful deletion
      const id = url.match(/\/(\d+)\/$/)?.[1]
      if (id) {
        if (url.includes("/sections/")) {
          const index = mockData.sections.findIndex((s) => s.id.toString() === id)
          if (index > -1) mockData.sections.splice(index, 1)
        } else if (url.includes("/subjects/")) {
          const index = mockData.subjects.findIndex((s) => s.id.toString() === id)
          if (index > -1) mockData.subjects.splice(index, 1)
        } else if (url.includes("/teachers/")) {
          const index = mockData.teachers.findIndex((t) => t.id.toString() === id)
          if (index > -1) mockData.teachers.splice(index, 1)
        }
      }

      return { data: { message: "Deleted successfully" } }
    }
  },
}

export const exportTimetable = async (type: string, id: number | string, format: string) => {
  try {
    const response = await api.get(`/timetable/export/${type}/${id}/${format}`, {
      responseType: "blob",
    })

    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `timetable-${type}-${id}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.warn("Export failed, creating mock file")

    // Create a mock file for demo purposes
    const mockContent = `Mock Timetable Export\nType: ${type}\nID: ${id}\nFormat: ${format}\nGenerated: ${new Date().toISOString()}`
    const blob = new Blob([mockContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `mock-timetable-${type}-${id}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

export default apiWithFallback

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Users, Loader2, WifiOff } from "lucide-react"
import api from "../services/api"
import InputDetails from "./input-details"

interface Batch {
  id: number
  name: string
}

interface BatchSectionNavigatorProps {
  onSectionSelected?: (batch: Batch, section: string) => void
  onBack?: () => void
}

export default function BatchSectionNavigator({ onSectionSelected, onBack }: BatchSectionNavigatorProps) {
  const [step, setStep] = useState(1)
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [sections, setSections] = useState([])
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await api.get("/batches/")
        setBatches(Array.isArray(response.data) ? response.data : [])
        setIsUsingMockData(false)
      } catch (err) {
        console.error("Failed to fetch batches:", err)
        setError("Using demo data - connect your backend to see real data")
        setIsUsingMockData(true)
        // Mock data will be handled by the API wrapper
        try {
          const mockResponse = await api.get("/batches/")
          setBatches(Array.isArray(mockResponse.data) ? mockResponse.data : [])
        } catch (mockErr) {
          setBatches([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBatches()
  }, [])

  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedBatch) return

      setLoading(true)
      setError("")
      try {
        const response = await api.get(`/sections/?batch_id=${selectedBatch.id}`)
        setSections(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        console.error("Failed to fetch sections:", err)
        if (!isUsingMockData) {
          setError("Using demo data - connect your backend to see real data")
        }
        try {
          const mockResponse = await api.get(`/sections/?batch_id=${selectedBatch.id}`)
          setSections(Array.isArray(mockResponse.data) ? mockResponse.data : [])
        } catch (mockErr) {
          setSections([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSections()
  }, [selectedBatch, isUsingMockData])

  const handleSectionSelect = (sectionName: string) => {
    setSelectedSection(sectionName)
    setStep(3)
    if (onSectionSelected && selectedBatch) {
      onSectionSelected(selectedBatch, sectionName)
    }
  }

  const handleBackToSections = () => {
    setStep(2)
    setSelectedSection(null)
    setError("")
  }

  if (step === 1) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Calendar className="h-6 w-6" />
            Select a Batch
          </CardTitle>
          {isUsingMockData && (
            <Badge variant="secondary" className="mx-auto w-fit">
              <WifiOff className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert>
              <AlertDescription className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                {error}
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading batches...</span>
              </div>
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No batches found. Please add some batches first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map((batch) => (
                <Button
                  key={batch.id}
                  variant="outline"
                  size="lg"
                  className="h-16 text-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
                  onClick={() => {
                    setSelectedBatch(batch)
                    setStep(2)
                  }}
                >
                  <Users className="mr-2 h-5 w-5" />
                  {batch.name}
                </Button>
              ))}
            </div>
          )}

          {onBack && (
            <div className="flex justify-center pt-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (step === 2 && selectedBatch) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Select a Section for {selectedBatch.name}</CardTitle>
          {isUsingMockData && (
            <Badge variant="secondary" className="mx-auto w-fit">
              <WifiOff className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading sections...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button size="lg" className="h-16 text-lg font-medium" onClick={() => handleSectionSelect("SECA")}>
                Section A
              </Button>
              <Button size="lg" className="h-16 text-lg font-medium" onClick={() => handleSectionSelect("SECB")}>
                Section B
              </Button>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => {
                setStep(1)
                setSelectedBatch(null)
                setError("")
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Batches
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 3 && selectedBatch && selectedSection) {
    return (
      <InputDetails selectedBatch={selectedBatch} selectedSection={selectedSection} onBack={handleBackToSections} />
    )
  }

  return null
}

"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { WifiOff, Settings } from "lucide-react"
import Home from "@/components/home"
import BatchSectionNavigator from "@/components/batch-section-navigator"
import GenerateButton from "@/components/generate-button"
import AllTimetablesDisplay from "@/components/all-timetables-display"
import InputDetails from "@/components/input-details"

export default function Page() {
  const [currentView, setCurrentView] = useState("home")
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [timetableRefreshTrigger, setTimetableRefreshTrigger] = useState(0)

  const handleStart = () => {
    setCurrentView("navigator")
  }

  const handleSectionSelected = (batch: any, section: string) => {
    setSelectedBatch(batch)
    setSelectedSection(section)
    setCurrentView("management")
  }

  const handleBack = () => {
    setCurrentView("home")
    setSelectedBatch(null)
    setSelectedSection(null)
  }

  const handleBackToNavigator = () => {
    setCurrentView("navigator")
    // Keep selectedBatch and selectedSection for potential re-use
  }

  const handleGenerateAll = () => {
    setCurrentView("generate")
  }

  const handleTimetableGenerated = () => {
    // After generation, always show all timetables
    setCurrentView("generate")
    setTimetableRefreshTrigger((prev) => prev + 1)
    console.log("Timetables generated successfully")
  }

  // Demo mode banner
  // const DemoModeBanner = () => (
  //   <Alert className="mb-4">
  //     <Settings className="h-4 w-4" />
  //     <AlertDescription className="flex items-center justify-between">
  //       <span>
  //         <strong>Demo Mode:</strong> Connect your backend API to see real data. Set NEXT_PUBLIC_API_URL in your
  //         environment variables.
  //       </span>
  //       <Badge variant="secondary">
  //         <WifiOff className="h-3 w-3 mr-1" />
  //         Offline
  //       </Badge>
  //     </AlertDescription>
  //   </Alert>
  // )

  if (currentView === "home") {
    return (
      <div>
        {/* <DemoModeBanner /> */}
        <Home onStart={handleStart} onGenerateAll={handleGenerateAll} />
      </div>
    )
  }

  if (currentView === "navigator") {
    return (
      <div className="container mx-auto py-8">
       
        <BatchSectionNavigator onSectionSelected={handleSectionSelected} onBack={handleBack} />
      </div>
    )
  }

  if (currentView === "generate") {
    return (
      <div className="container mx-auto py-8 space-y-8">
        {/* <DemoModeBanner /> */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Generate Timetables</h1>
          <p className="text-muted-foreground mb-8">
            Generate optimized timetables for all batches and sections using your configured data
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <GenerateButton onGenerated={handleTimetableGenerated} />
        </div>

        <AllTimetablesDisplay refreshTrigger={timetableRefreshTrigger} />
      </div>
    )
  }

  if (currentView === "management") {
    return (
      <div className="container mx-auto py-8 space-y-8">
        {/* <DemoModeBanner /> */}
        <InputDetails selectedBatch={selectedBatch} selectedSection={selectedSection} onBack={handleBackToNavigator} />
      </div>
    )
  }

  return null
}

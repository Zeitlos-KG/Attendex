"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download, Info } from "lucide-react"

export default function ExcelUploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [year, setYear] = useState('')
    const [subgroup, setSubgroup] = useState('')
    const [uploading, setUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [uploadMessage, setUploadMessage] = useState('')
    const [recordsImported, setRecordsImported] = useState(0)

    const subgroups = {
        1: ['1A11', '1A12', '1A13', '1A14', '1A15', '1A16', '1A17', '1A18'],
        2: ['2A11', '2A12', '2A13', '2A14', '2A15', '2A16', '2A17', '2A18'],
        3: ['3A11', '3A12', '3A13', '3A14', '3A15', '3A16', '3A17', '3A18'],
        4: ['4A11', '4A12', '4A13', '4A14', '4A15', '4A16', '4A17', '4A18'],
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            // Check if it's an Excel file
            const validTypes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                '.xlsx',
                '.xls'
            ]

            const isValid = validTypes.some(type =>
                selectedFile.type === type || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')
            )

            if (isValid) {
                setFile(selectedFile)
                setUploadStatus('idle')
            } else {
                alert('Please select a valid Excel file (.xlsx or .xls)')
            }
        }
    }

    const handleUpload = async () => {
        if (!file || !year || !subgroup) {
            alert('Please select a file, year, and subgroup')
            return
        }

        setUploading(true)
        setUploadStatus('idle')

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('year', year)
            formData.append('subgroup', subgroup)

            // TODO: Replace with actual API endpoint
            const response = await fetch('http://localhost:5000/api/upload-timetable', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                const data = await response.json()
                setUploadStatus('success')
                setUploadMessage(`Successfully imported timetable for ${subgroup}`)
                setRecordsImported(data.records_count || 0)
                setFile(null)
                setYear('')
                setSubgroup('')
            } else {
                const error = await response.json()
                setUploadStatus('error')
                setUploadMessage(error.message || 'Failed to upload timetable')
            }
        } catch (error) {
            console.error('Upload error:', error)
            setUploadStatus('error')
            setUploadMessage('Failed to upload file. Make sure the backend is running.')
        } finally {
            setUploading(false)
        }
    }

    const downloadTemplate = () => {
        // Create a sample Excel template
        const templateData = `Year,Subgroup,Subject Code,Subject Name,Day,Start Time,End Time,Type,Room,Instructor
1,1A11,UPH013P,Physics,Monday,09:40,10:30,Class,LT-201,Dr. Sharma
1,1A11,UHU003P,Engineering Graphics,Monday,11:20,12:10,Lab,Lab-301,Prof. Kumar
1,1A11,LP101,Liberal Practice,Monday,14:40,15:30,Class,CR-105,Dr. Singh`

        const blob = new Blob([templateData], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'timetable_template.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    const availableSubgroups = year ? subgroups[year as keyof typeof subgroups] || [] : []

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-8">
                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">Upload Timetable</h1>
                        <p className="text-muted-foreground">
                            Import timetables from Excel for your subgroup
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-primary mt-0.5" />
                            <div className="space-y-3">
                                <h3 className="font-semibold text-foreground">How to prepare your Excel file:</h3>
                                <ol className="text-sm text-muted-foreground space-y-2 ml-4 list-decimal">
                                    <li>Download the template below to see the required format</li>
                                    <li>Fill in your timetable data with these columns:
                                        <ul className="ml-4 mt-1 list-disc">
                                            <li><strong>Year</strong>: 1, 2, 3, or 4</li>
                                            <li><strong>Subgroup</strong>: 1A11, 1A12, etc.</li>
                                            <li><strong>Subject Code</strong>: UPH013P, UMA023T, etc.</li>
                                            <li><strong>Subject Name</strong>: Physics, Mathematics, etc.</li>
                                            <li><strong>Day</strong>: Monday, Tuesday, ..., Sunday</li>
                                            <li><strong>Start Time</strong>: 09:40 (24-hour format)</li>
                                            <li><strong>End Time</strong>: 10:30 (24-hour format)</li>
                                            <li><strong>Type</strong>: Class, Tutorial, or Lab</li>
                                            <li><strong>Room</strong> (Optional): LT-201, Lab-301, etc.</li>
                                            <li><strong>Instructor</strong> (Optional): Teacher name</li>
                                        </ul>
                                    </li>
                                    <li>Save as .xlsx or .xls file</li>
                                    <li>Upload below</li>
                                </ol>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadTemplate}
                                    className="mt-3"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Template
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Upload Form */}
                    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-6">
                        {/* Year Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Select value={year} onValueChange={(value) => { setYear(value); setSubgroup(''); }}>
                                <SelectTrigger className="h-11 bg-muted/50 border-border">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1st Year</SelectItem>
                                    <SelectItem value="2">2nd Year</SelectItem>
                                    <SelectItem value="3">3rd Year</SelectItem>
                                    <SelectItem value="4">4th Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Subgroup Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="subgroup">Subgroup</Label>
                            {year ? (
                                <Select value={subgroup} onValueChange={setSubgroup}>
                                    <SelectTrigger className="h-11 bg-muted/50 border-border">
                                        <SelectValue placeholder="Select subgroup" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSubgroups.map((sg) => (
                                            <SelectItem key={sg} value={sg}>
                                                {sg}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="h-11 rounded-lg bg-secondary/30 border border-border/50 flex items-center px-3 text-sm text-muted-foreground">
                                    Please select a year first
                                </div>
                            )}
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="file">Excel File</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="h-11 bg-muted/50 border-border file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                />
                                {file && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <FileSpreadsheet className="h-4 w-4" />
                                        <span className="truncate max-w-xs">{file.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upload Button */}
                        <Button
                            onClick={handleUpload}
                            disabled={!file || !year || !subgroup || uploading}
                            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? 'Uploading...' : 'Upload Timetable'}
                        </Button>
                    </div>

                    {/* Status Messages */}
                    {uploadStatus === 'success' && (
                        <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-success flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <div>
                                <p className="font-medium">{uploadMessage}</p>
                                <p className="text-sm mt-1">Imported {recordsImported} timetable entries</p>
                            </div>
                        </div>
                    )}

                    {uploadStatus === 'error' && (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle className="h-5 w-5" />
                            <div>
                                <p className="font-medium">Upload Failed</p>
                                <p className="text-sm mt-1">{uploadMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Note about backend */}
                    <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                            <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">Note:</strong> Make sure your Flask backend is running with the Excel upload endpoint enabled.
                                Currently testing mode - check the console for any errors.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

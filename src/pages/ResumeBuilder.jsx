import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    FileText, Download, ChevronLeft,
    Wand2, Loader2, RotateCw, Trash2
} from 'lucide-react'
import axios from 'axios'
import ResumePreview from '../components/ResumePreview'

const API_BASE_URL = 'http://localhost:5000/api'

// Data sanitization helpers
const safe = (val, fallback) => val !== undefined && val !== null ? val : fallback
const safeArray = (val) => Array.isArray(val) ? val : []
const safeString = (val) => typeof val === 'string' ? val : ''

export default function ResumeBuilder() {
    const navigate = useNavigate()
    const [isGenerating, setIsGenerating] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [regeneratingSection, setRegeneratingSection] = useState(null)

    // Aggregated Raw Data (from /data)
    const [userRawData, setUserRawData] = useState(null)

    // Generated Resume Content (from /generate)
    const [resumeData, setResumeData] = useState({
        versionName: 'My Professional Resume',
        template: 'professional',
        summary: 'Click "Generate Resume" to let AI create your professional story based on your profile and skills.',
        experience: [],
        education: [],
        skills: [],
        masteredSkills: [],
        projects: [],
        certificates: []
    })

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        setIsLoadingData(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`${API_BASE_URL}/resume/data`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            // Store full raw response directly (not response.data.profile)
            setUserRawData(response.data)

            // Check for saved resume in localStorage
            const savedResume = localStorage.getItem('lastGeneratedResume')

            if (savedResume) {
                try {
                    const parsed = JSON.parse(savedResume)
                    // Merge saved content with fresh profile data
                    setResumeData(prev => ({
                        ...prev,
                        ...parsed,
                        // Always refresh personal details from fresh API data
                        fullName: safeString(response.data.fullName),
                        email: safeString(response.data.email),
                        phoneNumber: safeString(response.data.phoneNumber),
                        location: `${safe(response.data.location?.city, '')}, ${safe(response.data.location?.state, '')}, ${safe(response.data.location?.country, '')}`.replace(/, ,/g, ',').replace(/^, |, $/g, ''),
                        github: safeString(response.data.github),
                        linkedin: safeString(response.data.linkedin),
                        portfolio: safeString(response.data.portfolio)
                    }))
                    console.log('✅ Loaded saved resume from localStorage')
                } catch (err) {
                    console.error('Failed to parse saved resume:', err)
                }
            } else {
                // No saved resume, just map basic profile info
                setResumeData(prev => ({
                    ...prev,
                    fullName: safeString(response.data.fullName),
                    email: safeString(response.data.email),
                    phoneNumber: safeString(response.data.phoneNumber),
                    location: `${safe(response.data.location?.city, '')}, ${safe(response.data.location?.state, '')}, ${safe(response.data.location?.country, '')}`.replace(/, ,/g, ',').replace(/^, |, $/g, ''),
                    github: safeString(response.data.github),
                    linkedin: safeString(response.data.linkedin),
                    portfolio: safeString(response.data.portfolio),
                    education: safeArray(response.data.education).map(e => ({
                        institution: safeString(e?.institution),
                        degree: safeString(e?.degree),
                        field: safeString(e?.field),
                        year: safeString(e?.year)
                    })),
                    experience: safeArray(response.data.experience),
                    masteredSkills: safeArray(response.data.masteredSkills).map(s => ({ name: safeString(s?.skill) })),
                    knownSkills: safeArray(response.data.knownSkills)
                }))
            }
        } catch (error) {
            console.error('Failed to fetch resume data:', error)
        } finally {
            setIsLoadingData(false)
        }
    }

    const saveToLocalStorage = (data) => {
        try {
            localStorage.setItem('lastGeneratedResume', JSON.stringify(data))
            console.log('💾 Saved resume to localStorage')
        } catch (err) {
            console.error('Failed to save to localStorage:', err)
        }
    }

    const handleClearResume = () => {
        if (confirm('Clear saved resume and start fresh? This cannot be undone.')) {
            localStorage.removeItem('lastGeneratedResume')
            setResumeData({
                versionName: 'My Professional Resume',
                template: 'professional',
                summary: 'Click "Generate Resume" to let AI create your professional story based on your profile and skills.',
                experience: [],
                education: [],
                skills: [],
                masteredSkills: [],
                projects: [],
                certificates: [],
                fullName: userRawData?.fullName || '',
                email: userRawData?.email || '',
                phoneNumber: userRawData?.phoneNumber || '',
                location: userRawData?.location ? `${userRawData.location.city}, ${userRawData.location.state}, ${userRawData.location.country}`.replace(/, ,/g, ',') : '',
                github: userRawData?.github || '',
                linkedin: userRawData?.linkedin || '',
                portfolio: userRawData?.portfolio || ''
            })
            console.log('🗑️ Cleared saved resume')
        }
    }

    const handleGenerate = async () => {
        setIsGenerating(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${API_BASE_URL}/resume/generate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })

            // AI returns structured resume JSON - SANITIZE EVERYTHING
            const raw = response.data.resume || {}

            const sanitized = {
                summary: safeString(raw.summary),
                education: safeArray(raw.education).map(e => ({
                    institution: safeString(e?.institution),
                    degree: safeString(e?.degree),
                    field: safeString(e?.field),
                    year: safeString(e?.year)
                })),
                experience: safeArray(raw.experience).map(e => ({
                    company: safeString(e?.company),
                    role: safeString(e?.role),
                    duration: safeString(e?.duration),
                    description: safeString(e?.description)
                })),
                skills: safeArray(raw.skills).map(s => ({
                    category: safeString(s?.category),
                    items: safeArray(s?.items)
                })),
                masteredSkills: safeArray(raw.masteredSkills).map(s => ({
                    name: safeString(s?.name || s)
                })),
                projects: safeArray(raw.projects).map(p => ({
                    title: safeString(p?.title),
                    description: safeString(p?.description),
                    techStack: safeArray(p?.techStack)
                })),
                certificates: safeArray(raw.certificates).map(c => ({
                    name: safeString(c?.name || c?.title),
                    issuer: safeString(c?.issuer),
                    year: safeString(c?.year || c?.issueYear)
                })),
                academicHighlights: safeArray(raw.academicHighlights).map(h => ({
                    title: safeString(h?.title),
                    description: safeString(h?.description)
                }))
            }

            // CRITICAL FIX: Merge order matters - only use Groq data if it's not empty
            const updatedData = {
                ...resumeData,
                // Only update if Groq returned non-empty values
                summary: safeString(sanitized.summary) || resumeData.summary,
                experience: sanitized.experience.length > 0
                    ? sanitized.experience
                    : resumeData.experience,
                education: sanitized.education.length > 0
                    ? sanitized.education
                    : resumeData.education,
                skills: sanitized.skills,
                masteredSkills: sanitized.masteredSkills.length > 0
                    ? sanitized.masteredSkills
                    : resumeData.masteredSkills,
                certificates: sanitized.certificates,
                projects: sanitized.projects,
                academicHighlights: sanitized.academicHighlights,
                // Always preserve profile basics from userRawData (read directly, not from .profile)
                fullName: safeString(userRawData?.fullName),
                email: safeString(userRawData?.email),
                phoneNumber: safeString(userRawData?.phoneNumber),
                location: `${safe(userRawData?.location?.city, '')}, ${safe(userRawData?.location?.state, '')}, ${safe(userRawData?.location?.country, '')}`.replace(/, ,/g, ',').replace(/^, |, $/g, ''),
                github: safeString(userRawData?.github),
                linkedin: safeString(userRawData?.linkedin),
                portfolio: safeString(userRawData?.portfolio)
            }

            setResumeData(updatedData)
            saveToLocalStorage(updatedData)
        } catch (error) {
            console.error('AI Generation Error:', error)
            alert('Failed to generate resume content. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleRegenerateSection = async (section) => {
        setRegeneratingSection(section)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${API_BASE_URL}/resume/regenerate-section`,
                { section, currentResumeData: resumeData },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            const { content } = response.data

            // Update only the regenerated section
            const updatedData = {
                ...resumeData,
                ...content // Merge the regenerated section content
            }

            setResumeData(updatedData)
            saveToLocalStorage(updatedData)
            console.log(`✅ Regenerated ${section}`)
        } catch (error) {
            console.error(`Failed to regenerate ${section}:`, error)
            alert(`Failed to regenerate ${section}. Please try again.`)
        } finally {
            setRegeneratingSection(null)
        }
    }

    const handleSectionEdit = (sectionName, updatedData) => {
        setResumeData(prev => {
            const newData = {
                ...prev,
                [sectionName]: updatedData
            }
            saveToLocalStorage(newData)
            return newData
        })
        console.log(`✅ Locally updated section: ${sectionName}`)
    }

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${API_BASE_URL}/resume/export/pdf`,
                { resumeData },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            )

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${safeString(resumeData.fullName).replace(/\s+/g, '_') || 'Resume'}_Resume.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            console.error('Export Error:', error)
            alert('Failed to export PDF.')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 pb-20">
            {/* Top Bar */}
            <header className="h-18 bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-xl transition text-slate-500 hover:text-slate-900"
                        >
                            <ChevronLeft size={22} />
                        </button>
                        <div>
                            <h1 className="font-bold text-xl text-slate-900 tracking-tight">Resume Builder</h1>
                            <p className="text-sm text-slate-500">Build, edit, and export your professional resume.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            disabled={isExporting || isGenerating}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition text-sm font-bold shadow-sm shadow-slate-200 disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            Export PDF
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: AI Generator */}
                    <div className="space-y-6">
                        {/* AI Resume Generator */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8">
                            <div className="text-center mb-6">
                                <h3 className="font-bold text-2xl text-white">AI Resume Generator</h3>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || isLoadingData}
                                className="w-full py-4 bg-white hover:bg-gray-50 text-indigo-600 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mb-3"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Generating Resume...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={20} />
                                        Generate Resume
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleClearResume}
                                className="w-full py-2 text-white/80 hover:text-white text-sm flex items-center justify-center gap-2 transition"
                            >
                                <Trash2 size={14} />
                                Clear & Start Fresh
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Live Preview */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[800px]">
                            <div className="mb-6 flex items-center justify-between px-2">
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                    <FileText size={18} />
                                    <span>Live Preview</span>
                                </div>
                                {(isGenerating || regeneratingSection) && (
                                    <span className="text-xs text-blue-600 animate-pulse font-bold tracking-widest uppercase flex items-center gap-2">
                                        <Loader2 size={12} className="animate-spin" />
                                        {regeneratingSection ? `Updating ${regeneratingSection}...` : 'Updating Content...'}
                                    </span>
                                )}
                            </div>

                            <div className={`transition-all duration-500 ${isGenerating ? 'opacity-50 blur-[1px]' : 'opacity-100 blur-0'} flex justify-center`}>
                                <div className="shadow-2xl shadow-slate-200/50">
                                    <ResumePreview
                                        data={resumeData}
                                        onRegenerate={handleRegenerateSection}
                                        regeneratingSection={regeneratingSection}
                                        onSectionEdit={handleSectionEdit}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

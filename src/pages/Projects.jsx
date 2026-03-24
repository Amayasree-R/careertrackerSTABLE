import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
    FolderGit2, Wand2, Upload, FileText, Trash2, CheckCircle,
    ChevronRight, Loader2, X, Save, AlertCircle
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return { Authorization: `Bearer ${token}` }
}

// ─── Project Card ────────────────────────────────────────────────────────────
function ProjectCard({ project, onDelete, isPreview = false }) {
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${project.projectName}"? This cannot be undone.`)) return
        setDeleting(true)
        await onDelete(project._id)
        setDeleting(false)
    }

    return (
        <div className={`bg-[#111111] rounded-2xl border shadow-sm p-6 relative transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg ${isPreview ? 'border-[#ff5500] bg-[#1a1a1a]' : 'border-[#242424] hover:border-[#ff5500]/50'
            }`}>
            {/* Preview badge */}
            {isPreview && (
                <span className="absolute top-4 left-4 text-[10px] font-bold bg-[#2a1500] text-[#ff5500] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#ff5500]/30 shadow-sm">
                    Preview — unsaved
                </span>
            )}

            {/* Delete button */}
            {!isPreview && (
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="absolute top-4 right-4 p-1.5 text-[#606060] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete project"
                >
                    {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
            )}

            {/* Title */}
            <h3 className={`font-bold text-[#ffffff] text-lg mb-2 ${isPreview ? 'mt-5' : 'pr-8'}`}>
                {project.projectName || 'Untitled Project'}
            </h3>

            {/* Summary */}
            {project.summary && (
                <p className="text-[#a0a0a0] text-sm leading-relaxed mb-4">{project.summary}</p>
            )}

            {/* Tech Stack */}
            {project.techStack?.length > 0 && (
                <div className="mb-4">
                    <p className="text-[10px] font-bold text-[#606060] uppercase tracking-wider mb-2">Tech Stack</p>
                    <div className="flex flex-wrap gap-1.5">
                        {project.techStack.map((tech, i) => (
                            <span key={i} className="px-2 py-0.5 bg-[#2a1500] text-[#ff5500] text-[11px] font-bold rounded-md border border-[#ff5500]/20">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Key Features */}
            {project.keyFeatures?.length > 0 && (
                <div className="mb-4">
                    <p className="text-[10px] font-bold text-[#606060] uppercase tracking-wider mb-2">Key Features</p>
                    <ul className="space-y-1">
                        {project.keyFeatures.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[#a0a0a0]">
                                <ChevronRight size={14} className="text-[#ff5500]/50 mt-0.5 shrink-0" />
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Skills Extracted */}
            {project.skillsExtracted?.length > 0 && (
                <div>
                    <p className="text-[10px] font-bold text-[#606060] uppercase tracking-wider mb-2">
                        Skills Extracted
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-1">
                        {project.skillsExtracted.map((skill, i) => (
                            <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-[#1a1a1a] text-[#a0a0a0] text-[11px] font-bold rounded-md border border-[#242424]">
                                <CheckCircle size={11} className="text-[#ff5500]" />
                                {skill}
                            </span>
                        ))}
                    </div>
                    <p className="text-[10px] text-[#606060] mt-1 italic font-medium">Added to Mastered Skills fingerprint</p>
                </div>
            )}

            {/* Created date */}
            {!isPreview && project.createdAt && (
                <p className="text-[10px] text-[#606060] font-bold mt-4 pt-3 border-t border-[#242424] uppercase tracking-widest">
                    Analyzed {new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
            )}
        </div>
    )
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-[#111111] rounded-2xl border border-[#242424] shadow-sm p-6 animate-pulse">
            <div className="h-5 bg-[#1a1a1a] rounded w-2/5 mb-3" />
            <div className="h-3 bg-[#1a1a1a] rounded w-full mb-2" />
            <div className="h-3 bg-[#1a1a1a] rounded w-4/5 mb-5" />
            <div className="flex gap-2 mb-4">
                {[1, 2, 3].map(i => <div key={i} className="h-6 w-16 bg-[#1a1a1a] rounded-full" />)}
            </div>
            <div className="h-3 bg-[#1a1a1a] rounded w-3/5" />
        </div>
    )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Projects() {
    const [activeTab, setActiveTab] = useState('upload')
    const [readmeFile, setReadmeFile] = useState(null)
    const [readmeText, setReadmeText] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [currentAnalysis, setCurrentAnalysis] = useState(null)
    const [readmeRaw, setReadmeRaw] = useState('')
    const [projects, setProjects] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef(null)

    // ── Fetch saved projects on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/projects`, { headers: getAuthHeaders() })
                setProjects(res.data.projects || [])
            } catch (err) {
                console.error('Failed to fetch projects:', err.message)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProjects()
    }, [])

    // ── File drag handlers
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
    const handleDragLeave = () => setIsDragging(false)
    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFileSelect(file)
    }

    const handleFileSelect = (file) => {
        const ext = file.name.toLowerCase()
        if (!ext.endsWith('.md') && !ext.endsWith('.txt')) {
            setError('Only .md and .txt files are accepted.')
            return
        }
        setError('')
        setReadmeFile(file)
    }

    // ── Analyze
    const handleAnalyze = async () => {
        setError('')
        setSuccessMsg('')

        if (activeTab === 'upload' && !readmeFile) {
            setError('Please upload a .md or .txt file first.')
            return
        }
        if (activeTab === 'paste' && readmeText.trim().length < 10) {
            setError('Please paste a README with at least 10 characters.')
            return
        }

        setIsAnalyzing(true)
        setCurrentAnalysis(null)

        try {
            let res
            let rawContent = ''

            if (activeTab === 'upload') {
                // Read file text for readmeRaw
                rawContent = await readmeFile.text()
                const formData = new FormData()
                formData.append('readme', readmeFile)
                res = await axios.post(`${API_BASE_URL}/projects/analyze`, formData, {
                    headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
                })
            } else {
                rawContent = readmeText
                res = await axios.post(
                    `${API_BASE_URL}/projects/analyze`,
                    { readmeText },
                    { headers: getAuthHeaders() }
                )
            }

            setCurrentAnalysis(res.data.analysis)
            setReadmeRaw(rawContent)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to analyze README. Please try again.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    // ── Save
    const handleSave = async () => {
        if (!currentAnalysis) return
        setError('')
        try {
            const res = await axios.post(
                `${API_BASE_URL}/projects/save`,
                { analysis: currentAnalysis, readmeRaw },
                { headers: getAuthHeaders() }
            )
            const saved = {
                ...currentAnalysis,
                readmeRaw,
                createdAt: new Date().toISOString(),
                _id: Date.now().toString() // temp id until next fetch
            }
            setProjects(prev => [saved, ...prev])
            setCurrentAnalysis(null)
            setReadmeRaw('')
            setReadmeFile(null)
            setReadmeText('')
            const skillCount = res.data.updatedSkills?.length || 0
            setSuccessMsg(`Project saved! ${skillCount} skill${skillCount !== 1 ? 's' : ''} marked as Mastered.`)
            setTimeout(() => setSuccessMsg(''), 5000)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save project.')
        }
    }

    // ── Discard preview
    const handleDiscard = () => {
        setCurrentAnalysis(null)
        setReadmeRaw('')
    }

    // ── Delete saved project
    const handleDelete = async (projectId) => {
        try {
            await axios.delete(`${API_BASE_URL}/projects/${projectId}`, { headers: getAuthHeaders() })
            setProjects(prev => prev.filter(p => p._id?.toString() !== projectId?.toString()))
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete project.')
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-[#111111] border-b border-[#242424] px-8 py-4 flex items-center gap-3">
                <div className="p-2 bg-[#2a1500] rounded-xl border border-[#ff5500]/20 shadow-sm shadow-[#ff5500]/5">
                    <FolderGit2 size={20} className="text-[#ff5500]" />
                </div>
                <div>
                    <h1 className="text-lg font-black text-[#ffffff] uppercase tracking-tight">Project Dashboard</h1>
                    <p className="text-xs text-[#a0a0a0] font-medium">Analyze READMEs, extract skills, and track your builds</p>
                </div>
            </div>

            {/* Main layout */}
            <div className="grid grid-cols-12 gap-6 p-8 max-w-7xl mx-auto">

                {/* ── LEFT PANEL ── */}
                <div className="col-span-4 shrink-0">
                    <div className="bg-[#111111] border border-[#242424] rounded-2xl shadow-sm p-6 sticky top-24">
                        <div className="flex items-center gap-2 mb-1">
                            <FolderGit2 size={22} className="text-[#ff5500]" />
                            <h2 className="text-lg font-semibold text-[#ffffff]">README Analyzer</h2>
                        </div>
                        <p className="text-[#a0a0a0] text-sm mb-6 leading-relaxed">
                            Upload or paste your project README to extract skills and generate a project summary.
                        </p>

                        {/* Tab Toggle */}
                        <div className="flex bg-[#1a1a1a] rounded-xl p-1 mb-5">
                            {['upload', 'paste'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setError(''); setReadmeFile(null) }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                            ? 'bg-[#111111] text-[#ff5500] shadow-sm border border-[#ff5500]/30'
                                            : 'text-[#606060] hover:text-[#ffffff]'
                                        }`}
                                >
                                    {tab === 'upload' ? <Upload size={14} /> : <FileText size={14} />}
                                    {tab === 'upload' ? 'Upload File' : 'Paste Text'}
                                </button>
                            ))}
                        </div>

                        {/* Upload Tab */}
                        {activeTab === 'upload' && (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${isDragging
                                        ? 'border-[#ff5500] bg-[#2a1500]/50'
                                        : readmeFile
                                            ? 'border-emerald-600 bg-emerald-950/30'
                                            : 'border-[#242424] bg-[#1a1a1a] hover:border-[#ff5500]/60 hover:bg-[#111111]'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".md,.txt"
                                    className="hidden"
                                    onChange={e => e.target.files[0] && handleFileSelect(e.target.files[0])}
                                />
                                {readmeFile ? (
                                    <div>
                                        <CheckCircle size={24} className="mx-auto mb-2 text-emerald-500" />
                                        <p className="font-bold text-sm text-[#ffffff]">{readmeFile.name}</p>
                                        <p className="text-[#a0a0a0] text-[10px] uppercase font-bold mt-1 tracking-widest">{(readmeFile.size / 1024).toFixed(1)} KB</p>
                                        <button
                                            onClick={e => { e.stopPropagation(); setReadmeFile(null) }}
                                            className="mt-2 text-xs font-bold text-[#606060] hover:text-[#ff5500] uppercase tracking-wider"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload size={24} className="mx-auto mb-2 text-[#a0a0a0]" />
                                        <p className="text-sm font-bold text-[#ffffff] uppercase tracking-tight">Drop your README here</p>
                                        <p className="text-[#606060] text-xs mt-1 font-medium">or click to browse · .md and .txt</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Paste Tab */}
                        {activeTab === 'paste' && (
                            <textarea
                                value={readmeText}
                                onChange={e => setReadmeText(e.target.value)}
                                placeholder="Paste your README content here..."
                                className="w-full bg-[#1a1a1a] border border-[#242424] rounded-xl p-4 text-[#ffffff] placeholder-[#606060] text-sm resize-none outline-none focus:ring-1 focus:ring-[#ff5500] focus:border-[#ff5500] transition-all"
                                style={{ minHeight: '200px' }}
                            />
                        )}

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-red-400 text-xs font-bold uppercase tracking-wide">
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        {/* Analyze Button */}
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="w-full mt-5 flex items-center justify-center gap-2 bg-[#ff5500] text-white font-black py-4 rounded-xl hover:bg-[#e64d00] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#ff5500]/20 uppercase tracking-wider"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Wand2 size={18} />
                                    Analyze Project
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="col-span-8 min-w-0">

                    {/* Success message */}
                    {successMsg && (
                        <div className="flex items-center gap-2 mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest shadow-sm shadow-emerald-500/5">
                            <CheckCircle size={16} />
                            {successMsg}
                        </div>
                    )}

                    {/* Preview card (unsaved analysis) */}
                    {currentAnalysis && (
                        <div className="mb-6 animate-in slide-in-from-top-4 duration-500">
                            <ProjectCard project={currentAnalysis} onDelete={() => { }} isPreview />
                            <div className="flex gap-3 mt-3">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#ff5500] hover:bg-[#e64d00] text-white font-black px-5 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#ff5500]/10 uppercase tracking-widest text-sm"
                                >
                                    <Save size={16} />
                                    Save Project & Skills
                                </button>
                                <button
                                    onClick={handleDiscard}
                                    className="flex items-center gap-2 bg-[#1a1a1a] border border-[#242424] text-[#606060] font-bold px-6 py-4 rounded-xl hover:bg-[#111111] hover:text-[#ffffff] transition-all duration-200 uppercase tracking-widest text-xs"
                                >
                                    <X size={16} />
                                    Discard
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Saved Projects */}
                    {isAnalyzing && !currentAnalysis && <SkeletonCard />}

                    {!isLoading && !isAnalyzing && projects.length === 0 && !currentAnalysis && (
                        <div className="flex flex-col items-center justify-center text-center py-32 text-[#606060] border-2 border-dashed border-[#242424] rounded-3xl bg-[#111111]/50 shadow-inner">
                            <div className="p-5 bg-[#1a1a1a] rounded-full mb-6 border border-[#242424]">
                                <FolderGit2 size={40} className="text-[#242424]" />
                            </div>
                            <p className="font-black text-xl text-[#ffffff] uppercase tracking-tight">No projects analyzed yet</p>
                            <p className="text-sm mt-1 font-medium max-w-[240px]">Analyze your project READMEs to track your journey and extract skills.</p>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="space-y-4">
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {projects.map((project, i) => (
                                <ProjectCard
                                    key={project._id || i}
                                    project={project}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

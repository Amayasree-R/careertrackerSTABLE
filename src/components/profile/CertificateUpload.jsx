
import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react'

export default function CertificateUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [error, setError] = useState('')
    const [previewData, setPreviewData] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef(null)

    const handleFile = (selectedFile) => {
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            setError('Please upload a PDF file.')
            setFile(null)
            return
        }
        setFile(selectedFile)
        setError('')
        setPreviewData(null)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFile = e.dataTransfer.files[0]
        handleFile(droppedFile)
    }

    const handleUpload = async () => {
        if (!file) return

        setIsUploading(true)
        setLoadingMessage('AI is reading your certificate...')
        setError('')

        const formData = new FormData()
        formData.append('certificate', file)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:5000/api/certificates/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error || 'Upload failed')

            setPreviewData({
                ...data.certificate,
                roadmapUpdated: data.roadmapUpdated,
                matchedSkill: data.matchedSkill
            })
            setFile(null)
            if (onUploadSuccess) onUploadSuccess()
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to process certificate')
        } finally {
            setIsUploading(false)
            setLoadingMessage('')
        }
    }

    return (
        <div className="space-y-6">
            {!previewData ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all text-center ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-200 bg-slate-50'
                        }`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFile(e.target.files[0])}
                        accept="application/pdf"
                        className="hidden"
                    />

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-blue-600">
                            <Upload size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {file ? file.name : 'Drop your certificate here'}
                        </h3>
                        <p className="text-slate-500 mb-6 max-w-xs mx-auto">
                            Drag and drop your PDF certificate, or click to browse from your computer.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => fileInputRef.current.click()}
                                disabled={isUploading}
                                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition shadow-sm"
                            >
                                Browse Files
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Upload & Analyze'
                                )}
                            </button>
                        </div>
                    </div>

                    {isUploading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center z-10">
                            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-blue-600 font-bold animate-pulse">{loadingMessage}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white border-2 border-green-100 rounded-[2rem] p-8 shadow-xl shadow-green-100/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <button onClick={() => setPreviewData(null)} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex items-start gap-6">
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                            <CheckCircle size={32} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-slate-900 mb-1">Extraction Complete! 🎉</h3>
                            <p className="text-slate-500 mb-6">AI has successfully verified your credentials.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Skill Verified</p>
                                    <p className="font-bold text-slate-900">{previewData.skillName}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Issuer</p>
                                    <p className="font-bold text-slate-900">{previewData.issuerName}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Issue Date</p>
                                    <p className="font-bold text-slate-900">
                                        {new Date(previewData.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {previewData.roadmapUpdated ? (
                                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-bold w-fit">
                                    <CheckCircle size={16} />
                                    Roadmap updated for "{previewData.matchedSkill}"
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold w-fit">
                                    <AlertCircle size={16} />
                                    Skill not found in current roadmap
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}
        </div>
    )
}

import { useState } from 'react'
import { CloudUpload, ShieldCheck, AlertCircle, Loader2, Award } from 'lucide-react'

function CertificateUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [successData, setSuccessData] = useState(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
    const handleDragLeave = () => setIsDragging(false)
    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) handleFileSelection(droppedFile)
    }

    const handleFileSelection = (selectedFile) => {
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            setError('Please upload a PDF file.')
            setFile(null)
            return
        }
        setFile(selectedFile)
        setError('')
        setSuccess(false)
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            setError('Please upload a PDF file.')
            setFile(null)
            return
        }
        setFile(selectedFile)
        setError('')
        setSuccess(false)
    }

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.')
            return
        }

        setIsUploading(true)
        setError('')
        setSuccess(false)

        const formData = new FormData()
        formData.append('certificate', file)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:5000/api/cert/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed')
            }

            setSuccess(true)
            setSuccessData(data)
            setFile(null)
            if (onUploadSuccess) onUploadSuccess()
        } catch (err) {
            console.error(err)
            setError(err.message || 'Failed to upload certificate')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="bg-[#13131a] border border-[#1e1e2e] rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/30 shadow-sm relative overflow-hidden group">
            <div className="flex flex-col items-center text-center max-w-sm mx-auto">
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 mb-6 ${
                        isDragging
                            ? 'border-violet-400 bg-violet-950/50'
                            : file
                                ? 'border-emerald-600 bg-emerald-950/30'
                                : 'border-[#2a2a3d] hover:border-violet-500/60 hover:bg-[#1e1e2e]'
                    }`}
                    onClick={() => document.getElementById('cert-upload').click()}
                >
                    <div className="w-12 h-12 bg-[#1e1e2e] rounded-xl flex items-center justify-center text-slate-400 mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <CloudUpload size={24} className="group-hover:text-violet-400 transition-colors" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 mb-1">Upload Certification</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Drop your certificate here or click to browse. <br />
                        <span className="font-bold text-slate-400 text-[9px] uppercase tracking-widest mt-2 block">Only PDF Supported</span>
                    </p>

                    <input
                        id="cert-upload"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => e.target.files[0] && handleFileSelection(e.target.files[0])}
                        className="hidden"
                    />
                </div>

                <div className="w-full space-y-4">
                    <div className={`px-4 py-2.5 bg-[#1e1e2e] border border-[#2a2a3d] rounded-xl text-xs font-medium text-slate-300 text-center truncate ${!file && 'invisible h-0 py-0 overflow-hidden'}`}>
                        {file?.name}
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="w-full py-3 bg-[#1e1e2e] text-violet-400 border border-[#2a2a3d] rounded-xl font-bold hover:bg-[#2a2a3d] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Analyzing Certification...</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={18} />
                                <span className="text-sm">Upload & Verify</span>
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 flex items-start gap-3 text-rose-400 bg-rose-950/30 px-4 py-3 rounded-xl border border-rose-500/30 w-full animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="text-[10px] font-bold leading-tight uppercase tracking-wider">{error}</div>
                    </div>
                )}

                {success && successData && (
                    <div className="mt-4 w-full space-y-3 animate-in fade-in zoom-in-95">
                        <div className="flex items-start gap-3 text-emerald-400 bg-emerald-950/30 px-4 py-3 rounded-xl border border-emerald-500/30">
                            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                            <div className="text-left">
                                <div className="text-[10px] font-bold leading-tight uppercase tracking-wider">{successData.message}</div>
                                <div className="text-[10px] text-emerald-500/80 mt-1">
                                    Total mastered skills: <strong>{successData.masteredSkillsCount || 0}</strong>
                                </div>
                            </div>
                        </div>

                        {successData.promotedSkills && successData.promotedSkills.length > 0 && (
                            <div className="bg-violet-950/20 border border-violet-500/20 rounded-xl p-4 text-left">
                                <div className="flex items-center gap-2 mb-3">
                                    <Award className="w-4 h-4 text-violet-400" />
                                    <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wide">Skills Mark as Mastered:</h4>
                                </div>
                                <div className="space-y-2">
                                    {successData.promotedSkills.map((skill, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs text-violet-300/90">
                                            <div className="w-1 h-1 rounded-full bg-violet-500" />
                                            <span className="font-semibold">{skill}</span>
                                            <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">✓ Added to Profile</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {successData.certificate && (
                            <div className="bg-[#1e1e2e] border border-[#2a2a3d] rounded-xl p-3 text-left">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Certificate Details</div>
                                <div className="text-[11px] text-slate-300 space-y-1.5 px-1">
                                    <div className="flex justify-between border-b border-[#2a2a3d] pb-1.5">
                                        <span className="text-slate-500">Title</span>
                                        <span className="font-semibold text-right max-w-[180px] truncate">{successData.certificate.polishedTitle}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[#2a2a3d] pb-1.5">
                                        <span className="text-slate-500">Issuer</span>
                                        <span className="font-semibold">{successData.certificate.issuer}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Status</span>
                                        <span className="text-emerald-400 font-bold uppercase tracking-tighter">{successData.certificate.verificationStatus}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CertificateUpload

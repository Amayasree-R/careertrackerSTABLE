import { useState } from 'react'
import { CloudUpload, ShieldCheck, AlertCircle, Loader2, Award } from 'lucide-react'

function CertificateUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [successData, setSuccessData] = useState(null)

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
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 transition-all hover:border-blue-300 hover:bg-blue-50/30 group">
            <div className="flex flex-col items-center text-center max-w-sm mx-auto">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 mb-4 group-hover:scale-110 transition-transform">
                    <CloudUpload className="w-8 h-8 group-hover:text-blue-600 transition-colors" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Certification</h3>
                <p className="text-sm text-slate-500 mb-6">
                    Drop your certificate here or click to browse. <br />
                    <span className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mt-2 block">Only PDF Supported</span>
                </p>

                <div className="w-full space-y-4">
                    <input
                        id="cert-upload"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label
                        htmlFor="cert-upload"
                        className="block w-full cursor-pointer px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all text-center truncate"
                    >
                        {file ? file.name : 'Select PDF File'}
                    </label>

                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>AI is analyzing your certificate...</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="w-5 h-5" />
                                <span>Upload & Verify</span>
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 flex items-start gap-3 text-rose-600 bg-rose-50 px-4 py-3 rounded-lg border border-rose-100 w-full">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="text-xs font-bold leading-tight uppercase">{error}</div>
                    </div>
                )}

                {success && successData && (
                    <div className="mt-4 w-full space-y-3">
                        <div className="flex items-start gap-3 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-100">
                            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-xs font-bold leading-tight uppercase">{successData.message}</div>
                                <div className="text-xs text-emerald-700 mt-1">
                                    Total mastered skills: <strong>{successData.masteredSkillsCount || 0}</strong>
                                </div>
                            </div>
                        </div>

                        {successData.promotedSkills && successData.promotedSkills.length > 0 && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Award className="w-4 h-4 text-blue-600" />
                                    <h4 className="text-sm font-bold text-blue-900">Skills Marked as Mastered:</h4>
                                </div>
                                <div className="space-y-2">
                                    {successData.promotedSkills.map((skill, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-blue-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                            <span className="font-semibold">{skill}</span>
                                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">✓ Added to Resume</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {successData.certificate && (
                            <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-left">
                                <div className="text-xs font-semibold text-slate-700 mb-2">Certificate Details:</div>
                                <div className="text-xs text-slate-600 space-y-1">
                                    <div><strong>Title:</strong> {successData.certificate.polishedTitle}</div>
                                    <div><strong>Issuer:</strong> {successData.certificate.issuer}</div>
                                    <div><strong>Status:</strong> {successData.certificate.verificationStatus}</div>
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

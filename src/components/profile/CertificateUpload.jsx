import { useState } from 'react'
import { CloudUpload, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'

function CertificateUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

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
                    <div className="mt-4 flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-lg border border-rose-100">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold leading-tight uppercase">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold leading-tight uppercase">Certificate verified and added!</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CertificateUpload


import { useState } from 'react'

function CertificateUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')
    const [analysisResult, setAnalysisResult] = useState(null)

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            setError('Please upload a PDF file.')
            setFile(null)
            return
        }
        setFile(selectedFile)
        setError('')
        setAnalysisResult(null)
    }

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.')
            return
        }

        setIsUploading(true)
        setError('')

        const formData = new FormData()
        formData.append('certificate', file)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://127.0.0.1:5000/api/cert/upload', {
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

            setAnalysisResult(data.analysis)
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
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Certification</h3>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
                    />
                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        {isUploading ? 'Analyzing...' : 'Upload & Verify'}
                    </button>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                {analysisResult && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                        <h4 className="font-semibold text-green-800 mb-1">Upload Successful!</h4>
                        <p className="text-sm text-green-700">
                            <strong>{analysisResult.certificate.title}</strong> has been verified and added to your profile.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CertificateUpload

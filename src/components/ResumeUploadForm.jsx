import { useState } from 'react'

export default function ResumeUploadForm({ userId, apiBaseUrl, onResumeUploaded }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles[0]) {
      handleFileSelect(droppedFiles[0])
    }
  }

  const handleFileSelect = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setFile(selectedFile)
    setError(null)
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a file')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const formData = new FormData()
      formData.append('resume', file)
      formData.append('userId', userId)

      const token = localStorage.getItem('token')
      if (!token || token === 'null' || token === 'undefined') {
        throw new Error('You items must be logged in to upload a resume. Please log in again.')
      }

      const response = await fetch(`${apiBaseUrl}/api/resume/upload`, {
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

      setSuccess('Resume uploaded and parsed successfully!')
      setFile(null)

      // Call the callback with parsed data
      setTimeout(() => {
        onResumeUploaded(data)
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h4 className="text-2xl font-black text-slate-900">Resume Upload</h4>
          <p className="text-slate-400 font-medium">Our AI will extract your skills, experience, and education to build your profile.</p>
        </div>

        {/* Drag and drop zone - Matches Dashboard Style */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300 ${dragActive
              ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
              : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-white'
            }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg transition-transform duration-500 ${dragActive ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}>
              📄
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-1">
                {dragActive ? 'Release to upload' : 'Drop your resume here'}
              </h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                PDF files only • Max 5MB
              </p>
            </div>

            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-input"
              disabled={loading}
            />
            <label
              htmlFor="file-input"
              className={`mt-4 px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition shadow-xl shadow-slate-200 cursor-pointer inline-block ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Select File'}
            </label>
          </div>
        </div>

        {/* Selected file info */}
        {file && !loading && (
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                  📁
                </div>
                <div>
                  <p className="text-slate-900 font-black">{file.name}</p>
                  <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">
                    Ready to parse • {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 text-slate-400 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>

            <button
              onClick={handleUpload}
              className="w-full mt-6 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-200"
            >
              GENERATE PROFILE 🚀
            </button>
          </div>
        )}

        {/* Error/Success Feedbacks */}
        {error && (
          <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-700 font-bold flex items-center gap-3">
            <span className="text-xl">⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="p-6 bg-green-50 border border-green-100 rounded-3xl text-green-700 font-bold flex items-center gap-3">
            <span className="text-xl">✅</span> {success}
          </div>
        )}

        <p className="text-center text-slate-400 text-sm font-medium">
          Secure AI processing. No data is stored without your consent.
        </p>
      </div>
    </div>
  )
}

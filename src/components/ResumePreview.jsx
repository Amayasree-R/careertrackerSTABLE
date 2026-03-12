import React, { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

// Import template components
import ProfessionalClassicTemplate from './resume/templates/ProfessionalClassicTemplate'
import ModernSidebarTemplate from './resume/templates/ModernSidebarTemplate'

// Error Boundary to prevent white screen crashes
class ResumeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Resume Preview Crash:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">Resume Preview Error</h3>
          <p className="text-sm text-red-700 mb-4 max-w-md">
            The resume template crashed while rendering. This usually happens when data is in an unexpected format.
          </p>
          <p className="text-xs text-red-600 font-mono bg-red-100 p-3 rounded">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function ResumePreview({ 
  data, 
  selectedTemplate = 'professional',
  themeColor = '#1e293b',
  onSectionEdit,
  onRegenerate,
  regeneratingSection 
}) {
  console.log('Resume data received:', data)
  console.log('Selected template:', selectedTemplate)
  console.log('Theme color:', themeColor)

  if (!data || Object.keys(data).length <= 1) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-[#94a3b8] font-bold">Generate a resume to see the preview</p>
      </div>
    )
  }

  // Template routing logic
  const renderTemplate = () => {
    const props = {
      data,
      onSectionEdit,
      themeColor
    }

    switch (selectedTemplate) {
      case 'professional':
        return <ProfessionalClassicTemplate {...props} />
      case 'modern-sidebar':
        return <ModernSidebarTemplate {...props} />
      default:
        return <ProfessionalClassicTemplate {...props} />
    }
  }

  return (
    <ResumeErrorBoundary>
      {renderTemplate()}
    </ResumeErrorBoundary>
  )
}


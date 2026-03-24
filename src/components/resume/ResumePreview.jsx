import React, { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

// Import template components
import ProfessionalClassicTemplate from './templates/ProfessionalClassicTemplate'
import ModernSidebarTemplate from './templates/ModernSidebarTemplate'

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
        <div className="bg-[#111111] border-2 border-red-500/20 rounded-2xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-[#ffffff] mb-2">Resume Preview Error</h3>
          <p className="text-sm text-[#a0a0a0] mb-4 max-w-md">
            The resume template crashed while rendering. This usually happens when data is in an unexpected format.
          </p>
          <p className="text-xs text-red-400 font-mono bg-red-500/10 p-3 rounded">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 px-6 py-2 bg-red-600/20 text-red-400 border border-red-600/40 rounded-xl hover:bg-red-600/30 transition text-sm font-bold"
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
  themeColor = '#ff5500',
  onSectionEdit,
  onRegenerate,
  regeneratingSection 
}) {
  console.log('Resume data received:', data)
  console.log('Selected template:', selectedTemplate)
  console.log('Theme color:', themeColor)

  if (!data || Object.keys(data).length <= 1) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px] border-2 border-dashed border-[#242424] rounded-2xl bg-[#0a0a0a]/50">
        <p className="text-[#606060] font-bold uppercase tracking-widest text-xs">Generate a resume to see the preview</p>
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


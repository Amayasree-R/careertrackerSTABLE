import { Component } from 'react'
import { ModernTemplate, ProfessionalTemplate, TechnicalTemplate, MinimalTemplate } from './ResumeTemplates'
import { AlertTriangle } from 'lucide-react'

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

export default function ResumePreview({ data, onRegenerate, regeneratingSection }) {
    const renderTemplate = () => {
        const template = data?.template || 'professional'

        const templateProps = {
            data,
            onRegenerate,
            regeneratingSection
        }

        switch (template) {
            case 'modern':
                return <ModernTemplate {...templateProps} />
            case 'professional':
                return <ProfessionalTemplate {...templateProps} />
            case 'technical':
                return <TechnicalTemplate {...templateProps} />
            case 'minimal':
                return <MinimalTemplate {...templateProps} />
            default:
                return <ProfessionalTemplate {...templateProps} />
        }
    }

    return (
        <ResumeErrorBoundary>
            <div className="scale-[0.85] origin-top transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-sm overflow-hidden ring-1 ring-slate-800 bg-white">
                {renderTemplate()}
            </div>
        </ResumeErrorBoundary>
    )
}

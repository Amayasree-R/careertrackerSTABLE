import { useState, useEffect, useRef } from 'react'

export default function SkillTooltip({ skill, targetJob, anchorRef, onClose }) {
    const [detail, setDetail] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const tooltipRef = useRef(null)
    // Remove position logic and simply use fixed centering
    // Fetch AI-generated skill detail on mount
    useEffect(() => {
        let cancelled = false
        const fetchDetail = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch('http://localhost:5000/api/skill-detail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ skill, targetJob })
                })
                const data = await response.json()
                if (!response.ok) throw new Error(data.message || 'Failed to fetch skill detail')
                if (!cancelled) {
                    setDetail(data)
                    setLoading(false)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message)
                    setLoading(false)
                }
            }
        }
        fetchDetail()
        return () => { cancelled = true }
    }, [skill, targetJob])


    // Resource icon mapping
    const getResourceIcon = (type) => {
        const icons = {
            'Docs': '📄',
            'Course': '🎓',
            'Video': '🎬',
            'Tutorial': '📝',
            'Practice': '💻',
            'Tool': '🛠️',
            'Search': '🔍',
            'Book': '📕',
            'Playground': '🎮'
        }
        return icons[type] || '📎'
    }

    // Color for resource type badge
    const getBadgeStyle = (type) => {
        const styles = {
            'Docs': { bg: 'bg-blue-100', text: 'text-blue-700' },
            'Course': { bg: 'bg-purple-100', text: 'text-purple-700' },
            'Video': { bg: 'bg-red-100', text: 'text-red-700' },
            'Tutorial': { bg: 'bg-green-100', text: 'text-green-700' },
            'Practice': { bg: 'bg-orange-100', text: 'text-orange-700' },
            'Tool': { bg: 'bg-teal-100', text: 'text-teal-700' },
            'Search': { bg: 'bg-gray-100', text: 'text-gray-700' },
            'Book': { bg: 'bg-amber-100', text: 'text-amber-700' },
            'Playground': { bg: 'bg-pink-100', text: 'text-pink-700' }
        }
        return styles[type] || { bg: 'bg-gray-100', text: 'text-gray-600' }
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                ref={tooltipRef}
                onClick={(e) => e.stopPropagation()}
                className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto skill-tooltip-popup animate-in fade-in zoom-in duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{skill.charAt(0)}</span>
                        </div>
                        <h5 className="font-bold text-gray-900 text-base">{skill}</h5>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-lg hover:bg-gray-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-4">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <p className="text-sm font-medium text-gray-500">AI is analyzing {skill}...</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="py-8 text-center flex flex-col items-center">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3 text-xl">⚠️</div>
                            <p className="text-sm font-medium text-red-600 mb-1">{error}</p>
                            <p className="text-xs text-gray-400">Please check your connection and try again.</p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {detail && !loading && (
                        <>
                            {/* AI Description */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-700 uppercase tracking-wider flex items-center gap-1">
                                        ✨ AI Insight
                                    </span>
                                </div>
                                <p className="text-gray-700 leading-7">{detail.description}</p>
                            </div>

                            {/* Why It Matters */}
                            {detail.whyItMatters && (
                                <div className="mb-6 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">💡 Why It Matters</p>
                                    <p className="text-sm text-blue-900 leading-relaxed">{detail.whyItMatters}</p>
                                </div>
                            )}

                            {/* Expanded Resources */}
                            {detail.resources && detail.resources.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                        Recommended Resources
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {detail.resources.map((resource, idx) => {
                                            const badge = getBadgeStyle(resource.type)
                                            return (
                                                <a
                                                    key={idx}
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 bg-white transition group"
                                                >
                                                    <span className="text-2xl">{getResourceIcon(resource.type)}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 truncate">
                                                                {resource.name}
                                                            </p>
                                                            <span className="text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition">↗</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                                                                {resource.type}
                                                            </span>
                                                            {resource.difficulty && (
                                                                <span className="text-[10px] font-medium text-gray-400">{resource.difficulty}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </a>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>


            </div>
        </div>
    )
}

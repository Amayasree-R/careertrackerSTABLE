import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, X, Sparkles } from 'lucide-react'
import { polishText } from '../../../utils/textPolisher'
import { useDescriptionEnhancer } from '../../../hooks/useDescriptionEnhancer'

export default function AchievementForm({ achievements = [], onSave, onClose, userProfile }) {
    const [formData, setFormData] = useState(achievements.map(a => {
        if (typeof a === 'string') {
            return { heading: a, description: '', date: '', organization: '' }
        }
        return {
            heading: a.heading || a.text || '',
            description: a.description || '',
            date: a.date || '',
            organization: a.organization || '',
            polishedDescription: a.polishedDescription || a.polishedText || ''
        }
    }))
    const { isEnhancing, enhanceDescription, cleanup } = useDescriptionEnhancer()

    // Cleanup on unmount
    useEffect(() => {
        return () => cleanup()
    }, [cleanup])

    const addNewAchievement = () => {
        setFormData([...formData, { 
            heading: '', 
            description: '', 
            date: '', 
            organization: '',
            polishedDescription: ''
        }])
    }

    const updateAchievement = (index, field, value) => {
        const updated = [...formData]
        updated[index][field] = value
        setFormData(updated)

        // If description is long enough, trigger AI enhancement
        if (field === 'description' && value.trim().length >= 10) {
            const context = {
                heading: updated[index].heading,
                organization: updated[index].organization,
                targetJobRole: userProfile?.targetJobRole || userProfile?.careerInfo?.targetJobRole
            }

            // Enhance with AI (debounced)
            enhanceDescription(
                `ach-${index}-desc`,
                value,
                context,
                'achievement',
                (polishedText) => {
                    // Update polished version in state
                    const updatedWithPolish = [...formData]
                    updatedWithPolish[index].polishedDescription = polishedText
                    setFormData(updatedWithPolish)
                }
            )
        }
    }

    const deleteAchievement = (index) => {
        setFormData(formData.filter((_, i) => i !== index))
    }

    const handleSave = () => {
        // Filter out empty achievements (must have at least heading or description)
        const filtered = formData
            .filter(a => (a.heading && a.heading.trim() !== '') || (a.description && a.description.trim() !== ''))
            .map(a => ({
                heading: a.heading || '',
                description: a.description || '',
                polishedDescription: a.polishedDescription || a.description || '',
                date: a.date || '',
                organization: a.organization || ''
            }))
        onSave(filtered)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#111111] border border-[#242424] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#242424] flex items-center justify-between bg-[#111111]">
                    <h2 className="text-xl font-bold text-[#ffffff]">Key Achievements</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#1a1a1a] rounded-lg transition text-[#a0a0a0] hover:text-[#ffffff]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <p className="text-sm text-[#a0a0a0] mb-4">
                        Add your key professional achievements with structured details. Each achievement should have a title and description.
                    </p>

                    {formData.length === 0 ? (
                        <div className="text-center py-12 text-[#606060]">
                            <p className="text-sm">No achievements added yet. Click "Add Achievement" to begin.</p>
                        </div>
                    ) : (
                        formData.map((achievement, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-xl border-2 border-[#242424] bg-[#1a1a1a] hover:border-[#ff5500]/40 transition-all space-y-3"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-[#ffffff]">
                                        Achievement {index + 1}
                                    </span>
                                    <button
                                        onClick={() => deleteAchievement(index)}
                                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#a0a0a0] mb-1 uppercase tracking-wider">
                                        Heading / Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={achievement.heading}
                                        onChange={(e) => updateAchievement(index, 'heading', e.target.value)}
                                        placeholder="e.g., Winner – Hackathon 2025"
                                        className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#a0a0a0] mb-1 uppercase tracking-wider">
                                        Description *
                                    </label>
                                    <div className="relative">
                                        {isEnhancing && (
                                            <div className="absolute top-2 right-2 flex items-center gap-1 text-[#ff5500] text-xs">
                                                <Sparkles size={12} className="animate-pulse" />
                                                <span>Polishing...</span>
                                            </div>
                                        )}
                                        <textarea
                                            value={achievement.description}
                                            onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                                            placeholder="e.g., Won first place among 120 teams by developing an AI-based career recommendation system."
                                            rows="3"
                                            className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060] resize-none"
                                        />
                                        <p className="text-[10px] text-[#606060] mt-1 font-medium">
                                            AI will automatically polish your achievement for your resume
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            Date (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={achievement.date}
                                            onChange={(e) => updateAchievement(index, 'date', e.target.value)}
                                            placeholder="e.g., March 2025"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            Organization / Event (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={achievement.organization}
                                            onChange={(e) => updateAchievement(index, 'organization', e.target.value)}
                                            placeholder="e.g., TechStartup Summit"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#242424] flex items-center justify-between bg-[#111111]">
                    <button
                        onClick={addNewAchievement}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#242424] hover:bg-[#2a1500] text-[#ff5500] rounded-xl transition text-sm font-bold"
                    >
                        <Plus size={16} />
                        Add Achievement
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-[#ff5500] hover:bg-[#e64d00] text-white rounded-xl transition text-sm font-bold shadow-lg shadow-[#ff5500]/20"
                    >
                        <Save size={16} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}

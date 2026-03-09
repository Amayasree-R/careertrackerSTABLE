import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, X, Sparkles } from 'lucide-react'
import { polishText } from '../../utils/textPolisher'
import { useDescriptionEnhancer } from '../../utils/useDescriptionEnhancer'

export default function AchievementForm({ achievements = [], onSave, onClose, userProfile }) {
    const [formData, setFormData] = useState(achievements.map(a => 
        typeof a === 'string' ? { text: a, polishedText: a } : a
    ))
    const { isEnhancing, enhanceDescription, cleanup } = useDescriptionEnhancer()

    // Cleanup on unmount
    useEffect(() => {
        return () => cleanup()
    }, [cleanup])

    const addNewAchievement = () => {
        setFormData([...formData, { text: '', polishedText: '' }])
    }

    const updateAchievement = (index, value) => {
        const updated = [...formData]
        updated[index].text = value
        setFormData(updated)

        // If text is long enough, trigger AI enhancement
        if (value.trim().length >= 10) {
            const context = {
                targetJobRole: userProfile?.targetJobRole || userProfile?.careerInfo?.targetJobRole
            }

            // Enhance with AI (debounced)
            enhanceDescription(
                `ach-${index}`,
                value,
                context,
                'achievement',
                (polishedText) => {
                    // Update polished version in state
                    const updatedWithPolish = [...formData]
                    updatedWithPolish[index].polishedText = polishedText
                    setFormData(updatedWithPolish)
                }
            )
        }
    }

    const deleteAchievement = (index) => {
        setFormData(formData.filter((_, i) => i !== index))
    }

    const handlePolish = (index) => {
        const updated = [...formData]
        updated[index].text = polishText(updated[index].text)
        setFormData(updated)
    }

    const handleSave = () => {
        // Filter out empty achievements and map to include polished text
        const filtered = formData
            .filter(a => a.text && a.text.trim() !== '')
            .map(a => ({
                text: a.text,
                polishedText: a.polishedText || a.text
            }))
        onSave(filtered)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
                    <h2 className="text-xl font-bold text-white">Key Achievements</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <p className="text-sm text-slate-600 mb-4">
                        Add your key professional achievements, awards, or notable accomplishments.
                    </p>

                    {formData.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p className="text-sm">No achievements added yet. Click "Add Achievement" to begin.</p>
                        </div>
                    ) : (
                        formData.map((achievement, index) => (
                            <div
                                key={index}
                                className="flex gap-3 items-start p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 transition-all"
                            >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center mt-1">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <div className="relative">
                                        {isEnhancing && (
                                            <div className="absolute top-2 right-2 flex items-center gap-1 text-indigo-600 text-xs">
                                                <Sparkles size={12} className="animate-pulse" />
                                                <span>Polishing...</span>
                                            </div>
                                        )}
                                        <textarea
                                            value={achievement.text}
                                            onChange={(e) => updateAchievement(index, e.target.value)}
                                            onBlur={() => handlePolish(index)}
                                            placeholder="e.g., Increased sales by 35% through strategic marketing campaigns"
                                            rows="2"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                        />
                                        <p className="text-xs text-slate-400 mt-1">
                                            AI will automatically polish your achievement for your resume
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteAchievement(index)}
                                    className="flex-shrink-0 p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                    <button
                        onClick={addNewAchievement}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition text-sm font-medium"
                    >
                        <Plus size={16} />
                        Add Achievement
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-bold shadow-sm"
                    >
                        <Save size={16} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}

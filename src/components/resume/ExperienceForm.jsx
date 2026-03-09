import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, X, Sparkles } from 'lucide-react'
import { polishText } from '../../utils/textPolisher'
import { useDescriptionEnhancer } from '../../utils/useDescriptionEnhancer'

export default function ExperienceForm({ experiences = [], onSave, onClose, userProfile }) {
    const [formData, setFormData] = useState([...experiences])
    const [editingIndex, setEditingIndex] = useState(null)
    const { isEnhancing, enhanceDescription, getEnhancedText, cleanup } = useDescriptionEnhancer()

    // Cleanup on unmount
    useEffect(() => {
        return () => cleanup()
    }, [cleanup])

    const addNewExperience = () => {
        setFormData([...formData, {
            role: '',
            company: '',
            duration: '',
            description: '',
            polishedDescription: '' // Store polished version separately
        }])
        setEditingIndex(formData.length)
    }

    const updateExperience = (index, field, value) => {
        const updated = [...formData]
        updated[index][field] = value
        setFormData(updated)

        // If description changed, trigger AI enhancement
        if (field === 'description' && value.trim().length >= 10) {
            const exp = updated[index]
            const context = {
                role: exp.role,
                company: exp.company,
                targetJobRole: userProfile?.targetJobRole || userProfile?.careerInfo?.targetJobRole
            }

            // Enhance with AI (debounced)
            enhanceDescription(
                `exp-${index}-desc`,
                value,
                context,
                'experience',
                (polishedText) => {
                    // Update polished version in state
                    const updatedWithPolish = [...formData]
                    updatedWithPolish[index].polishedDescription = polishedText
                    setFormData(updatedWithPolish)
                }
            )
        }
    }

    const deleteExperience = (index) => {
        setFormData(formData.filter((_, i) => i !== index))
        if (editingIndex === index) setEditingIndex(null)
    }

    const handlePolish = (index, field) => {
        const updated = [...formData]
        updated[index][field] = polishText(updated[index][field])
        setFormData(updated)
    }

    const handleSave = () => {
        // Map formData to include polished descriptions for preview
        const processedData = formData.map(exp => ({
            role: exp.role,
            company: exp.company,
            duration: exp.duration,
            description: exp.description, // Keep raw text
            polishedDescription: exp.polishedDescription || exp.description // Use polished if available
        }))
        onSave(processedData)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
                    <h2 className="text-xl font-bold text-white">Professional Experience</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {formData.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p className="text-sm">No experience added yet. Click "Add Experience" to begin.</p>
                        </div>
                    ) : (
                        formData.map((exp, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    editingIndex === index
                                        ? 'border-indigo-500 bg-indigo-50/50'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <button
                                        onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                                        className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
                                    >
                                        {exp.role || 'New Experience'} {exp.company && `@ ${exp.company}`}
                                    </button>
                                    <button
                                        onClick={() => deleteExperience(index)}
                                        className="p-1 hover:bg-red-50 text-red-500 rounded transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {editingIndex === index ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Role *</label>
                                                <input
                                                    type="text"
                                                    value={exp.role}
                                                    onChange={(e) => updateExperience(index, 'role', e.target.value)}
                                                    onBlur={() => handlePolish(index, 'role')}
                                                    placeholder="Senior Software Engineer"
                                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1">Company *</label>
                                                <input
                                                    type="text"
                                                    value={exp.company}
                                                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                                    onBlur={() => handlePolish(index, 'company')}
                                                    placeholder="Tech Corp"
                                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Duration *</label>
                                            <input
                                                type="text"
                                                value={exp.duration}
                                                onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                                                placeholder="Jan 2020 - Present"
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                                                <span>Description</span>
                                                {isEnhancing && (
                                                    <span className="flex items-center gap-1 text-indigo-600 text-xs font-normal">
                                                        <Sparkles size={12} className="animate-pulse" />
                                                        AI polishing...
                                                    </span>
                                                )}
                                            </label>
                                            <textarea
                                                value={exp.description}
                                                onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                                onBlur={() => handlePolish(index, 'description')}
                                                placeholder="• Led development of microservices architecture&#10;• Managed team of 5 engineers&#10;• Improved system performance by 40%"
                                                rows="5"
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                            />
                                            <p className="text-xs text-slate-400 mt-1">
                                                Type your experience - AI will automatically polish it for your resume
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-600 space-y-1">
                                        <p className="font-medium">{exp.company} | {exp.duration}</p>
                                        <p className="text-xs text-slate-500 line-clamp-2">{exp.description}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                    <button
                        onClick={addNewExperience}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition text-sm font-medium"
                    >
                        <Plus size={16} />
                        Add Experience
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

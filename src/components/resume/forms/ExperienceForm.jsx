import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, X, Sparkles } from 'lucide-react'
import { polishText } from '../../../utils/textPolisher'
import { useDescriptionEnhancer } from '../../../hooks/useDescriptionEnhancer'

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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#111111] rounded-2xl border border-[#242424] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#242424] flex items-center justify-between bg-[#111111]">
                    <h2 className="text-xl font-bold text-[#ffffff]">Professional Experience</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#1a1a1a] rounded-lg transition text-[#a0a0a0] hover:text-[#ffffff]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {formData.length === 0 ? (
                        <div className="text-center py-12 text-[#606060]">
                            <p className="text-sm">No experience added yet. Click "Add Experience" to begin.</p>
                        </div>
                    ) : (
                        formData.map((exp, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    editingIndex === index
                                        ? 'border-[#ff5500] bg-[#2a1500]'
                                        : 'border-[#242424] bg-[#1a1a1a] hover:border-[#ff5500]/40'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <button
                                        onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                                        className={`text-sm font-semibold transition ${editingIndex === index ? 'text-[#ff5500]' : 'text-[#ffffff] hover:text-[#ff5500]'}`}
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
                                                <label className="block text-xs font-semibold text-[#a0a0a0] mb-1 uppercase tracking-wider">Role *</label>
                                                <input
                                                    type="text"
                                                    value={exp.role}
                                                    onChange={(e) => updateExperience(index, 'role', e.target.value)}
                                                    onBlur={() => handlePolish(index, 'role')}
                                                    placeholder="Senior Software Engineer"
                                                    className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-[#a0a0a0] mb-1 uppercase tracking-wider">Company *</label>
                                                <input
                                                    type="text"
                                                    value={exp.company}
                                                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                                    onBlur={() => handlePolish(index, 'company')}
                                                    placeholder="Tech Corp"
                                                    className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-[#a0a0a0] mb-1 uppercase tracking-wider">Duration *</label>
                                            <input
                                                type="text"
                                                value={exp.duration}
                                                onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                                                placeholder="Jan 2020 - Present"
                                                className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-[#a0a0a0] mb-1 flex items-center justify-between uppercase tracking-wider">
                                                <span>Description</span>
                                                {isEnhancing && (
                                                    <span className="flex items-center gap-1 text-[#ff5500] text-xs font-normal normal-case">
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
                                                className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060] resize-none"
                                            />
                                            <p className="text-[10px] text-[#606060] mt-1 font-medium">
                                                Type your experience - AI will automatically polish it for your resume
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-[#a0a0a0] space-y-1">
                                        <p className="font-bold text-[#ffffff]">{exp.company} | {exp.duration}</p>
                                        <p className="text-xs text-[#606060] line-clamp-2">{exp.description}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#242424] flex items-center justify-between bg-[#111111]">
                    <button
                        onClick={addNewExperience}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#242424] hover:bg-[#2a1500] text-[#ff5500] rounded-xl transition text-sm font-bold"
                    >
                        <Plus size={16} />
                        Add Experience
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

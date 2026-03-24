import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, X } from 'lucide-react'

export default function EducationForm({ education = [], onSave, onClose, userProfile }) {
    const [formData, setFormData] = useState([...education])
    const [editingIndex, setEditingIndex] = useState(null)

    const addNewEducation = () => {
        setFormData([...formData, {
            institution: '',
            degree: '',
            field: '',
            startYear: '',
            endYear: '',
            description: ''
        }])
        setEditingIndex(formData.length)
    }

    const updateEducation = (index, field, value) => {
        const updated = [...formData]
        updated[index][field] = value
        setFormData(updated)
    }

    const deleteEducation = (index) => {
        setFormData(formData.filter((_, i) => i !== index))
        if (editingIndex === index) setEditingIndex(null)
    }

    const handleSave = () => {
        // Filter out empty entries
        const filtered = formData.filter(e => e.institution && e.degree)
        onSave(filtered)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#111111] rounded-2xl border border-[#242424] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#242424] flex items-center justify-between bg-[#111111]">
                    <h2 className="text-xl font-bold text-[#ffffff]">Education</h2>
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
                            <p className="text-sm">No education added yet. Click "Add Education" to begin.</p>
                        </div>
                    ) : (
                        formData.map((edu, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-xl border-2 border-[#242424] bg-[#1a1a1a] hover:border-[#ff5500]/40 transition-all space-y-3"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-[#ffffff]">
                                        Education Entry {index + 1}
                                    </span>
                                    <button
                                        onClick={() => deleteEducation(index)}
                                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#a0a0a0] mb-1 uppercase tracking-wider">
                                            Institution Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.institution}
                                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                            placeholder="e.g., Stanford University"
                                            className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#a0a0a0] mb-1 uppercase tracking-wider">
                                            Degree *
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                            placeholder="e.g., Bachelor of Science"
                                            className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#a0a0a0] mb-1 uppercase tracking-wider">
                                            Field of Study
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.field}
                                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                            placeholder="e.g., Computer Science"
                                            className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-[#a0a0a0] mb-1 uppercase tracking-wider">
                                                Start Year
                                            </label>
                                            <input
                                                type="number"
                                                value={edu.startYear}
                                                onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                                                placeholder="2018"
                                                className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-[#a0a0a0] mb-1 uppercase tracking-wider">
                                                End Year
                                            </label>
                                            <input
                                                type="number"
                                                value={edu.endYear}
                                                onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                                                placeholder="2022"
                                                className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#a0a0a0] mb-1 uppercase tracking-wider">
                                        Description (optional)
                                    </label>
                                    <textarea
                                        value={edu.description}
                                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                                        placeholder="Additional details about your degree, achievements, etc."
                                        rows="2"
                                        className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060] resize-none"
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#242424] flex items-center justify-between bg-[#111111]">
                    <button
                        onClick={addNewEducation}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#242424] hover:bg-[#2a1500] text-[#ff5500] rounded-xl transition text-sm font-bold"
                    >
                        <Plus size={16} />
                        Add Education
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

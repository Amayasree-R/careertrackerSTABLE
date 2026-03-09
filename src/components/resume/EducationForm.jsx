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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
                    <h2 className="text-xl font-bold text-white">Education</h2>
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
                            <p className="text-sm">No education added yet. Click "Add Education" to begin.</p>
                        </div>
                    ) : (
                        formData.map((edu, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-700">
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
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            Institution Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.institution}
                                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                            placeholder="e.g., Stanford University"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            Degree *
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                            placeholder="e.g., Bachelor of Science"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            Field of Study
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.field}
                                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                            placeholder="e.g., Computer Science"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                Start Year
                                            </label>
                                            <input
                                                type="number"
                                                value={edu.startYear}
                                                onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                                                placeholder="2018"
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                End Year
                                            </label>
                                            <input
                                                type="number"
                                                value={edu.endYear}
                                                onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                                                placeholder="2022"
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Description (optional)
                                    </label>
                                    <textarea
                                        value={edu.description}
                                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                                        placeholder="Additional details about your degree, achievements, etc."
                                        rows="2"
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                    <button
                        onClick={addNewEducation}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition text-sm font-medium"
                    >
                        <Plus size={16} />
                        Add Education
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

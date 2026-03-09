import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, X } from 'lucide-react'

export default function InterestsForm({ interests = [], onSave, onClose, userProfile }) {
    const [formData, setFormData] = useState([...interests])

    const addNewInterest = () => {
        setFormData([...formData, ''])
    }

    const updateInterest = (index, value) => {
        const updated = [...formData]
        updated[index] = value
        setFormData(updated)
    }

    const deleteInterest = (index) => {
        setFormData(formData.filter((_, i) => i !== index))
    }

    const handleSave = () => {
        // Filter out empty interests
        const filtered = formData.filter(i => i && i.trim() !== '')
        onSave(filtered)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
                    <h2 className="text-xl font-bold text-white">Interests</h2>
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
                        Add your professional interests and areas of passion.
                    </p>

                    {formData.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p className="text-sm">No interests added yet. Click "Add Interest" to begin.</p>
                        </div>
                    ) : (
                        formData.map((interest, index) => (
                            <div
                                key={index}
                                className="flex gap-3 items-start p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 transition-all"
                            >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center mt-1">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={interest}
                                        onChange={(e) => updateInterest(index, e.target.value)}
                                        placeholder="e.g., Artificial Intelligence, Cloud Computing"
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => deleteInterest(index)}
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
                        onClick={addNewInterest}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition text-sm font-medium"
                    >
                        <Plus size={16} />
                        Add Interest
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

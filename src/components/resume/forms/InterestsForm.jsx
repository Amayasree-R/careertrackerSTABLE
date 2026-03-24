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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#111111] rounded-2xl border border-[#242424] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#242424] flex items-center justify-between bg-[#111111]">
                    <h2 className="text-xl font-bold text-[#ffffff]">Interests</h2>
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
                        Add your professional interests and areas of passion.
                    </p>

                    {formData.length === 0 ? (
                        <div className="text-center py-12 text-[#606060]">
                            <p className="text-sm">No interests added yet. Click "Add Interest" to begin.</p>
                        </div>
                    ) : (
                        formData.map((interest, index) => (
                            <div
                                key={index}
                                className="flex gap-3 items-start p-4 rounded-xl border-2 border-[#242424] bg-[#1a1a1a] hover:border-[#ff5500]/40 transition-all"
                            >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2a1500] text-[#ff5500] text-xs font-bold flex items-center justify-center mt-1">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={interest}
                                        onChange={(e) => updateInterest(index, e.target.value)}
                                        placeholder="e.g., Artificial Intelligence, Cloud Computing"
                                        className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060]"
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
                <div className="px-6 py-4 border-t border-[#242424] flex items-center justify-between bg-[#111111]">
                    <button
                        onClick={addNewInterest}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#242424] hover:bg-[#2a1500] text-[#ff5500] rounded-xl transition text-sm font-bold"
                    >
                        <Plus size={16} />
                        Add Interest
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

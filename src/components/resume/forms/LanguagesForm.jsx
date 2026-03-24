import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, X } from 'lucide-react'

export default function LanguagesForm({ languages = [], onSave, onClose, userProfile }) {
    const [formData, setFormData] = useState(
        languages.map(lang => typeof lang === 'string' ? lang : lang.name || lang)
    )

    const addNewLanguage = () => {
        setFormData([...formData, ''])
    }

    const updateLanguage = (index, value) => {
        const updated = [...formData]
        updated[index] = value
        setFormData(updated)
    }

    const deleteLanguage = (index) => {
        setFormData(formData.filter((_, i) => i !== index))
    }

    const handleSave = () => {
        // Filter out empty languages
        const filtered = formData.filter(lang => lang && lang.trim() !== '')
        onSave(filtered)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#111111] rounded-2xl border border-[#242424] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#242424] flex items-center justify-between bg-[#111111]">
                    <h2 className="text-xl font-bold text-[#ffffff]">Languages Known</h2>
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
                        Add the languages you are proficient in.
                    </p>

                    {formData.length === 0 ? (
                        <div className="text-center py-12 text-[#606060]">
                            <p className="text-sm">No languages added yet. Click "Add Language" to begin.</p>
                        </div>
                    ) : (
                        formData.map((language, index) => (
                            <div
                                key={index}
                                className="flex gap-3 items-center p-4 rounded-xl border-2 border-[#242424] bg-[#1a1a1a] hover:border-[#ff5500]/40 transition-all"
                            >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2a1500] text-[#ff5500] text-xs font-bold flex items-center justify-center">
                                    {index + 1}
                                </span>
                                <input
                                    type="text"
                                    value={language}
                                    onChange={(e) => updateLanguage(index, e.target.value)}
                                    placeholder="e.g., English, Spanish, Mandarin"
                                    className="flex-1 px-3 py-2 text-sm bg-[#1a1a1a] border border-[#242424] rounded-lg focus:border-[#ff5500] text-[#ffffff] outline-none transition-colors placeholder-[#606060]"
                                />
                                <button
                                    onClick={() => deleteLanguage(index)}
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
                        onClick={addNewLanguage}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#242424] hover:bg-[#2a1500] text-[#ff5500] rounded-xl transition text-sm font-bold"
                    >
                        <Plus size={16} />
                        Add Language
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

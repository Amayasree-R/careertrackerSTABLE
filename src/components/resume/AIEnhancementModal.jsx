import React, { useState, useEffect } from 'react'
import { Sparkles, Check, X, Wand2, RefreshCw, ArrowRight } from 'lucide-react'
import axios from 'axios'
import API_BASE_URL from '../../config/api.js'

export default function AIEnhancementModal({ type, text, onAccept, onClose }) {
    const [loading, setLoading] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {
        handleEnhance()
    }, [])

    const handleEnhance = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${API_BASE_URL}/resume/enhance-text`,
                { text, type },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            const result = response.data.result
            setSuggestions(Array.isArray(result) ? result : [result])
        } catch (error) {
            console.error('Enhancement Error:', error)
            setSuggestions([text]) // Fallback
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111111] border border-[#242424] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-[#242424] flex justify-between items-center bg-[#111111]">
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-[#ff5500] animate-pulse" />
                        <h2 className="text-xl font-black text-[#ffffff] uppercase tracking-tighter">AI Success Enhancer</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#1a1a1a] rounded-full transition">
                        <X className="text-[#a0a0a0] hover:text-[#ffffff]" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Comparison Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-[#606060] uppercase tracking-widest">Original Input</h3>
                            <div className="p-4 bg-black rounded-2xl border border-[#242424] text-sm text-[#a0a0a0] italic">
                                {text || 'No text provided'}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-[#ff5500] uppercase tracking-widest flex justify-between">
                                AI Enhanced Version
                                {loading && <RefreshCw size={14} className="animate-spin" />}
                            </h3>
                            <div className="p-4 bg-[#ff5500]/5 rounded-2xl border border-[#ff5500]/20 text-sm text-[#ffffff] font-medium min-h-[100px] flex items-center justify-center">
                                {loading ? (
                                    <p className="animate-pulse">Analyzing impact...</p>
                                ) : (
                                    suggestions[selectedIndex] || 'Generating...'
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Suggestions List */}
                    {suggestions.length > 1 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-[#606060] uppercase tracking-widest">Variations</h3>
                            <div className="space-y-2">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedIndex(i)}
                                        className={`w-full p-4 rounded-xl text-left text-sm transition-all flex items-center justify-between group ${selectedIndex === i
                                                ? 'bg-[#2a1500] border-[#ff5500] ring-1 ring-[#ff5500]'
                                                : 'bg-black border-[#242424] hover:bg-[#1a1a1a]'
                                            } border`}
                                    >
                                        <span className={selectedIndex === i ? 'text-[#ffffff]' : 'text-[#a0a0a0]'}>{s}</span>
                                        {selectedIndex === i && <ArrowRight size={16} className="text-[#ff5500]" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-[#242424] bg-[#111111] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-[#1a1a1a] hover:bg-[#242424] border border-[#242424] rounded-xl text-sm font-bold transition text-[#a0a0a0] hover:text-[#ffffff]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onAccept(suggestions[selectedIndex])}
                        disabled={loading || !suggestions.length}
                        className="px-8 py-2.5 bg-[#ff5500] hover:bg-[#e64d00] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition shadow-lg shadow-[#ff5500]/20 text-white"
                    >
                        Use This Version
                    </button>
                </div>
            </div>
        </div>
    )
}

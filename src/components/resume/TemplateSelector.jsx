import React from 'react'
import { Layout } from 'lucide-react'

export default function TemplateSelector({ selected, onSelect }) {
    const templates = [
        { id: 'modern', name: 'Modern', desc: 'Clean, two-column' },
        { id: 'professional', name: 'Professional', desc: 'Traditional, elegant' },
        { id: 'technical', name: 'Technical', desc: 'Dev-focused, mono' },
        { id: 'minimal', name: 'Minimal', desc: 'High-end, spacious' }
    ]

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                <Layout size={14} /> Resume Templates
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {templates.map(t => (
                    <button
                        key={t.id}
                        onClick={() => onSelect(t.id)}
                        className={`p-3 rounded-xl border transition-all text-left ${selected === t.id
                                ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            }`}
                    >
                        <div className="w-full aspect-[3/4] bg-slate-800 rounded mb-2 overflow-hidden border border-slate-700 group-hover:border-slate-600 transition">
                            {/* Visual hint of the template */}
                            <div className={`w-full h-full p-2 opacity-50 ${t.id}-preview`}>
                                <div className="h-1 w-1/2 bg-slate-600 mb-1" />
                                <div className="h-0.5 w-full bg-slate-700 mb-0.5" />
                                <div className="h-0.5 w-full bg-slate-700 mb-0.5" />
                                <div className="h-0.5 w-3/4 bg-slate-700" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-200">{t.name}</p>
                        <p className="text-[8px] text-slate-500">{t.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}

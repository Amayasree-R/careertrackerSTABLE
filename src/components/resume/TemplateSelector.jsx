import React from 'react'
import { Layout, Sidebar } from 'lucide-react'

export default function TemplateSelector({ selectedTemplate, onTemplateChange }) {
    const templates = [
        { id: 'professional', name: 'Professional', desc: 'Traditional single-column', icon: Layout },
        { id: 'modern-sidebar', name: 'Modern Sidebar', desc: 'Two-part sidebar design', icon: Sidebar },
    ]

    return (
        <div className="bg-[#13131a] border border-[#1e1e2e] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#1e1e2e]">
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                    <Layout size={20} className="text-violet-400" />
                    Resume Templates
                </h3>
                <p className="text-xs text-slate-500 mt-1">Choose your preferred resume layout</p>
            </div>

            <div className="p-4 space-y-2">
                {templates.map(t => {
                    const Icon = t.icon
                    const isActive = selectedTemplate === t.id
                    return (
                        <button
                            key={t.id}
                            onClick={() => onTemplateChange(t.id)}
                            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                                isActive
                                    ? 'bg-violet-950 border-violet-600 ring-2 ring-violet-500/20 shadow-lg shadow-violet-900/20'
                                    : 'bg-[#1e1e2e] border-[#2a2a3d] hover:border-violet-500/40 hover:bg-[#252538]'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-violet-600 text-white' : 'bg-[#13131a] text-slate-400'}`}>
                                <Icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                                    {t.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.desc}</p>
                            </div>
                            {isActive && (
                                <div className="w-2.5 h-2.5 bg-violet-600 rounded-full mt-1.5 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

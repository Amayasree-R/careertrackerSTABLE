import React from 'react'
import { Layout, Sidebar } from 'lucide-react'

export default function TemplateSelector({ selectedTemplate, onTemplateChange }) {
    const templates = [
        { id: 'professional', name: 'Professional', desc: 'Traditional single-column', icon: Layout },
        { id: 'modern-sidebar', name: 'Modern Sidebar', desc: 'Two-part sidebar design', icon: Sidebar },
    ]

    return (
        <div className="bg-[#111111] border border-[#242424] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#242424]">
                <h3 className="font-bold text-lg text-[#ffffff] flex items-center gap-2 uppercase tracking-wide">
                    <Layout size={20} className="text-[#ff5500]" />
                    Resume Templates
                </h3>
                <p className="text-xs text-[#a0a0a0] mt-1">Choose your preferred resume layout</p>
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
                                    ? 'bg-[#2a1500] border-[#ff5500] ring-2 ring-[#ff5500]/20 shadow-lg shadow-[#ff5500]/20'
                                    : 'bg-[#111111] border-[#242424] hover:border-[#ff5500]/40 hover:bg-[#1a1a1a]'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-[#ff5500] text-white' : 'bg-[#1a1a1a] text-[#a0a0a0]'}`}>
                                <Icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                                    {t.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.desc}</p>
                            </div>
                            {isActive && (
                                <div className="w-2.5 h-2.5 bg-[#ff5500] rounded-full mt-1.5 shadow-[0_0_12px_rgba(255,85,0,0.6)]" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

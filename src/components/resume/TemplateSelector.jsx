import React from 'react'
import { Layout, Sidebar } from 'lucide-react'

export default function TemplateSelector({ selectedTemplate, onTemplateChange }) {
    const templates = [
        { id: 'professional', name: 'Professional', desc: 'Traditional single-column', icon: Layout },
        { id: 'modern-sidebar', name: 'Modern Sidebar', desc: 'Two-part sidebar design', icon: Sidebar },
    ]

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <Layout size={20} />
                    Resume Templates
                </h3>
                <p className="text-sm text-white/80 mt-1">Choose your preferred resume layout</p>
            </div>

            <div className="p-4 space-y-2">
                {templates.map(t => {
                    const Icon = t.icon
                    return (
                        <button
                            key={t.id}
                            onClick={() => onTemplateChange(t.id)}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                selectedTemplate === t.id
                                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-300'
                                    : 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'
                            }`}
                        >
                            <Icon size={18} className={selectedTemplate === t.id ? 'text-indigo-600' : 'text-slate-400'} />
                            <div className="flex-1">
                                <p className={`text-sm font-semibold ${selectedTemplate === t.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                                    {t.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                            </div>
                            {selectedTemplate === t.id && (
                                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

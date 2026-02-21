import React from 'react'
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

export default function ValidationChecklist({ data }) {
    const getQualityMetrics = () => {
        const checks = [
            { id: 'summary', label: 'Compelling Summary', status: data.summary?.length > 100 },
            { id: 'skills', label: 'Verified Skills (3+)', status: data.masteredSkills?.length >= 3 },
            { id: 'projects', label: 'Project Showcase (2+)', status: data.projects?.length >= 2 },
            { id: 'experience', label: 'Work History Included', status: data.experience?.length > 0 },
            { id: 'education', label: 'Education Details', status: data.education?.length > 0 }
        ]

        const passedCount = checks.filter(c => c.status).length
        const score = Math.round((passedCount / checks.length) * 100)

        return { checks, score }
    }

    const { checks, score } = getQualityMetrics()

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">Resume Quality</h3>
                <span className="text-2xl font-black">{score}%</span>
            </div>

            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-600 transition-all duration-1000"
                    style={{ width: `${score}%` }}
                />
            </div>

            <div className="space-y-3">
                {checks.map(check => (
                    <div key={check.id} className="flex items-center justify-between text-xs">
                        <span className={check.status ? 'text-slate-300' : 'text-slate-500'}>{check.label}</span>
                        {check.status ? (
                            <CheckCircle size={14} className="text-emerald-500" />
                        ) : (
                            <AlertCircle size={14} className="text-amber-500" />
                        )}
                    </div>
                ))}
            </div>

            {score < 100 && (
                <div className="pt-4 border-t border-slate-800 flex gap-3">
                    <TrendingUp className="text-indigo-400 shrink-0" size={18} />
                    <p className="text-[10px] text-slate-400 leading-tight">
                        Tip: {checks.find(c => !c.status)?.label ? `Add ${checks.find(c => !c.status).label.toLowerCase()} to boost your score and pass ATS filters.` : 'Looking good!'}
                    </p>
                </div>
            )}
        </div>
    )
}

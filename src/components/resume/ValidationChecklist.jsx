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
        <div className="bg-[#111111] border border-[#242424] rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#ff5500]">Resume Quality</h3>
                <span className="text-2xl font-black text-[#ff5500]">{score}%</span>
            </div>

            <div className="h-2 w-full bg-[#242424] rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#ff5500] transition-all duration-1000"
                    style={{ width: `${score}%` }}
                />
            </div>

            <div className="space-y-3">
                {checks.map(check => (
                    <div key={check.id} className="flex items-center justify-between text-xs">
                        <span className={check.status ? 'text-[#a0a0a0]' : 'text-[#606060]'}>{check.label}</span>
                        {check.status ? (
                            <CheckCircle size={14} className="text-[#ff5500]" />
                        ) : (
                            <AlertCircle size={14} className="text-[#404040]" />
                        )}
                    </div>
                ))}
            </div>

            {score < 100 && (
                <div className="pt-4 border-t border-[#242424] flex gap-3">
                    <TrendingUp className="text-[#ff5500] shrink-0" size={18} />
                    <p className="text-[10px] text-[#606060] leading-tight">
                        Tip: {checks.find(c => !c.status)?.label ? `Add ${checks.find(c => !c.status).label.toLowerCase()} to boost your score and pass ATS filters.` : 'Looking good!'}
                    </p>
                </div>
            )}
        </div>
    )
}

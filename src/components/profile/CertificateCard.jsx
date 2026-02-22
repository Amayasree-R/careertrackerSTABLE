
import { useState } from 'react'
import { Award, Calendar, ExternalLink, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function CertificateCard({ cert, onToggle, onDelete }) {
    const [isToggling, setIsToggling] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleToggle = async () => {
        setIsToggling(true)
        await onToggle(cert._id)
        setIsToggling(false)
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this certificate? This will also revert your roadmap progress if this was the only proof for this skill.')) {
            setIsDeleting(true)
            await onDelete(cert._id)
            setIsDeleting(false)
        }
    }

    return (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col h-full relative group overflow-hidden">

            {/* Status Badge */}
            <div className="absolute top-6 right-6">
                {cert.matchedRoadmapSkill ? (
                    <div className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm ring-1 ring-green-200">
                        <CheckCircle size={10} />
                        Roadmap Verified
                    </div>
                ) : (
                    <div className="bg-amber-50 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm ring-1 ring-amber-100">
                        <AlertCircle size={10} />
                        Skill Not in Roadmap
                    </div>
                )}
            </div>

            <div className="flex-1">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-inner">
                    <Award size={28} />
                </div>

                <h5 className="font-black text-slate-900 text-xl leading-tight mb-2 line-clamp-2" title={cert.skillName}>
                    {cert.skillName}
                </h5>

                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <span className="font-bold text-slate-700">{cert.issuerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <Calendar size={14} />
                        {new Date(cert.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                    </div>
                </div>

                {cert.matchedRoadmapSkill && (
                    <div className="mb-6 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-[10px] uppercase tracking-widest text-blue-400 font-black mb-1">Matched Skill</p>
                        <p className="text-sm font-bold text-blue-700">{cert.matchedRoadmapSkill}</p>
                    </div>
                )}
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                {/* Use In Resume Toggle */}
                <button
                    onClick={handleToggle}
                    disabled={isToggling}
                    className={`flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl transition-all duration-200 ${cert.includeInResume
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                >
                    {isToggling ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        cert.includeInResume ? (
                            <>
                                <CheckCircle size={14} />
                                In Resume
                            </>
                        ) : (
                            'Add to Resume'
                        )
                    )}
                </button>

                <div className="flex items-center gap-2">
                    {cert.certificateUrl && (
                        <a
                            href={cert.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="View Certificate"
                        >
                            <ExternalLink size={18} />
                        </a>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Certificate"
                    >
                        {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                </div>
            </div>
        </div>
    )
}

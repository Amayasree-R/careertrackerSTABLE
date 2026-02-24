import { useState } from 'react'
import { CheckCircle, Award, Calendar, Eye, Trash2, FileText, Loader2 } from 'lucide-react'

function CertificateCard({ cert, onToggle, onDelete }) {
    const [isToggling, setIsToggling] = useState(false)

    const handleToggle = async () => {
        setIsToggling(true)
        await onToggle(cert._id)
        setIsToggling(false)
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this certificate? This will also remove the file from the server.')) {
            await onDelete(cert._id)
        }
    }

    // Format date for display
    const formattedDate = cert.issueDate
        ? new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : cert.issueYear || 'No Date'

    return (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full relative group">

            {/* Verification Badge */}
            <div className="absolute top-5 right-5">
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                </span>
            </div>

            <div className="flex-1">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Award className="w-7 h-7" />
                </div>

                <h5 className="font-bold text-slate-900 text-xl leading-snug mb-2 line-clamp-2" title={cert.title}>
                    {cert.title}
                </h5>

                <div className="flex flex-col gap-1 mb-5">
                    <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        {cert.issuer}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-2 font-medium">
                        <Calendar className="w-4 h-4" />
                        {formattedDate}
                    </p>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {cert.skills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 text-[11px] font-bold rounded-lg uppercase tracking-wider">
                            {typeof skill === 'string' ? skill : (skill.skill || skill.name)}
                        </span>
                    ))}
                    {cert.skills.length > 4 && (
                        <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[11px] font-bold rounded-lg">
                            +{cert.skills.length - 4}
                        </span>
                    )}
                </div>
            </div>

            <div className="pt-5 border-t border-slate-50 flex items-center justify-between mt-auto">
                {/* Use In Resume Toggle */}
                <button
                    onClick={handleToggle}
                    disabled={isToggling}
                    className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 ${cert.useInResume
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-slate-100'
                        }`}
                    title="Include in generated resume"
                >
                    {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : (cert.useInResume ? 'In Resume' : 'Add to Resume')}
                </button>

                <div className="flex items-center gap-1.5">
                    {cert.fileUrl && (
                        <a
                            href={cert.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="View Certificate"
                        >
                            <Eye className="w-5 h-5" />
                        </a>
                    )}
                    <button
                        onClick={handleDelete}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Certificate"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CertificateCard

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
    const formattedDate = cert.issueYear
        ? cert.issueYear.toString()
        : cert.issueDate
            ? new Date(cert.issueDate).getFullYear().toString()
            : 'No Date'

    return (
        <div className="bg-[#111111] border border-[#242424] rounded-3xl p-6 hover:border-[#ff5500] hover:shadow-none transition-all duration-300 flex flex-col h-full relative group">

            {/* Verification Badge */}
            <div className="absolute top-5 right-5">
                <span className="bg-[#1a2a1a] text-[#22c55e] text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#22c55e]/30">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                </span>
            </div>

            <div className="flex-1">
                <div className="w-14 h-14 bg-[#2a1500] rounded-2xl flex items-center justify-center text-[#ff5500] mb-5 group-hover:bg-[#ff5500] group-hover:text-white transition-colors duration-300">
                    <Award className="w-7 h-7" />
                </div>

                <h5 className="font-bold text-[#ffffff] text-xl leading-snug mb-2 line-clamp-2" title={cert.title}>
                    {cert.title}
                </h5>

                <div className="flex flex-col gap-1 mb-5">
                    <p className="text-sm font-semibold text-[#a0a0a0] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#606060]" />
                        {cert.issuer}
                    </p>
                    <p className="text-xs text-[#606060] flex items-center gap-2 font-medium">
                        <Calendar className="w-4 h-4" />
                        {formattedDate}
                    </p>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {cert.skills.slice(0, 6).map((skill, i) => {
                        const skillName = typeof skill === 'string' ? skill : (skill.skill || skill.name);
                        const isMastered = cert.masteredSkills?.includes(skillName);

                        return (
                            <span
                                key={i}
                                className={`px-3 py-1 border text-[11px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-all
                                    ${isMastered
                                        ? 'bg-[#1a2a1a] border-[#22c55e]/30 text-[#22c55e]'
                                        : 'bg-[#1a1a1a] border-[#242424] text-[#606060]'}`}
                            >
                                {isMastered && <CheckCircle className="w-3 h-3" />}
                                {skillName}
                                {isMastered && <span className="ml-1 text-[8px] opacity-70">MASTERED</span>}
                            </span>
                        );
                    })}
                    {cert.skills.length > 6 && (
                        <span className="px-3 py-1 bg-[#1a1a1a] text-[#606060] text-[11px] font-bold rounded-lg">
                            +{cert.skills.length - 6}
                        </span>
                    )}
                </div>
            </div>

            <div className="pt-5 border-t border-[#242424] flex items-center justify-between mt-auto">
                {/* Use In Resume Toggle */}
                <button
                    onClick={handleToggle}
                    disabled={isToggling}
                    className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition ${cert.useInResume
                        ? 'bg-[#ff5500] text-white hover:bg-[#e64d00]'
                        : 'bg-[#1a1a1a] text-[#606060] border border-[#242424] hover:bg-[#242424]'
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
                            className="w-10 h-10 flex items-center justify-center text-[#606060] hover:text-[#ff5500] hover:bg-[#2a1500] rounded-xl transition-all"
                            title="View Certificate"
                        >
                            <Eye className="w-5 h-5" />
                        </a>
                    )}
                    <button
                        onClick={handleDelete}
                        className="w-10 h-10 flex items-center justify-center text-[#606060] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
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

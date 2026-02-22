
import { useState } from 'react'

function CertificateCard({ cert, onToggle, onDelete }) {
    const [isToggling, setIsToggling] = useState(false)

    const handleToggle = async () => {
        setIsToggling(true)
        await onToggle(cert._id)
        setIsToggling(false)
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this certificate?')) {
            await onDelete(cert._id)
        }
    }

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col h-full relative group">

            {/* Verification Badge */}
            <div className="absolute top-4 right-4">
                {cert.verificationStatus === 'Verified' ? (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        ✓ Verified
                    </span>
                ) : (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">
                        ⚠ Partial
                    </span>
                )}
            </div>

            <div className="flex-1">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                    📜
                </div>

                <h5 className="font-bold text-slate-900 text-lg leading-tight mb-1 line-clamp-2" title={cert.title}>
                    {cert.title}
                </h5>
                <p className="text-sm text-slate-500 mb-4">{cert.issuer} • {cert.issueYear}</p>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {cert.skills.slice(0, 3).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold rounded">
                            {s.skill}
                        </span>
                    ))}
                    {cert.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[10px] font-bold rounded">
                            +{cert.skills.length - 3}
                        </span>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                {/* Use In Resume Toggle */}
                <button
                    onClick={handleToggle}
                    disabled={isToggling}
                    className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition ${cert.useInResume
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    title="Include in generated resume"
                >
                    {isToggling ? '...' : (cert.useInResume ? 'In Resume' : 'Add to Resume')}
                </button>

                <div className="flex items-center gap-2">
                    {cert.fileUrl && (
                        <a
                            href={cert.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Certificate"
                        >
                            👁️
                        </a>
                    )}
                    <button
                        onClick={handleDelete}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Certificate"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CertificateCard

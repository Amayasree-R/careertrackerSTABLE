import React, { useState, Component } from 'react'
import { Pencil, Check, X, AlertTriangle } from 'lucide-react'

// Error Boundary to prevent white screen crashes
class ResumeErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('Resume Preview Crash:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                    <AlertTriangle size={48} className="text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-red-900 mb-2">Resume Preview Error</h3>
                    <p className="text-sm text-red-700 mb-4 max-w-md">
                        The resume template crashed while rendering. This usually happens when data is in an unexpected format.
                    </p>
                    <p className="text-xs text-red-600 font-mono bg-red-100 p-3 rounded">
                        {this.state.error?.message || 'Unknown error'}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}

// Inline Editing Wrapper
const EditableSection = ({ sectionName, data, onSave, renderDisplay, renderEdit }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [tempData, setTempData] = useState(data)

    const handleSave = () => {
        onSave(sectionName, tempData)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setTempData(data)
        setIsEditing(false)
    }

    return (
        <section className="group relative mb-6">
            {!isEditing && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-100 rounded-md text-slate-400 z-10"
                    title="Edit Section"
                >
                    <Pencil size={12} />
                </button>
            )}

            {isEditing ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                    {renderEdit(tempData, (updated) => setTempData(updated))}
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <button onClick={handleCancel} className="p-1 hover:bg-red-50 text-red-500 rounded"><X size={16} /></button>
                        <button onClick={handleSave} className="p-1 hover:bg-green-50 text-green-600 rounded"><Check size={16} /></button>
                    </div>
                </div>
            ) : (
                renderDisplay()
            )}
        </section>
    )
}

export default function ResumePreview({ data, onSectionEdit }) {
    if (!data || Object.keys(data).length <= 1) {
        return (
            <div className="w-full flex justify-center items-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-lg">
                <p className="text-[#94a3b8] font-bold">Generate a resume to see the preview</p>
            </div>
        )
    }

    const renderHeading = (title) => (
        <div className="mt-6 mb-4">
            <h2 className="text-[11px] font-bold text-[#1e293b] uppercase tracking-wider">{title}</h2>
            <hr className="border-none border-top-2 border-[#1e293b] mt-1 mb-2" style={{ borderTop: '2px solid #1e293b' }} />
        </div>
    )

    return (
        <ResumeErrorBoundary>
            <div className="flex flex-row w-full min-h-[842px] bg-white shadow-2xl overflow-hidden font-sans border border-slate-200">
                {/* LEFT SIDEBAR */}
                <aside className="w-[30%] bg-[#1e293b] text-white flex flex-col min-h-full">
                    <div className="p-[32px_24px_16px]">
                        <h1 className="text-[20px] font-bold leading-tight">{data.fullName}</h1>
                    </div>
                    <div className="p-[0_24px_24px] border-b border-[#334155]">
                        <p className="text-[#94a3b8] text-[11px] uppercase tracking-[1px] font-semibold">
                            {data.targetJob || data.targetJobRole || 'Candidate'}
                        </p>
                    </div>

                    {/* CONTACT */}
                    <div className="py-4 border-b border-[#334155]">
                        <h3 className="text-[#64748b] text-[9px] font-black uppercase tracking-[1.5px] px-6 mb-2">CONTACT</h3>
                        <div className="px-6 space-y-1 text-[10px]">
                            <span className="block truncate">{data.email}</span>
                            <span className="block">{data.phoneNumber}</span>
                            <span className="block">{data.location}</span>
                            {data.github && (
                                <span className="block truncate">{data.github.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                            )}
                            {data.linkedin && (
                                <span className="block truncate">{data.linkedin.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                            )}
                        </div>
                    </div>

                    {/* SKILLS */}
                    <div className="py-4 border-b border-[#334155]">
                        <h3 className="text-[#64748b] text-[9px] font-black uppercase tracking-[1.5px] px-6 mb-2">SKILLS</h3>
                        <div className="space-y-3 px-6">
                            {/* Mastered Skills Group */}
                            {data.masteredSkills && data.masteredSkills.length > 0 && (
                                <div>
                                    <p className="text-[#94a3b8] text-[9px] font-bold uppercase mb-1">MASTERED</p>
                                    <p className="text-white text-[10px] leading-relaxed">
                                        {data.masteredSkills.map(s => s.name || s.skill).join(', ')}
                                    </p>
                                </div>
                            )}
                            {/* Other Skill Groups */}
                            {(data.skills || []).map((group, i) => (
                                <div key={i}>
                                    <p className="text-[#94a3b8] text-[9px] font-bold uppercase mb-1">{group.category}</p>
                                    <p className="text-white text-[10px] leading-relaxed">
                                        {Array.isArray(group.items) ? group.items.join(', ') : group.items}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* EDUCATION */}
                    <div className="py-4">
                        <h3 className="text-[#64748b] text-[9px] font-black uppercase tracking-[1.5px] px-6 mb-2">EDUCATION</h3>
                        <div className="px-6 space-y-4">
                            {(data.education || []).map((edu, i) => (
                                <div key={i} className="space-y-0.5">
                                    <p className="text-[11px] font-bold text-white leading-tight">{edu.institution}</p>
                                    <p className="text-[#94a3b8] text-[10px]">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</p>
                                    <p className="text-[#64748b] text-[9px] font-bold">{edu.year}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* RIGHT CONTENT */}
                <main className="w-[70%] bg-white p-[40px_36px] flex flex-col text-left">
                    {/* Summary */}
                    <EditableSection
                        sectionName="summary"
                        data={data.summary}
                        onSave={onSectionEdit}
                        renderDisplay={() => (
                            <div className="text-left">
                                {renderHeading("PROFESSIONAL SUMMARY")}
                                <p className="text-[#334155] text-[10.5px] font-normal leading-relaxed text-justify">
                                    {data.summary}
                                </p>
                            </div>
                        )}
                        renderEdit={(val, setVal) => (
                            <div className="text-left">
                                {renderHeading("PROFESSIONAL SUMMARY")}
                                <textarea
                                    value={val}
                                    onChange={(e) => setVal(e.target.value)}
                                    className="w-full p-2 text-[10.5px] border rounded min-h-[100px] outline-none"
                                />
                            </div>
                        )}
                    />

                    {/* Work Experience */}
                    {data.experience && data.experience.length > 0 && (
                        <EditableSection
                            sectionName="experience"
                            data={data.experience}
                            onSave={onSectionEdit}
                            renderDisplay={() => (
                                <div className="text-left">
                                    {renderHeading("WORK EXPERIENCE")}
                                    <div className="space-y-5">
                                        {data.experience.map((exp, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className="text-[11px] font-bold text-[#1e293b]">
                                                        {exp.company} <span className="font-normal text-[#475569]"> | </span>
                                                        <span className="font-italic text-[#475569] italic font-normal">{exp.role}</span>
                                                    </h3>
                                                    <span className="text-[10px] text-[#64748b]">{exp.duration}</span>
                                                </div>
                                                <p className="text-[#334155] text-[10px] leading-relaxed whitespace-pre-line">
                                                    {exp.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            renderEdit={(val, setVal) => (
                                <div className="text-left">
                                    {renderHeading("WORK EXPERIENCE")}
                                    <div className="space-y-4">
                                        {val.map((exp, i) => (
                                            <div key={i} className="p-3 bg-white border border-slate-100 rounded space-y-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        value={exp.company}
                                                        onChange={(e) => { const n = [...val]; n[i].company = e.target.value; setVal(n) }}
                                                        className="p-1 text-[10px] border rounded" placeholder="Company"
                                                    />
                                                    <input
                                                        value={exp.duration}
                                                        onChange={(e) => { const n = [...val]; n[i].duration = e.target.value; setVal(n) }}
                                                        className="p-1 text-[10px] border rounded" placeholder="Duration"
                                                    />
                                                </div>
                                                <input
                                                    value={exp.role}
                                                    onChange={(e) => { const n = [...val]; n[i].role = e.target.value; setVal(n) }}
                                                    className="w-full p-1 text-[10px] border rounded" placeholder="Role"
                                                />
                                                <textarea
                                                    value={exp.description}
                                                    onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                                                    className="w-full p-1 text-[10px] border rounded" rows="3" placeholder="Description"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        />
                    )}

                    {/* Projects */}
                    {data.projects && data.projects.length > 0 && (
                        <EditableSection
                            sectionName="projects"
                            data={data.projects}
                            onSave={onSectionEdit}
                            renderDisplay={() => (
                                <div className="text-left">
                                    {renderHeading("PROJECTS")}
                                    <div className="space-y-5">
                                        {data.projects.map((proj, i) => (
                                            <div key={i}>
                                                <div className="mb-1">
                                                    <h3 className="text-[11px] font-bold text-[#1e293b]">
                                                        {proj.title} <span className="font-normal text-[#475569]"> | </span>
                                                        <span className="font-italic text-[#475569] italic font-normal">
                                                            {Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                                                        </span>
                                                    </h3>
                                                </div>
                                                <p className="text-[#334155] text-[10px] leading-relaxed">
                                                    {proj.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            renderEdit={(val, setVal) => (
                                <div className="text-left">
                                    {renderHeading("PROJECTS")}
                                    <div className="space-y-4">
                                        {val.map((proj, i) => (
                                            <div key={i} className="p-3 bg-white border border-slate-100 rounded space-y-2">
                                                <input
                                                    value={proj.title}
                                                    onChange={(e) => { const n = [...val]; n[i].title = e.target.value; setVal(n) }}
                                                    className="w-full p-1 text-[10px] border rounded" placeholder="Project Title"
                                                />
                                                <input
                                                    value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                                                    onChange={(e) => { const n = [...val]; n[i].techStack = e.target.value.split(',').map(s => s.trim()); setVal(n) }}
                                                    className="w-full p-1 text-[10px] border rounded" placeholder="Tech Stack (comma separated)"
                                                />
                                                <textarea
                                                    value={proj.description}
                                                    onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                                                    className="w-full p-1 text-[10px] border rounded" rows="2" placeholder="Description"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        />
                    )}

                    {/* Certifications */}
                    {data.certificates && data.certificates.length > 0 && (
                        <EditableSection
                            sectionName="certificates"
                            data={data.certificates}
                            onSave={onSectionEdit}
                            renderDisplay={() => (
                                <div className="text-left">
                                    {renderHeading("CERTIFICATIONS")}
                                    <div className="grid grid-cols-2 gap-4">
                                        {data.certificates.map((cert, i) => (
                                            <div key={i} className="text-[10px]">
                                                <p className="font-bold text-[#1e293b]">{cert.name}</p>
                                                <p className="text-[#64748b]">{cert.issuer} {cert.year ? `• ${cert.year}` : ''}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            renderEdit={(val, setVal) => (
                                <div className="text-left">
                                    {renderHeading("CERTIFICATIONS")}
                                    <div className="space-y-3">
                                        {val.map((cert, i) => (
                                            <div key={i} className="grid grid-cols-3 gap-2 p-2 border border-slate-100 rounded">
                                                <input
                                                    value={cert.name}
                                                    onChange={(e) => { const n = [...val]; n[i].name = e.target.value; setVal(n) }}
                                                    className="col-span-2 p-1 text-[10px] border rounded" placeholder="Name"
                                                />
                                                <input
                                                    value={cert.year}
                                                    onChange={(e) => { const n = [...val]; n[i].year = e.target.value; setVal(n) }}
                                                    className="p-1 text-[10px] border rounded" placeholder="Year"
                                                />
                                                <input
                                                    value={cert.issuer}
                                                    onChange={(e) => { const n = [...val]; n[i].issuer = e.target.value; setVal(n) }}
                                                    className="col-span-3 p-1 text-[10px] border rounded" placeholder="Issuer"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        />
                    )}
                </main>
            </div>
        </ResumeErrorBoundary>
    )
}

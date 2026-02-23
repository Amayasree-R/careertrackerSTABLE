import React, { useState } from 'react'
import { RotateCw, Pencil, Check, X } from 'lucide-react'

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
        <section className={`group relative p-2 -m-2 rounded-lg transition-all ${isEditing ? 'ring-2 ring-blue-100 bg-blue-50/10' : 'hover:bg-slate-50/50'}`}>
            {!isEditing && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-200 rounded-md text-slate-500 z-10"
                    title="Edit Section"
                >
                    <Pencil size={14} />
                </button>
            )}

            {isEditing ? (
                <div className="space-y-4">
                    {renderEdit(tempData, (updated) => setTempData(updated))}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-blue-100">
                        <button
                            onClick={handleCancel}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-md transition"
                            title="Cancel"
                        >
                            <X size={16} />
                        </button>
                        <button
                            onClick={handleSave}
                            className="p-1.5 hover:bg-green-50 text-green-600 rounded-md transition"
                            title="Save"
                        >
                            <Check size={16} />
                        </button>
                    </div>
                </div>
            ) : (
                renderDisplay()
            )}
        </section>
    )
}

export const ModernTemplate = ({ data, onSectionEdit }) => (
    <div className="bg-white text-slate-900 p-8 shadow-2xl min-h-[842px] w-[595px] flex flex-col gap-6 font-sans text-left">
        <header className="border-b-4 border-indigo-600 pb-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{data.fullName}</h1>
            <div className="text-sm text-slate-500 mt-1 flex flex-wrap gap-x-3">
                <span>{data.email}</span>
                <span>•</span>
                <span>{data.phoneNumber}</span>
                {data.location && <span>•</span>}
                <span>{data.location}</span>
                {data.github && (
                    <>
                        <span>•</span>
                        <span>{data.github.replace(/^https?:\/\//, '')}</span>
                    </>
                )}
                {data.linkedin && (
                    <>
                        <span>•</span>
                        <span>{data.linkedin.replace(/^https?:\/\//, '')}</span>
                    </>
                )}
            </div>
        </header>

        <EditableSection
            sectionName="summary"
            data={data.summary}
            onSave={onSectionEdit}
            renderDisplay={() => (
                <>
                    <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2">Professional Summary</h2>
                    <p className="text-slate-700 text-sm leading-relaxed">{data.summary}</p>
                </>
            )}
            renderEdit={(val, setVal) => (
                <textarea
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    className="w-full p-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    rows="4"
                />
            )}
        />

        <div className="flex gap-8">
            <div className="flex-1 space-y-6">
                <EditableSection
                    sectionName="experience"
                    data={data.experience || []}
                    onSave={onSectionEdit}
                    renderDisplay={() => (
                        <>
                            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Experience</h2>
                            <div className="space-y-4">
                                {(data.experience || []).map((exp, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold text-slate-900">{exp.company}</h3>
                                            <span className="text-[10px] text-slate-400 font-bold">{exp.duration}</span>
                                        </div>
                                        <div className="text-xs text-indigo-500 font-semibold mb-1">{exp.role}</div>
                                        <p className="text-slate-600 text-[11px] leading-snug whitespace-pre-line">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    renderEdit={(val, setVal) => (
                        <div className="space-y-4">
                            {val.map((exp, i) => (
                                <div key={i} className="p-3 bg-indigo-50/30 rounded-lg space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            value={exp.company}
                                            onChange={(e) => {
                                                const n = [...val]; n[i].company = e.target.value; setVal(n)
                                            }}
                                            className="p-1.5 text-[10px] border rounded"
                                            placeholder="Company"
                                        />
                                        <input
                                            value={exp.duration}
                                            onChange={(e) => {
                                                const n = [...val]; n[i].duration = e.target.value; setVal(n)
                                            }}
                                            className="p-1.5 text-[10px] border rounded"
                                            placeholder="Duration"
                                        />
                                    </div>
                                    <input
                                        value={exp.role}
                                        onChange={(e) => {
                                            const n = [...val]; n[i].role = e.target.value; setVal(n)
                                        }}
                                        className="w-full p-1.5 text-[10px] border rounded"
                                        placeholder="Role"
                                    />
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => {
                                            const n = [...val]; n[i].description = e.target.value; setVal(n)
                                        }}
                                        className="w-full p-1.5 text-[10px] border rounded"
                                        rows="2"
                                        placeholder="Description"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                />

                <EditableSection
                    sectionName="projects"
                    data={data.projects || []}
                    onSave={onSectionEdit}
                    renderDisplay={() => (
                        <>
                            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Projects</h2>
                            <div className="space-y-4">
                                {(data.projects || []).map((proj, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold text-slate-900">{proj.title}</h3>
                                            <span className="text-[10px] text-indigo-400 font-mono italic">{(proj.techStack || []).join(', ')}</span>
                                        </div>
                                        <p className="text-slate-600 text-[11px] mt-1 leading-snug">{proj.description}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    renderEdit={(val, setVal) => (
                        <div className="space-y-4">
                            {val.map((proj, i) => (
                                <div key={i} className="p-3 bg-indigo-50/30 rounded-lg space-y-2">
                                    <input
                                        value={proj.title}
                                        onChange={(e) => {
                                            const n = [...val]; n[i].title = e.target.value; setVal(n)
                                        }}
                                        className="w-full p-1.5 text-[10px] border rounded"
                                        placeholder="Project Title"
                                    />
                                    <input
                                        value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                                        onChange={(e) => {
                                            const n = [...val]; n[i].techStack = e.target.value.split(',').map(s => s.trim()); setVal(n)
                                        }}
                                        className="w-full p-1.5 text-[10px] border rounded"
                                        placeholder="Tech Stack (comma separated)"
                                    />
                                    <textarea
                                        value={proj.description}
                                        onChange={(e) => {
                                            const n = [...val]; n[i].description = e.target.value; setVal(n)
                                        }}
                                        className="w-full p-1.5 text-[10px] border rounded"
                                        rows="2"
                                        placeholder="Description"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                />
            </div>

            <div className="w-40 space-y-6">
                <EditableSection
                    sectionName="masteredSkills"
                    data={data.masteredSkills || []}
                    onSave={onSectionEdit}
                    renderDisplay={() => (
                        <>
                            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Skills</h2>
                            <div className="flex flex-wrap gap-1.5">
                                {(data.masteredSkills || []).map((s, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold border border-indigo-100">
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                    renderEdit={(val, setVal) => (
                        <textarea
                            value={val.map(s => s.name).join(', ')}
                            onChange={(e) => {
                                setVal(e.target.value.split(',').map(s => ({ name: s.trim(), level: 'Mastered' })))
                            }}
                            className="w-full p-2 text-[10px] border rounded"
                            rows="4"
                            placeholder="Skills (comma separated)"
                        />
                    )}
                />

                <EditableSection
                    sectionName="education"
                    data={data.education || []}
                    onSave={onSectionEdit}
                    renderDisplay={() => (
                        <>
                            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Education</h2>
                            <div className="space-y-3">
                                {(data.education || []).map((edu, i) => (
                                    <div key={i} className="text-[11px]">
                                        <div className="font-bold text-slate-900">{edu.institution}</div>
                                        <div className="text-slate-500">{edu.degree}</div>
                                        <div className="text-slate-400">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    renderEdit={(val, setVal) => (
                        <div className="space-y-3">
                            {val.map((edu, i) => (
                                <div key={i} className="space-y-1 p-2 border border-slate-100 rounded">
                                    <input
                                        value={edu.institution}
                                        onChange={(e) => {
                                            const n = [...val]; n[i].institution = e.target.value; setVal(n)
                                        }}
                                        className="w-full p-1 text-[9px] border rounded"
                                        placeholder="Institution"
                                    />
                                    <input
                                        value={edu.degree}
                                        onChange={(e) => {
                                            const n = [...val]; n[i].degree = e.target.value; setVal(n)
                                        }}
                                        className="w-full p-1 text-[9px] border rounded"
                                        placeholder="Degree"
                                    />
                                    <input
                                        value={edu.year}
                                        onChange={(e) => {
                                            const n = [...val]; n[i].year = e.target.value; setVal(n)
                                        }}
                                        className="w-full p-1 text-[9px] border rounded"
                                        placeholder="Year"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                />
            </div>
        </div>
    </div>
)

export const ProfessionalTemplate = ({ data, onRegenerate, regeneratingSection, onSectionEdit }) => (
    <div className="bg-white text-slate-900 p-12 shadow-2xl min-h-[842px] w-[595px] flex flex-col gap-6 font-serif">
        <div className="text-center border-b-2 border-slate-900 pb-6 relative group">
            <h1 className="text-4xl font-bold text-slate-900 mb-3 uppercase tracking-tight">{data.fullName}</h1>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest space-y-1">
                <div className="flex justify-center items-center gap-2 flex-wrap">
                    {data.phoneNumber && <span className="truncate">{data.phoneNumber}</span>}
                    {data.phoneNumber && data.email && <span>•</span>}
                    {data.email && <span className="truncate">{data.email}</span>}
                </div>
                {(data.github || data.linkedin || data.portfolio) && (
                    <div className="flex justify-center items-center gap-2 flex-wrap overflow-hidden">
                        {data.github && (
                            <span className="truncate max-w-[180px]" title={data.github}>
                                {data.github.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </span>
                        )}
                        {data.github && data.linkedin && <span>•</span>}
                        {data.linkedin && (
                            <span className="truncate max-w-[180px]" title={data.linkedin}>
                                {data.linkedin.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </span>
                        )}
                        {(data.github || data.linkedin) && data.portfolio && <span>•</span>}
                        {data.portfolio && (
                            <span className="truncate max-w-[180px]" title={data.portfolio}>
                                {data.portfolio.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>

        <EditableSection
            sectionName="summary"
            data={data.summary}
            onSave={onSectionEdit}
            renderDisplay={() => (
                <>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-slate-200 mb-3 pb-1 text-slate-900">Professional Summary</h2>
                    <p className="text-sm text-slate-700 leading-relaxed text-justify">{data.summary}</p>
                </>
            )}
            renderEdit={(val, setVal) => (
                <textarea
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    className="w-full p-3 text-sm border-2 border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-sans"
                    rows="6"
                />
            )}
        />

        <EditableSection
            sectionName="experience"
            data={data.experience || []}
            onSave={onSectionEdit}
            renderDisplay={() => (
                <>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-slate-200 mb-4 pb-1 text-slate-900">Experience</h2>
                    <div className="space-y-6">
                        {(data.experience || []).map((exp, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between items-baseline font-bold text-sm">
                                    <span className="text-slate-900">{exp.company}</span>
                                    <span className="text-[10px] text-slate-500">{exp.duration}</span>
                                </div>
                                <div className="text-xs font-semibold text-slate-600 mb-2 italic">{exp.role}</div>
                                <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line text-justify">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
            renderEdit={(val, setVal) => (
                <div className="space-y-6">
                    {val.map((exp, i) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    value={exp.company}
                                    onChange={(e) => {
                                        const next = [...val]
                                        next[i].company = e.target.value
                                        setVal(next)
                                    }}
                                    placeholder="Company"
                                    className="p-2 text-xs border rounded-md"
                                />
                                <input
                                    value={exp.duration}
                                    onChange={(e) => {
                                        const next = [...val]
                                        next[i].duration = e.target.value
                                        setVal(next)
                                    }}
                                    placeholder="Duration"
                                    className="p-2 text-xs border rounded-md"
                                />
                                <input
                                    value={exp.role}
                                    onChange={(e) => {
                                        const next = [...val]
                                        next[i].role = e.target.value
                                        setVal(next)
                                    }}
                                    placeholder="Role"
                                    className="p-2 text-xs border rounded-md col-span-2"
                                />
                            </div>
                            <textarea
                                value={exp.description}
                                onChange={(e) => {
                                    const next = [...val]
                                    next[i].description = e.target.value
                                    setVal(next)
                                }}
                                placeholder="Description"
                                className="w-full p-2 text-xs border rounded-md"
                                rows="3"
                            />
                        </div>
                    ))}
                </div>
            )}
        />

        <EditableSection
            sectionName="skills"
            data={data.skills || []}
            onSave={onSectionEdit}
            renderDisplay={() => (
                <>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-slate-200 mb-3 pb-1 text-slate-900">Technical Skills</h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {(data.skills || []).map((group, i) => (
                            <div key={i} className="text-[11px]">
                                <span className="font-bold text-slate-900 uppercase tracking-tighter mr-2">{group.category}:</span>
                                <span className="text-slate-600">{Array.isArray(group.items) ? group.items.join(', ') : group.items}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
            renderEdit={(val, setVal) => (
                <div className="space-y-3">
                    {val.map((group, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{group.category}</span>
                            <input
                                value={Array.isArray(group.items) ? group.items.join(', ') : group.items}
                                onChange={(e) => {
                                    const next = [...val]
                                    next[i].items = e.target.value.split(',').map(s => s.trim())
                                    setVal(next)
                                }}
                                className="p-2 text-xs border rounded-md"
                            />
                        </div>
                    ))}
                </div>
            )}
        />

        <div className="grid grid-cols-2 gap-12 mt-2">
            <EditableSection
                sectionName="education"
                data={data.education || []}
                onSave={onSectionEdit}
                renderDisplay={() => (
                    <>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-slate-200 mb-3 pb-1 text-slate-900">Education</h2>
                        {(data.education || []).map((edu, i) => (
                            <div key={i} className="text-[11px] mb-2">
                                <div className="font-bold text-slate-900">{edu.institution}</div>
                                <div className="text-slate-600 italic">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                                <div className="text-[10px] text-slate-400">{edu.year || edu.duration}</div>
                            </div>
                        ))}
                    </>
                )}
                renderEdit={(val, setVal) => (
                    <div className="space-y-4">
                        {val.map((edu, i) => (
                            <div key={i} className="space-y-2 p-2 border border-slate-100 rounded-md">
                                <input
                                    value={edu.institution}
                                    onChange={(e) => {
                                        const next = [...val]
                                        next[i].institution = e.target.value
                                        setVal(next)
                                    }}
                                    placeholder="Institution"
                                    className="w-full p-2 text-[10px] border rounded"
                                />
                                <input
                                    value={edu.degree}
                                    onChange={(e) => {
                                        const next = [...val]
                                        next[i].degree = e.target.value
                                        setVal(next)
                                    }}
                                    placeholder="Degree"
                                    className="w-full p-2 text-[10px] border rounded"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        value={edu.field}
                                        onChange={(e) => {
                                            const next = [...val]
                                            next[i].field = e.target.value
                                            setVal(next)
                                        }}
                                        placeholder="Field"
                                        className="p-2 text-[10px] border rounded"
                                    />
                                    <input
                                        value={edu.year || edu.duration}
                                        onChange={(e) => {
                                            const next = [...val]
                                            next[i].year = e.target.value
                                            setVal(next)
                                        }}
                                        placeholder="Year"
                                        className="p-2 text-[10px] border rounded"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            />

            {data.certificates && (
                <EditableSection
                    sectionName="certificates"
                    data={data.certificates || []}
                    onSave={onSectionEdit}
                    renderDisplay={() => (
                        <>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-slate-200 mb-3 pb-1 text-slate-900">Certifications</h2>
                            <ul className="text-[11px] text-slate-600 space-y-1">
                                {data.certificates.map((c, i) => (
                                    <li key={i} className="flex justify-between">
                                        <span className="font-semibold text-slate-800">{c.name || c.title}</span>
                                        <span className="text-[10px] text-slate-400">{c.year || c.issueYear}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    renderEdit={(val, setVal) => (
                        <div className="space-y-2">
                            {val.map((c, i) => (
                                <div key={i} className="grid grid-cols-3 gap-2 p-2 border border-slate-100 rounded-md">
                                    <input
                                        value={c.name || c.title}
                                        onChange={(e) => {
                                            const next = [...val]
                                            next[i].name = e.target.value
                                            setVal(next)
                                        }}
                                        placeholder="Name"
                                        className="col-span-2 p-1 text-[10px] border rounded"
                                    />
                                    <input
                                        value={c.year || c.issueYear}
                                        onChange={(e) => {
                                            const next = [...val]
                                            next[i].year = e.target.value
                                            setVal(next)
                                        }}
                                        placeholder="Year"
                                        className="p-1 text-[10px] border rounded"
                                    />
                                    <input
                                        value={c.issuer}
                                        onChange={(e) => {
                                            const next = [...val]
                                            next[i].issuer = e.target.value
                                            setVal(next)
                                        }}
                                        placeholder="Issuer"
                                        className="col-span-3 p-1 text-[10px] border rounded"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                />
            )}
        </div>
    </div>
)

export const TechnicalTemplate = ({ data, onSectionEdit }) => (
    <div className="bg-white text-slate-900 p-10 shadow-2xl min-h-[842px] w-[595px] flex flex-col gap-6 font-mono text-left">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
                <h1 className="text-3xl font-black">{data.fullName || 'Your Name'}</h1>
                <p className="text-sm text-slate-600 mt-1">{data.targetRole || ''}</p>
            </div>
            <div className="text-right text-[10px]">
                <p>{data.email || ''}</p>
                <p>{data.phoneNumber || ''}</p>
                <p>{data.github ? data.github.replace(/^https?:\/\//, '') : ''}</p>
                <p>{data.linkedin ? data.linkedin.replace(/^https?:\/\//, '') : ''}</p>
            </div>
        </div>

        <EditableSection
            sectionName="skills"
            data={data.skills || []}
            onSave={onSectionEdit}
            renderDisplay={() => (
                <>
                    <h2 className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 inline-block mb-2">/TECHNICAL_SKILLS</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        {(data.skills || []).map((group, i) => (
                            <div key={i}><span className="font-bold">{group.category}:</span> {Array.isArray(group.items) ? group.items.join(', ') : group.items}</div>
                        ))}
                    </div>
                </>
            )}
            renderEdit={(val, setVal) => (
                <div className="space-y-2">
                    {val.map((group, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <span className="text-[10px] w-20 shrink-0">{group.category}</span>
                            <input
                                value={Array.isArray(group.items) ? group.items.join(', ') : group.items}
                                onChange={(e) => {
                                    const n = [...val]; n[i].items = e.target.value.split(',').map(s => s.trim()); setVal(n)
                                }}
                                className="flex-1 p-1 text-[10px] border rounded font-mono"
                            />
                        </div>
                    ))}
                </div>
            )}
        />

        <EditableSection
            sectionName="experience"
            data={data.experience || []}
            onSave={onSectionEdit}
            renderDisplay={() => (
                <>
                    <h2 className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 inline-block mb-3">/EXPERIENCE</h2>
                    <div className="space-y-4">
                        {(data.experience || []).map((exp, i) => (
                            <div key={i} className="border-l-2 border-slate-200 pl-4">
                                <div className="flex justify-between text-xs font-bold">
                                    <span>{exp.company} // {exp.role}</span>
                                    <span>[{exp.duration}]</span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-1 leading-snug whitespace-pre-line">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
            renderEdit={(val, setVal) => (
                <div className="space-y-4">
                    {val.map((exp, i) => (
                        <div key={i} className="space-y-2 p-2 border border-slate-200 rounded">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    value={exp.company}
                                    onChange={(e) => { const n = [...val]; n[i].company = e.target.value; setVal(n) }}
                                    className="p-1 text-[10px] border rounded"
                                    placeholder="Company"
                                />
                                <input
                                    value={exp.duration}
                                    onChange={(e) => { const n = [...val]; n[i].duration = e.target.value; setVal(n) }}
                                    className="p-1 text-[10px] border rounded"
                                    placeholder="Duration"
                                />
                            </div>
                            <input
                                value={exp.role}
                                onChange={(e) => { const n = [...val]; n[i].role = e.target.value; setVal(n) }}
                                className="w-full p-1 text-[10px] border rounded font-bold"
                                placeholder="Role"
                            />
                            <textarea
                                value={exp.description}
                                onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                                className="w-full p-1 text-[10px] border rounded"
                                rows="3"
                                placeholder="Description"
                            />
                        </div>
                    ))}
                </div>
            )}
        />

        <EditableSection
            sectionName="projects"
            data={data.projects || []}
            onSave={onSectionEdit}
            renderDisplay={() => (
                <>
                    <h2 className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 inline-block mb-3">/KEY_PROJECTS</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {(data.projects || []).map((proj, i) => (
                            <div key={i} className="bg-slate-50 p-3 rounded border border-slate-200">
                                <h3 className="text-xs font-bold border-b border-slate-200 pb-1 mb-1">{proj.title}</h3>
                                <p className="text-[10px] text-slate-500 mb-2 leading-tight">{proj.description}</p>
                                <div className="text-[9px] font-bold text-indigo-600 uppercase tracking-tighter">{(proj.techStack || []).join(' | ')}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            renderEdit={(val, setVal) => (
                <div className="grid grid-cols-2 gap-3">
                    {val.map((proj, i) => (
                        <div key={i} className="p-2 border rounded space-y-2">
                            <input
                                value={proj.title}
                                onChange={(e) => { const n = [...val]; n[i].title = e.target.value; setVal(n) }}
                                className="w-full p-1 text-[9px] border rounded font-bold"
                                placeholder="Title"
                            />
                            <textarea
                                value={proj.description}
                                onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                                className="w-full p-1 text-[9px] border rounded"
                                rows="2"
                                placeholder="Description"
                            />
                            <input
                                value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                                onChange={(e) => { const n = [...val]; n[i].techStack = e.target.value.split(',').map(s => s.trim()); setVal(n) }}
                                className="w-full p-1 text-[9px] border rounded"
                                placeholder="Tech Stack"
                            />
                        </div>
                    ))}
                </div>
            )}
        />
    </div>
)

export const MinimalTemplate = ({ data, onSectionEdit }) => {
    const fullNameParts = (data.fullName || 'Your Name').split(' ')
    const firstName = fullNameParts[0] || ''
    const lastName = fullNameParts.slice(1).join(' ') || ''

    return (
        <div className="bg-white text-slate-900 p-16 shadow-2xl min-h-[842px] w-[595px] flex flex-col gap-12 font-sans text-left">
            <header>
                <h1 className="text-5xl font-extralight tracking-tighter text-slate-900 mb-2">
                    {firstName}<span className="font-black">{lastName}</span>
                </h1>
                <p className="text-slate-400 tracking-[0.2em] text-xs uppercase">{data.targetRole || ''}</p>
            </header>

            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-8 space-y-10">
                    <EditableSection
                        sectionName="summary"
                        data={data.summary || ''}
                        onSave={onSectionEdit}
                        renderDisplay={() => (
                            <p className="text-lg font-light leading-relaxed text-slate-600">{data.summary || ''}</p>
                        )}
                        renderEdit={(val, setVal) => (
                            <textarea
                                value={val}
                                onChange={(e) => setVal(e.target.value)}
                                className="w-full p-3 text-sm border-b-2 border-slate-200 outline-none focus:border-slate-900 transition-colors bg-transparent"
                                rows="5"
                            />
                        )}
                    />

                    <EditableSection
                        sectionName="experience"
                        data={data.experience || []}
                        onSave={onSectionEdit}
                        renderDisplay={() => (
                            <div className="space-y-8">
                                {(data.experience || []).map((exp, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-md font-bold">{exp.company}</h3>
                                            <span className="text-[10px] text-slate-300 uppercase tracking-widest">{exp.duration}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-2 underline decoration-slate-200 underline-offset-4">{exp.role}</p>
                                        <p className="text-xs leading-relaxed text-slate-400 whitespace-pre-line">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        renderEdit={(val, setVal) => (
                            <div className="space-y-6">
                                {val.map((exp, i) => (
                                    <div key={i} className="space-y-2 pb-4 border-b border-slate-100">
                                        <div className="flex gap-2">
                                            <input
                                                value={exp.company}
                                                onChange={(e) => { const n = [...val]; n[i].company = e.target.value; setVal(n) }}
                                                className="flex-1 p-1 text-xs font-bold border-b border-slate-100 outline-none focus:border-slate-900"
                                                placeholder="Company"
                                            />
                                            <input
                                                value={exp.duration}
                                                onChange={(e) => { const n = [...val]; n[i].duration = e.target.value; setVal(n) }}
                                                className="w-24 p-1 text-[10px] text-slate-300 border-b border-slate-100 outline-none"
                                                placeholder="Duration"
                                            />
                                        </div>
                                        <input
                                            value={exp.role}
                                            onChange={(e) => { const n = [...val]; n[i].role = e.target.value; setVal(n) }}
                                            className="w-full p-1 text-[10px] text-slate-500 border-b border-slate-100 outline-none"
                                            placeholder="Role"
                                        />
                                        <textarea
                                            value={exp.description}
                                            onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                                            className="w-full p-1 text-[10px] text-slate-400 border-b border-slate-100 outline-none"
                                            rows="3"
                                            placeholder="Description"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                </div>

                <div className="col-span-4 space-y-10">
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Contact</h4>
                        <div className="text-[10px] text-slate-400 space-y-1">
                            <p>{data.email || ''}</p>
                            <p>{data.phoneNumber || ''}</p>
                            <p>{data.location || ''}</p>
                            {data.github && <p>{data.github.replace(/^https?:\/\//, '')}</p>}
                            {data.linkedin && <p>{data.linkedin.replace(/^https?:\/\//, '')}</p>}
                        </div>
                    </section>

                    <EditableSection
                        sectionName="masteredSkills"
                        data={data.masteredSkills || []}
                        onSave={onSectionEdit}
                        renderDisplay={() => (
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Expertise</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(data.masteredSkills || []).map((s, i) => (
                                        <span key={i} className="text-[10px] font-bold text-slate-500 border-b border-slate-200 pb-0.5">{s.name}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        renderEdit={(val, setVal) => (
                            <textarea
                                value={val.map(s => s.name).join(', ')}
                                onChange={(e) => setVal(e.target.value.split(',').map(s => ({ name: s.trim(), level: 'Mastered' })))}
                                className="w-full p-2 text-[10px] text-slate-500 border rounded font-sans"
                                rows="4"
                            />
                        )}
                    />

                    <EditableSection
                        sectionName="education"
                        data={data.education || []}
                        onSave={onSectionEdit}
                        renderDisplay={() => (
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Learning</h4>
                                {(data.education || []).map((edu, i) => (
                                    <div key={i} className="text-[10px] text-slate-400">
                                        <p className="font-bold text-slate-500">{edu.institution}</p>
                                        <p>{edu.degree}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        renderEdit={(val, setVal) => (
                            <div className="space-y-2">
                                {val.map((edu, i) => (
                                    <div key={i} className="space-y-1">
                                        <input
                                            value={edu.institution}
                                            onChange={(e) => { const n = [...val]; n[i].institution = e.target.value; setVal(n) }}
                                            className="w-full p-1 text-[10px] border-b outline-none"
                                            placeholder="Institution"
                                        />
                                        <input
                                            value={edu.degree}
                                            onChange={(e) => { const n = [...val]; n[i].degree = e.target.value; setVal(n) }}
                                            className="w-full p-1 text-[9px] border-b outline-none"
                                            placeholder="Degree"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    )
}

import React from 'react'
import { RotateCw } from 'lucide-react'

export const ModernTemplate = ({ data }) => (
    <div className="bg-white text-slate-900 p-8 shadow-2xl min-h-[842px] w-[595px] flex flex-col gap-6 font-sans">
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

        <section>
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2">Professional Summary</h2>
            <p className="text-slate-700 text-sm leading-relaxed">{data.summary}</p>
        </section>

        <div className="flex gap-8">
            <div className="flex-1 space-y-6">
                <section>
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
                </section>

                <section>
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
                </section>
            </div>

            <div className="w-40 space-y-6">
                <section>
                    <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Skills</h2>
                    <div className="flex flex-wrap gap-1.5">
                        {(data.masteredSkills || []).map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold border border-indigo-100">
                                {s.name}
                            </span>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Education</h2>
                    <div className="space-y-3">
                        {data.education.map((edu, i) => (
                            <div key={i} className="text-[11px]">
                                <div className="font-bold text-slate-900">{edu.institution}</div>
                                <div className="text-slate-500">{edu.degree}</div>
                                <div className="text-slate-400">{edu.year}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {data.certificates && data.certificates.length > 0 && (
                    <section>
                        <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Certifications</h2>
                        <div className="space-y-2">
                            {data.certificates.map((cert, i) => (
                                <div key={i} className="text-[11px]">
                                    <div className="font-bold text-slate-900 leading-tight">{cert.name || cert.title}</div>
                                    <div className="text-[10px] text-slate-500">{cert.issuer} • {cert.year || cert.issueYear}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    </div>
)

export const ProfessionalTemplate = ({ data, onRegenerate, regeneratingSection }) => (
    <div className="bg-white text-slate-900 p-12 shadow-2xl min-h-[842px] w-[595px] flex flex-col gap-6 font-serif">
        <div className="text-center border-b-2 border-slate-900 pb-6">
            <h1 className="text-4xl font-bold text-slate-900 mb-3 uppercase tracking-tight">{data.fullName}</h1>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest space-y-1">
                {/* Row 1: Phone and Email */}
                <div className="flex justify-center items-center gap-2 flex-wrap">
                    {data.phoneNumber && <span className="truncate">{data.phoneNumber}</span>}
                    {data.phoneNumber && data.email && <span>•</span>}
                    {data.email && <span className="truncate">{data.email}</span>}
                </div>

                {/* Row 2: GitHub, LinkedIn, Portfolio (only if they exist) */}
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

        <section className="group relative">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-slate-200 mb-3 pb-1 text-slate-900">Professional Summary</h2>
            {onRegenerate && (
                <button
                    onClick={() => onRegenerate('summary')}
                    disabled={regeneratingSection === 'summary'}
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-indigo-50 rounded text-indigo-600 disabled:opacity-50"
                    title="Regenerate summary"
                >
                    <RotateCw size={12} className={regeneratingSection === 'summary' ? 'animate-spin' : ''} />
                </button>
            )}
            <p className="text-sm text-slate-700 leading-relaxed text-justify">{data.summary}</p>
        </section>

        <section className="group relative">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-slate-200 mb-4 pb-1 text-slate-900">Experience</h2>
            {onRegenerate && (
                <button
                    onClick={() => onRegenerate('experience')}
                    disabled={regeneratingSection === 'experience'}
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-indigo-50 rounded text-indigo-600 disabled:opacity-50"
                    title="Regenerate experience"
                >
                    <RotateCw size={12} className={regeneratingSection === 'experience' ? 'animate-spin' : ''} />
                </button>
            )}
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
        </section>

        <section className="group relative">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-slate-200 mb-3 pb-1 text-slate-900">Technical Skills</h2>
            {onRegenerate && (
                <button
                    onClick={() => onRegenerate('skills')}
                    disabled={regeneratingSection === 'skills'}
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-indigo-50 rounded text-indigo-600 disabled:opacity-50"
                    title="Regenerate skills"
                >
                    <RotateCw size={12} className={regeneratingSection === 'skills' ? 'animate-spin' : ''} />
                </button>
            )}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {(data.skills || []).map((group, i) => (
                    <div key={i} className="text-[11px]">
                        <span className="font-bold text-slate-900 uppercase tracking-tighter mr-2">{group.category}:</span>
                        <span className="text-slate-600">{Array.isArray(group.items) ? group.items.join(', ') : group.items}</span>
                    </div>
                ))}
            </div>
        </section>

        <div className="grid grid-cols-2 gap-12 mt-2">
            <section>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-slate-200 mb-3 pb-1 text-slate-900">Education</h2>
                {(data.education || []).map((edu, i) => (
                    <div key={i} className="text-[11px] mb-2">
                        <div className="font-bold text-slate-900">{edu.institution}</div>
                        <div className="text-slate-600 italic">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                        <div className="text-[10px] text-slate-400">{edu.year || edu.duration}</div>
                    </div>
                ))}
            </section>

            {data.certificates && data.certificates.length > 0 && (
                <section className="group relative">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-slate-200 mb-3 pb-1 text-slate-900">Certifications</h2>
                    {onRegenerate && (
                        <button
                            onClick={() => onRegenerate('certificates')}
                            disabled={regeneratingSection === 'certificates'}
                            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-indigo-50 rounded text-indigo-600 disabled:opacity-50"
                            title="Regenerate certificates"
                        >
                            <RotateCw size={12} className={regeneratingSection === 'certificates' ? 'animate-spin' : ''} />
                        </button>
                    )}
                    <ul className="text-[11px] text-slate-600 space-y-1">
                        {data.certificates.map((c, i) => (
                            <li key={i} className="flex justify-between">
                                <span className="font-semibold text-slate-800">{c.name || c.title}</span>
                                <span className="text-[10px] text-slate-400">{c.year || c.issueYear}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    </div>
)

export const TechnicalTemplate = ({ data }) => (
    <div className="bg-white text-slate-900 p-10 shadow-2xl min-h-[842px] w-[595px] flex flex-col gap-6 font-mono">
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

        <section>
            <h2 className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 inline-block mb-2">/TECHNICAL_SKILLS</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {(data.skills || []).map((group, i) => (
                    <div key={i}><span className="font-bold">{group.category}:</span> {Array.isArray(group.items) ? group.items.join(', ') : group.items}</div>
                ))}
            </div>
        </section>

        <section>
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
        </section>

        <section>
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
        </section>

        {data.certificates && data.certificates.length > 0 && (
            <section>
                <h2 className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 inline-block mb-3">/CERTIFICATIONS</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    {data.certificates.map((cert, i) => (
                        <div key={i} className="text-[11px] flex justify-between border-b border-slate-100 pb-1">
                            <span className="font-bold text-slate-900">{cert.name || cert.title}</span>
                            <span className="text-slate-500 font-mono">[{cert.year || cert.issueYear}]</span>
                        </div>
                    ))}
                </div>
            </section>
        )}
    </div>
)

export const MinimalTemplate = ({ data }) => {
    const fullNameParts = (data.fullName || 'Your Name').split(' ')
    const firstName = fullNameParts[0] || ''
    const lastName = fullNameParts.slice(1).join(' ') || ''

    return (
        <div className="bg-white text-slate-900 p-16 shadow-2xl min-h-[842px] w-[595px] flex flex-col gap-12 font-sans">
            <header>
                <h1 className="text-5xl font-extralight tracking-tighter text-slate-900 mb-2">
                    {firstName}<span className="font-black">{lastName}</span>
                </h1>
                <p className="text-slate-400 tracking-[0.2em] text-xs uppercase">{data.targetRole || ''}</p>
            </header>

            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-8 space-y-10">
                    <section>
                        <p className="text-lg font-light leading-relaxed text-slate-600">{data.summary || ''}</p>
                    </section>

                    <section className="space-y-8">
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
                    </section>
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

                    <section className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Expertise</h4>
                        <div className="flex flex-wrap gap-2">
                            {(data.masteredSkills || []).map((s, i) => (
                                <span key={i} className="text-[10px] font-bold text-slate-500 border-b border-slate-200 pb-0.5">{s.name}</span>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Learning</h4>
                        {(data.education || []).map((edu, i) => (
                            <div key={i} className="text-[10px] text-slate-400">
                                <p className="font-bold text-slate-500">{edu.institution}</p>
                                <p>{edu.degree}</p>
                            </div>
                        ))}
                    </section>

                    {data.certificates && data.certificates.length > 0 && (
                        <section className="space-y-4 border-t border-slate-50 pt-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Certifications</h4>
                            <div className="space-y-3">
                                {data.certificates.map((cert, i) => (
                                    <div key={i} className="text-[10px] text-slate-400">
                                        <p className="font-bold text-slate-500">{cert.name || cert.title}</p>
                                        <p className="text-[9px]">{cert.issuer} • {cert.year || cert.issueYear}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
}

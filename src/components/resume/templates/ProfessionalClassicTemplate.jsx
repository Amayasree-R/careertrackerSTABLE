import React, { useState, Component } from 'react'
import { AlertTriangle, Pencil, Check, X } from 'lucide-react'

// Error Boundary
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
          <p className="text-sm text-red-700">The resume template crashed while rendering.</p>
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

const renderHeading = (title, themeColor) => (
  <div className="mt-6 mb-4">
    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider" style={{ color: themeColor }}>
      {title}
    </h2>
    <hr className="border-none mt-2 mb-3" style={{ borderTop: `2px solid ${themeColor}` }} />
  </div>
)

export default function ProfessionalClassicTemplate({ data, onSectionEdit, themeColor = '#1e293b' }) {
  if (!data || Object.keys(data).length <= 1) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-400 font-bold">Generate a resume to see the preview</p>
      </div>
    )
  }

  const safe = (val, fallback) => val !== undefined && val !== null ? val : fallback
  const safeArray = (val) => Array.isArray(val) ? val : []

  return (
    <ResumeErrorBoundary>
      <div className="w-full bg-white p-12 min-h-[1056px] text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <div className="mb-8 border-b-2 pb-6" style={{ borderColor: themeColor }}>
          <h1 className="text-4xl font-bold mb-2" style={{ color: themeColor }}>
            {data.fullName || 'Your Name'}
          </h1>
          <p className="text-sm text-gray-600">
            {[data.contact?.email || data.email, data.contact?.phone || data.phoneNumber, data.location]
              .filter(Boolean)
              .join(' • ')}
          </p>
          {(data.contact?.linkedin || data.linkedin) && (
            <p className="text-sm text-gray-600">
              LinkedIn: {data.contact?.linkedin || data.linkedin}
            </p>
          )}
        </div>

        {/* Summary */}
        {data.summary && (
          <EditableSection
            sectionName="summary"
            data={data.summary}
            onSave={onSectionEdit}
            renderDisplay={() => (
              <div>
                {renderHeading('PROFESSIONAL SUMMARY', themeColor)}
                <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
              </div>
            )}
            renderEdit={(val, setVal) => (
              <textarea
                value={val}
                onChange={(e) => setVal(e.target.value)}
                rows="3"
                className="w-full p-2 text-sm border rounded"
              />
            )}
          />
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <EditableSection
            sectionName="experience"
            data={data.experience}
            onSave={onSectionEdit}
            renderDisplay={() => (
              <div>
                {renderHeading('WORK EXPERIENCE', themeColor)}
                <div className="space-y-4">
                  {data.experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900">{exp.role}</h3>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                        </div>
                        <p className="text-sm text-gray-600">{exp.duration}</p>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            renderEdit={(val, setVal) => (
              <div className="space-y-4">
                {val.map((exp, i) => (
                  <div key={i} className="p-3 border rounded">
                    <input
                      value={exp.role}
                      onChange={(e) => { const n = [...val]; n[i].role = e.target.value; setVal(n) }}
                      className="w-full p-1 text-sm border rounded mb-2" placeholder="Role"
                    />
                    <input
                      value={exp.company}
                      onChange={(e) => { const n = [...val]; n[i].company = e.target.value; setVal(n) }}
                      className="w-full p-1 text-sm border rounded mb-2" placeholder="Company"
                    />
                    <input
                      value={exp.duration}
                      onChange={(e) => { const n = [...val]; n[i].duration = e.target.value; setVal(n) }}
                      className="w-full p-1 text-sm border rounded mb-2" placeholder="Duration"
                    />
                    <textarea
                      value={exp.description}
                      onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                      rows="2" className="w-full p-1 text-sm border rounded" placeholder="Description"
                    />
                  </div>
                ))}
              </div>
            )}
          />
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <EditableSection
            sectionName="skills"
            data={data.skills}
            onSave={onSectionEdit}
            renderDisplay={() => (
              <div>
                {renderHeading('SKILLS', themeColor)}
                <div className="space-y-3">
                  {data.skills.map((skillGroup, i) => (
                    <div key={i}>
                      <h4 className="font-semibold text-sm text-gray-900">{skillGroup.category}</h4>
                      <p className="text-sm text-gray-700">{safeArray(skillGroup.items).join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            renderEdit={(val, setVal) => (
              <div className="space-y-3">
                {val.map((skillGroup, i) => (
                  <div key={i} className="p-3 border rounded">
                    <input
                      value={skillGroup.category}
                      onChange={(e) => { const n = [...val]; n[i].category = e.target.value; setVal(n) }}
                      className="w-full p-1 text-sm border rounded mb-2" placeholder="Category"
                    />
                    <textarea
                      value={safeArray(skillGroup.items).join(', ')}
                      onChange={(e) => { const n = [...val]; n[i].items = e.target.value.split(',').map(s => s.trim()); setVal(n) }}
                      rows="2" className="w-full p-1 text-sm border rounded" placeholder="Skills (comma separated)"
                    />
                  </div>
                ))}
              </div>
            )}
          />
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <EditableSection
            sectionName="education"
            data={data.education}
            onSave={onSectionEdit}
            renderDisplay={() => (
              <div>
                {renderHeading('EDUCATION', themeColor)}
                <div className="space-y-3">
                  {data.education.map((edu, i) => (
                    <div key={i}>
                      <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                      <p className="text-sm text-gray-700">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                      {edu.startYear && <p className="text-sm text-gray-600">{edu.startYear} - {edu.endYear}</p>}
                      {edu.description && <p className="text-sm text-gray-700 mt-1">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            renderEdit={(val, setVal) => (
              <div className="space-y-3">
                {val.map((edu, i) => (
                  <div key={i} className="p-3 border rounded">
                    <input
                      value={edu.institution}
                      onChange={(e) => { const n = [...val]; n[i].institution = e.target.value; setVal(n) }}
                      className="w-full p-1 text-sm border rounded mb-2" placeholder="Institution"
                    />
                    <input
                      value={edu.degree}
                      onChange={(e) => { const n = [...val]; n[i].degree = e.target.value; setVal(n) }}
                      className="w-full p-1 text-sm border rounded mb-2" placeholder="Degree"
                    />
                    <input
                      value={edu.field}
                      onChange={(e) => { const n = [...val]; n[i].field = e.target.value; setVal(n) }}
                      className="w-full p-1 text-sm border rounded mb-2" placeholder="Field"
                    />
                    <textarea
                      value={edu.description}
                      onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                      rows="2" className="w-full p-1 text-sm border rounded" placeholder="Description"
                    />
                  </div>
                ))}
              </div>
            )}
          />
        )}

        {/* Achievements */}
        {data.achievements && data.achievements.length > 0 && (
          <EditableSection
            sectionName="achievements"
            data={data.achievements}
            onSave={onSectionEdit}
            renderDisplay={() => (
              <div>
                {renderHeading('KEY ACHIEVEMENTS', themeColor)}
                <ul className="space-y-2 ml-4 list-disc">
                  {data.achievements.map((ach, i) => {
                    const heading = typeof ach === 'string' ? ach : ach.heading
                    const description = typeof ach === 'string' ? '' : ach.description
                    return (
                      <li key={i} className="text-sm text-gray-700">
                        <strong>{heading}</strong> {description && `– ${description}`}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            renderEdit={(val, setVal) => (
              <div className="space-y-3">
                {val.map((ach, i) => (
                  <div key={i} className="p-3 border rounded">
                    <input
                      value={typeof ach === 'string' ? ach : ach.heading}
                      onChange={(e) => { const n = [...val]; n[i] = { heading: e.target.value, description: typeof ach === 'string' ? '' : ach.description }; setVal(n) }}
                      className="w-full p-1 text-sm border rounded mb-2" placeholder="Achievement"
                    />
                    <textarea
                      value={typeof ach === 'string' ? '' : ach.description}
                      onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                      rows="2" className="w-full p-1 text-sm border rounded" placeholder="Description"
                    />
                  </div>
                ))}
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
              <div>
                {renderHeading('PROJECTS', themeColor)}
                <div className="space-y-4">
                  {data.projects.map((proj, i) => (
                    <div key={i}>
                      <h3 className="font-bold text-gray-900">
                        {proj.title} {proj.techStack && `(${safeArray(proj.techStack).join(', ')})`}
                      </h3>
                      <p className="text-sm text-gray-700">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            renderEdit={(val, setVal) => (
              <div className="space-y-3">
                {val.map((proj, i) => (
                  <div key={i} className="p-3 border rounded">
                    <input
                      value={proj.title}
                      onChange={(e) => { const n = [...val]; n[i].title = e.target.value; setVal(n) }}
                      className="w-full p-1 text-sm border rounded mb-2" placeholder="Title"
                    />
                    <textarea
                      value={proj.description}
                      onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                      rows="2" className="w-full p-1 text-sm border rounded" placeholder="Description"
                    />
                  </div>
                ))}
              </div>
            )}
          />
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <EditableSection
            sectionName="languages"
            data={data.languages}
            onSave={onSectionEdit}
            renderDisplay={() => (
              <div>
                {renderHeading('LANGUAGES', themeColor)}
                <p className="text-sm text-gray-700">
                  {data.languages.map((lang, i) => {
                    const langName = typeof lang === 'string' ? lang : lang.name || lang
                    return <span key={i}>{langName}{i < data.languages.length - 1 ? ', ' : ''}</span>
                  })}
                </p>
              </div>
            )}
            renderEdit={(val, setVal) => (
              <div className="space-y-2">
                {val.map((lang, i) => (
                  <input
                    key={i}
                    value={typeof lang === 'string' ? lang : lang.name || lang}
                    onChange={(e) => { const n = [...val]; n[i] = e.target.value; setVal(n) }}
                    className="w-full p-1 text-sm border rounded" placeholder="Language"
                  />
                ))}
              </div>
            )}
          />
        )}

        {/* Interests */}
        {data.interests && data.interests.length > 0 && (
          <EditableSection
            sectionName="interests"
            data={data.interests}
            onSave={onSectionEdit}
            renderDisplay={() => (
              <div>
                {renderHeading('INTERESTS', themeColor)}
                <p className="text-sm text-gray-700">
                  {data.interests.join(', ')}
                </p>
              </div>
            )}
            renderEdit={(val, setVal) => (
              <div className="space-y-2">
                {val.map((interest, i) => (
                  <input
                    key={i}
                    value={interest}
                    onChange={(e) => { const n = [...val]; n[i] = e.target.value; setVal(n) }}
                    className="w-full p-1 text-sm border rounded" placeholder="Interest"
                  />
                ))}
              </div>
            )}
          />
        )}
      </div>
    </ResumeErrorBoundary>
  )
}

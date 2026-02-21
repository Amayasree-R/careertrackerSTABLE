import { useState } from 'react'

export default function ResumePreview({
  userId,
  resumeData,
  apiBaseUrl,
  onResumeUpdated,
  onAnalyze,
  onDelete
}) {
  const [editing, setEditing] = useState(false)
  const [editedData, setEditedData] = useState(JSON.parse(JSON.stringify(resumeData)))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleEditField = (section, index, field, value) => {
    const newData = { ...editedData }
    if (section === 'skills' || section === 'tools') {
      newData[section][index] = value
    } else {
      newData[section][index][field] = value
    }
    setEditedData(newData)
  }

  const handleAddItem = (section) => {
    const newData = { ...editedData }
    if (section === 'skills' || section === 'tools') {
      newData[section].push('')
    } else if (section === 'projects') {
      newData[section].push({
        title: '',
        description: '',
        techStack: []
      })
    } else if (section === 'experience') {
      newData[section].push({
        company: '',
        role: '',
        duration: '',
        description: ''
      })
    } else if (section === 'education') {
      newData[section].push({
        institution: '',
        degree: '',
        field: '',
        year: null
      })
    } else if (section === 'certifications') {
      newData[section].push({
        name: '',
        issuer: '',
        date: ''
      })
    }
    setEditedData(newData)
  }

  const handleRemoveItem = (section, index) => {
    const newData = { ...editedData }
    newData[section].splice(index, 1)
    setEditedData(newData)
  }

  const handleSaveEdits = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      const response = await fetch(`${apiBaseUrl}/api/resume/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeData: editedData })
      })

      if (!response.ok) {
        throw new Error('Failed to save changes')
      }

      const data = await response.json()
      onResumeUpdated(data.resumeData)
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  const displayData = editing ? editedData : resumeData

  // Combine skills and tools for display when not editing
  const combinedSkills = [
    ...(displayData?.skills || []),
    ...(displayData?.tools || [])
  ].filter((v, i, a) => a.indexOf(v) === i) // Deduplicate

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Controls - Standardized with Dashboard Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div className="flex flex-wrap gap-4">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center gap-2"
              >
                <span>✏️</span> Edit Profile
              </button>
              <button
                onClick={onDelete}
                className="px-8 py-3 bg-white text-red-600 border border-red-100 rounded-2xl font-bold hover:bg-red-50 transition shadow-sm flex items-center gap-2"
              >
                <span>🗑️</span> Delete Data
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSaveEdits}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>✓</span>
                )}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-8 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition shadow-sm"
              >
                ✕ Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-700 font-bold flex items-center gap-3">
          <span className="text-xl">⚠️</span> {error}
        </div>
      )}

      {/* Technical Skills Section - Merged and Full Width */}
      <Section
        title="Technical Skills"
        icon="⚙️"
        items={editing ? displayData?.skills : combinedSkills}
        editing={editing}
        onEdit={(index, value) => handleEditField('skills', index, null, value)}
        onAdd={() => handleAddItem('skills')}
        onRemove={(index) => handleRemoveItem('skills', index)}
        fullWidth
        renderItem={(item) => <Tag text={item} />}
      />

      {/* Tools Section - Only shown when editing for precise control */}
      {editing && (
        <Section
          title="Tools & Technologies"
          icon="🛠️"
          items={displayData?.tools || []}
          editing={editing}
          onEdit={(index, value) => handleEditField('tools', index, null, value)}
          onAdd={() => handleAddItem('tools')}
          onRemove={(index) => handleRemoveItem('tools', index)}
          fullWidth
          renderItem={(item) => <Tag text={item} />}
        />
      )}

      {/* Experience Section */}
      <Section
        title="Professional Experience"
        icon="💼"
        items={displayData?.experience || []}
        editing={editing}
        onAdd={() => handleAddItem('experience')}
        onRemove={(index) => handleRemoveItem('experience', index)}
        fullWidth
        renderItem={(item, index) => (
          <ExperienceItem
            item={item}
            editing={editing}
            onEdit={(field, value) => handleEditField('experience', index, field, value)}
          />
        )}
      />

      {/* Education & Certs Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Section
          title="Education"
          icon="🎓"
          items={displayData?.education || []}
          editing={editing}
          onAdd={() => handleAddItem('education')}
          onRemove={(index) => handleRemoveItem('education', index)}
          renderItem={(item, index) => (
            <EducationItem
              item={item}
              editing={editing}
              onEdit={(field, value) => handleEditField('education', index, field, value)}
            />
          )}
        />

        <Section
          title="Certifications"
          icon="🏆"
          items={displayData?.certifications || []}
          editing={editing}
          onAdd={() => handleAddItem('certifications')}
          onRemove={(index) => handleRemoveItem('certifications', index)}
          renderItem={(item, index) => (
            <CertificationItem
              item={item}
              editing={editing}
              onEdit={(field, value) => handleEditField('certifications', index, field, value)}
            />
          )}
        />
      </div>

      {/* Projects Section */}
      <Section
        title="Project Showcase"
        icon="🚀"
        items={displayData?.projects || []}
        editing={editing}
        onAdd={() => handleAddItem('projects')}
        onRemove={(index) => handleRemoveItem('projects', index)}
        fullWidth
        renderItem={(item, index) => (
          <ProjectItem
            item={item}
            editing={editing}
            onEdit={(field, value) => handleEditField('projects', index, field, value)}
          />
        )}
      />
    </div>
  )
}

function Section({ title, icon, items, editing, onAdd, onRemove, renderItem, fullWidth }) {
  return (
    <div className={`bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6 flex flex-col ${fullWidth ? 'h-auto' : 'min-h-[300px]'} transition-all hover:shadow-2xl hover:shadow-slate-200/60`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <span className="text-xl">{icon}</span>
          </div>
          <h4 className="font-black text-slate-900 text-xl leading-tight">
            {title}
          </h4>
        </div>
        {editing && (
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-black text-xs uppercase tracking-widest transition"
          >
            + Add New
          </button>
        )}
      </div>

      <div className={`flex flex-wrap gap-3 ${fullWidth && !['Technical Skills', 'Tools & Technologies'].includes(title) ? 'block space-y-4' : ''}`}>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className={`relative group ${fullWidth && !['Technical Skills', 'Tools & Technologies'].includes(title) ? 'w-full' : ''}`}>
              <div className={fullWidth && !['Technical Skills', 'Tools & Technologies'].includes(title) ? 'w-full' : 'inline-block mr-2 mb-2'}>
                {editing && ['Technical Skills', 'Tools & Technologies'].includes(title) ? (
                  <input
                    value={item || ''}
                    onChange={(e) => onRemove(index, e.target.value)} // Reusing onRemove for edit in skills list
                    className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-32"
                    placeholder="Skill..."
                  />
                ) : renderItem(item, index)}
              </div>
              {editing && (
                <button
                  onClick={() => onRemove(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg hover:bg-red-600 transition z-10"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center w-full bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100/50 flex flex-col items-center justify-center gap-2">
            <div className="text-3xl opacity-20">📭</div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No {title.toLowerCase()} added yet</p>
            {editing && (
              <button
                onClick={onAdd}
                className="mt-2 text-blue-600 font-black text-xs hover:underline"
              >
                + Add manually
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Tag({ text }) {
  if (!text) return null
  return (
    <span className="inline-block px-4 py-1.5 bg-blue-50/50 border border-blue-100/50 text-blue-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm transition hover:bg-blue-100 hover:border-blue-200 cursor-default">
      {text}
    </span>
  )
}

function ExperienceItem({ item, editing, onEdit }) {
  return (
    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all hover:bg-white hover:shadow-lg hover:shadow-blue-500/5">
      {editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company</label>
            <input
              value={item.company || ''}
              onChange={(e) => onEdit('company', e.target.value)}
              placeholder="e.g. Google"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role / Position</label>
            <input
              value={item.role || ''}
              onChange={(e) => onEdit('role', e.target.value)}
              placeholder="e.g. Senior Developer"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
            <input
              value={item.duration || ''}
              onChange={(e) => onEdit('duration', e.target.value)}
              placeholder="e.g. Jan 2022 - Present"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description & Achievements</label>
            <textarea
              value={item.description || ''}
              onChange={(e) => onEdit('description', e.target.value)}
              placeholder="Describe your key responsibilities and impact..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              rows="4"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h5 className="text-lg font-black text-slate-900 leading-tight">{item.company || 'Unknown Company'}</h5>
              <p className="text-blue-600 font-bold text-sm tracking-tight">{item.role || 'Role Not Specified'}</p>
            </div>
            {item.duration && (
              <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm self-start sm:self-center">
                {item.duration}
              </span>
            )}
          </div>
          {item.description && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line">{item.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EducationItem({ item, editing, onEdit }) {
  return (
    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 h-full hover:bg-white hover:border-blue-200 transition-all hover:shadow-lg hover:shadow-blue-500/5">
      {editing ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institution</label>
            <input
              value={item.institution || ''}
              onChange={(e) => onEdit('institution', e.target.value)}
              placeholder="e.g. Stanford University"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Degree</label>
            <input
              value={item.degree || ''}
              onChange={(e) => onEdit('degree', e.target.value)}
              placeholder="e.g. Bachelor of Science"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Field</label>
              <input
                value={item.field || ''}
                onChange={(e) => onEdit('field', e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
              <input
                type="number"
                value={item.year || ''}
                onChange={(e) => onEdit('year', e.target.value)}
                placeholder="e.g. 2023"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <h5 className="font-black text-slate-900 text-lg leading-tight">{item.institution || 'Unknown Institution'}</h5>
          <p className="text-blue-600 font-bold text-sm">{item.degree || 'Degree Not Specified'}</p>
          {item.field && <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{item.field}</p>}
          {item.year && (
            <div className="pt-2">
              <span className="px-2 py-1 bg-white border border-slate-100 rounded-md text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                Class of {item.year}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProjectItem({ item, editing, onEdit }) {
  return (
    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:border-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-500/5">
      {editing ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Title</label>
            <input
              value={item.title || ''}
              onChange={(e) => onEdit('title', e.target.value)}
              placeholder="e.g. AI Content Generator"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea
              value={item.description || ''}
              onChange={(e) => onEdit('description', e.target.value)}
              placeholder="Describe the technical challenges and solutions..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              rows="3"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1">
            <h5 className="text-xl font-black text-slate-900 leading-tight">{item.title || 'Untitled Project'}</h5>
            <div className="h-0.5 w-12 bg-indigo-500/20 rounded-full"></div>
          </div>
          {item.description && (
            <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
          )}
          {item.techStack && item.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {item.techStack.map((tech, i) => (
                <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-tight">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CertificationItem({ item, editing, onEdit }) {
  return (
    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 h-full hover:bg-white hover:border-green-200 transition-all hover:shadow-lg hover:shadow-green-500/5">
      {editing ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Certification Name</label>
            <input
              value={item.name || ''}
              onChange={(e) => onEdit('name', e.target.value)}
              placeholder="e.g. AWS Certified Solutions Architect"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issuer</label>
              <input
                value={item.issuer || ''}
                onChange={(e) => onEdit('issuer', e.target.value)}
                placeholder="e.g. Amazon Web Services"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
              <input
                value={item.date || ''}
                onChange={(e) => onEdit('date', e.target.value)}
                placeholder="e.g. Oct 2023"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <h5 className="font-black text-slate-900 text-lg leading-tight">{item.name || 'Certification Name'}</h5>
          <p className="text-green-600 font-bold text-sm mb-2">{item.issuer || 'Issuer Not Specified'}</p>
          {item.date && (
            <div className="pt-2">
              <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full tracking-widest">
                {item.date}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

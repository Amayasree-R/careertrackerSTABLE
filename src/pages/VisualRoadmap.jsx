import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircle2, 
  ChevronRight, 
  X, 
  RefreshCw, 
  ExternalLink,
  Youtube,
  GraduationCap,
  Globe,
  BookOpen,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const VisualRoadmap = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRoadmap = async (refresh = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      
      const response = await axios.get(`${API_BASE_URL}/visual-roadmap${refresh ? '?refresh=true' : ''}`, {
        headers: getAuthHeaders()
      });
      
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
      setError('Failed to load your roadmap. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const progress = useMemo(() => {
    if (!data) return 0;
    let total = 0;
    let mastered = 0;
    data.tiers.forEach(tier => {
      tier.skills.forEach(skill => {
        total++;
        if (skill.status === 'Mastered') mastered++;
      });
    });
    return total > 0 ? Math.round((mastered / total) * 100) : 0;
  }, [data]);

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] p-8 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-8 animate-pulse mt-12">
          {/* Header Skeleton */}
          <div className="bg-[#13131a] rounded-2xl p-8 border border-[#1e1e2e] shadow-sm space-y-4">
            <div className="h-4 bg-[#2a2a3d] rounded w-24"></div>
            <div className="h-8 bg-[#2a2a3d] rounded w-64"></div>
            <div className="h-8 bg-[#2a2a3d] rounded w-full mt-4"></div>
          </div>
          {/* Timeline Skeleton */}
          <div className="relative mt-20">
            <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-gray-200"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center py-8 w-full">
                <div className="w-[45%] h-24 bg-[#1e1e2e] rounded-xl"></div>
                <div className="w-4 h-4 rounded-full bg-[#2a2a3d] z-10"></div>
                <div className="w-[45%] h-24 bg-[#1e1e2e] rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
        <div className="bg-[#13131a] p-12 rounded-[2.5rem] shadow-xl border border-[#1e1e2e] max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <Info size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">{error}</h2>
          <button 
            onClick={() => fetchRoadmap()}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 pb-32">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto pt-8 px-6">
        <div className="bg-[#13131a] rounded-[2rem] p-8 border border-[#1e1e2e] shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-400 mb-1 block">
                Learning Roadmap
              </span>
              <h1 className="text-3xl font-black text-slate-100 tracking-tight">
                {data?.targetJob || 'Software Engineer'}
              </h1>
            </div>
            <button 
              onClick={() => fetchRoadmap(true)}
              disabled={refreshing}
              className={`flex items-center gap-2 px-6 py-3 bg-[#1e1e2e] border border-violet-500/30 text-violet-400 rounded-xl font-bold hover:bg-[#2a2a3d] transition shadow-sm ${refreshing ? 'opacity-50' : ''}`}
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Regenerate Path'}
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-slate-400">Overall Mastery Progress</span>
              <span className="text-lg font-black text-violet-400">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#1e1e2e] rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="max-w-[800px] mx-auto mt-20 relative px-6">
        {/* Center Vertical Line */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[3px] opacity-40 z-0"
          style={{ background: 'linear-gradient(to bottom, #6366f1, #8b5cf6, #6366f1)' }}
        ></div>

        <div className="space-y-16 relative">
          {data?.tiers.map((tier, tierIdx) => (
            <div key={tierIdx} className="space-y-12">
              {/* Tier Separator */}
              <div className="flex items-center gap-4 py-4 relative z-10">
                <div className="flex-1 h-px bg-[#1e1e2e]"></div>
                <div className={`px-5 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm
                  ${tierIdx === 0 ? 'bg-green-950 text-green-400 border-green-900' : 
                    tierIdx === 1 ? 'bg-violet-950 text-violet-400 border-violet-900' : 
                    tierIdx === 2 ? 'bg-purple-950 text-purple-400 border-purple-900' : 
                    'bg-orange-950 text-orange-400 border-orange-900'}`}
                >
                  {tier.label}
                </div>
                <div className="flex-1 h-px bg-[#1e1e2e]"></div>
              </div>

              {/* Skills Nodes */}
              <div className="space-y-16">
                {tier.skills.map((skill, skillIdx) => {
                  const isEven = skillIdx % 2 === 0;
                  return (
                    <div key={skillIdx} className="relative flex items-center w-full">
                      {/* Center Dot */}
                      <div className={`absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 bg-[#13131a] z-10
                        ${skill.status === 'Mastered' ? 'bg-green-500 border-green-200 ring-4 ring-green-900/40' : 
                          skill.priority === 'High' ? 'bg-violet-500 border-violet-800 ring-4 ring-violet-900/40' :
                          skill.priority === 'Medium' ? 'border-purple-400' :
                          'border-[#2a2a3d]'}`}
                      ></div>

                      {/* Content Card Container */}
                      <div className={`flex w-full ${isEven ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          onClick={() => setSelectedSkill(skill)}
                          className={`group w-[85%] md:w-[48%] min-w-[280px] min-h-[100px] bg-[#13131a] p-5 rounded-2xl border border-[#1e1e2e] hover:shadow-md hover:border-violet-500/30 transition-all cursor-pointer relative
                            ${isEven ? 'ml-auto border-l-4' : 'mr-auto border-l-4'}
                            ${skill.status === 'Mastered' ? 'border-l-green-500' : 
                              skill.priority === 'High' ? 'border-l-violet-500' :
                              skill.priority === 'Medium' ? 'border-l-purple-400' :
                              'border-l-[#2a2a3d]'}`}
                        >
                          {/* Small Connector Line - Fixed Height and Opacity */}
                          <div className={`absolute top-1/2 -translate-y-1/2 w-8 h-[2px] bg-indigo-300 opacity-60 hidden md:block
                            ${isEven ? '-left-8' : '-right-8'}`}
                          ></div>

                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="font-bold text-slate-100 text-base leading-tight group-hover:text-violet-400 transition-colors">
                                {skill.skill}
                              </h3>
                              <div className="flex items-center gap-1">
                                {skill.status === 'Mastered' && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-950 text-violet-400 border border-violet-900 rounded-full text-[9px] font-black uppercase">
                                    <CheckCircle2 size={10} /> Mastered
                                  </span>
                                )}
                                {skill.priority === 'High' && skill.status !== 'Mastered' && (
                                  <span className="px-2 py-0.5 bg-violet-950 text-violet-400 border border-violet-900 rounded-full text-[9px] font-black uppercase">
                                    High Priority
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-1">
                              <span className="px-3 py-1 bg-[#1e1e2e] text-slate-400 text-xs font-bold rounded-md border border-[#2a2a3d]">
                                {skill.category}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                <Clock size={12} /> {skill.estimatedTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-2xl mx-auto mt-20 px-6">
        <div className="bg-[#13131a] p-6 rounded-2xl border border-[#1e1e2e] shadow-sm flex flex-wrap justify-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500 ring-4 ring-green-50"></div> Mastered
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-violet-500 ring-4 ring-violet-900/40"></div> High Priority
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-purple-400 bg-[#13131a] shadow-sm"></div> Medium
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-[#2a2a3d] bg-[#13131a] shadow-sm"></div> Low Priority
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm sm:w-[420px] bg-[#13131a] border-l border-[#1e1e2e] shadow-2xl transform transition-transform duration-500 ease-in-out z-50 overflow-y-auto
          ${selectedSkill ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedSkill && (
          <div className="p-8 pb-32">
            <button
              onClick={() => setSelectedSkill(null)}
              className="absolute top-6 right-6 p-2.5 bg-[#1e1e2e] hover:bg-[#2a2a3d] rounded-xl transition text-slate-400"
            >
              <X size={20} />
            </button>

            <div className="mb-8 mt-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-2 block">Skill Details</span>
              <h2 className="text-4xl font-black text-slate-100 mb-4 tracking-tight leading-none">{selectedSkill.skill}</h2>

              <div className="flex flex-wrap gap-2 items-center mb-6">
                <span className="px-3 py-1 bg-[#1e1e2e] text-slate-300 text-[10px] font-black uppercase rounded-lg border border-[#2a2a3d]">
                  {selectedSkill.category}
                </span>
                {selectedSkill.status !== 'Mastered' && (
                  <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${
                    selectedSkill.priority === 'High' ? 'bg-violet-950 text-violet-400 border-violet-900' :
                    selectedSkill.priority === 'Medium' ? 'bg-purple-950 text-purple-400 border-purple-900' :
                    'bg-[#1e1e2e] text-slate-400 border-[#2a2a3d]'
                  }`}>
                    {selectedSkill.priority} Priority
                  </span>
                )}
              </div>

              <div className="bg-[#1e1e2e] rounded-3xl p-6 mb-8 border border-[#2a2a3d]">
                <div className="flex items-center gap-4 text-sm font-bold text-gray-700">
                  <div className="w-10 h-10 rounded-2xl bg-[#13131a] shadow-sm flex items-center justify-center text-violet-400 border border-[#1e1e2e]">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 tracking-wider">Estimated Time</p>
                    <p className="text-slate-200">{selectedSkill.estimatedTime}</p>
                  </div>
                </div>

                {selectedSkill.dependencies && selectedSkill.dependencies.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[#1e1e2e]/50">
                    <p className="text-[10px] uppercase font-black text-gray-400 mb-3 tracking-widest">Prerequisites</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkill.dependencies.map((dep, d) => (
                        <span key={d} className="px-2.5 py-1 bg-[#13131a] text-slate-300 text-[11px] font-bold rounded-lg border border-[#1e1e2e]">
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-100 flex items-center gap-2">
                  <BookOpen size={24} className="text-violet-600" />
                  Learning Resources
                </h3>
              </div>

              {selectedSkill.status === 'Mastered' ? (
                <div className="bg-green-950 border border-green-900 rounded-3xl p-8 text-center ring-4 ring-green-900/40">
                  <div className="w-16 h-16 bg-[#13131a] rounded-2xl shadow-sm border border-green-900 mx-auto flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h4 className="text-xl font-black text-green-400 mb-2 leading-tight">Achievement Unlocked!</h4>
                  <p className="text-sm text-green-500 font-medium">Excellent work! You've successfully mastered this skill. Keep growing.</p>
                </div>
              ) : selectedSkill.resources && selectedSkill.resources.length > 0 ? (
                <div className="space-y-4">
                  {selectedSkill.resources.map((res, r) => (
                    <div key={r} className="bg-[#13131a] border border-[#1e1e2e] rounded-3xl p-5 hover:border-violet-500/30 hover:shadow-lg transition-all group shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-[#1e1e2e] rounded-2xl group-hover:bg-violet-950 transition-colors">
                          {(() => { const p = (res.platform || res.type || res.source || '').toLowerCase(); return p === 'youtube' ? <Youtube size={22} className="text-red-500" /> : p === 'udemy' ? <ChevronRight size={22} className="text-purple-500" /> : p === 'coursera' ? <GraduationCap size={22} className="text-blue-500" /> : <Globe size={22} className="text-gray-400" />; })()}
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider border ${(res.free || res.isFree || res.is_free) ? 'bg-green-950 text-green-400 border-green-900' : 'bg-orange-950 text-orange-400 border-orange-900'}`}>
                          {(res.free || res.isFree || res.is_free) ? 'FREE' : 'PAID'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 mb-5 line-clamp-2 leading-relaxed h-10">{res.name || res.title || 'View Course'}</h4>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-[13px] font-black transition shadow-lg shadow-violet-900/40"
                      >
                        Launch Course <ArrowRight size={16} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-6 bg-[#1e1e2e] rounded-3xl border border-dashed border-[#2a2a3d]">
                  <BookOpen size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400 font-medium text-sm italic">No specific resources indexed for this skill yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      {selectedSkill && (
        <div 
          onClick={() => setSelectedSkill(null)}
          className="fixed inset-0 bg-[#0a0a0f]/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}
    </div>
  );
};

export default VisualRoadmap;

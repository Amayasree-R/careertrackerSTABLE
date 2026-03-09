import React from 'react'
import { Palette } from 'lucide-react'

const ACCENT_COLORS = [
  // Original Colors
  { name: 'Slate', value: '#1e293b' },
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Purple', value: '#9333EA' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Green', value: '#16A34A' },
  { name: 'Red', value: '#DC2626' },
  { name: 'Amber', value: '#D97706' },
  { name: 'Teal', value: '#0D9488' },
  // Lighter Shades
  { name: 'Slate Light', value: '#64748b' },
  { name: 'Indigo Light', value: '#818CF8' },
  { name: 'Purple Light', value: '#C084FC' },
  { name: 'Blue Light', value: '#60A5FA' },
  { name: 'Green Light', value: '#4ADE80' },
  { name: 'Red Light', value: '#F87171' },
  { name: 'Amber Light', value: '#FBBF24' },
  { name: 'Teal Light', value: '#2DD4BF' }
]

export default function ThemeColorPicker({ selectedColor = '#1e293b', onColorChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <Palette size={20} />
          Accent Color
        </h3>
        <p className="text-sm text-white/80 mt-1">Choose a color for headings and highlights</p>
      </div>

      <div className="p-4 grid grid-cols-4 gap-3">
        {ACCENT_COLORS.map((color) => {
          const isSelected = selectedColor === color.value

          return (
            <button
              key={color.value}
              onClick={() => onColorChange(color.value)}
              title={color.name}
              className={`p-3 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                isSelected
                  ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-300'
                  : 'border-slate-200 bg-white hover:border-slate-400'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg shadow-sm border border-slate-200"
                style={{ backgroundColor: color.value }}
              />
              <p className={`text-xs font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                {color.name}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

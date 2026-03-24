import React from 'react'
import { Palette } from 'lucide-react'

const ACCENT_COLORS = [
  { name: 'Orange', value: '#ff5500' },
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

export default function ThemeColorPicker({ selectedColor = '#ff5500', onColorChange }) {
  return (
    <div className="bg-[#111111] rounded-2xl border border-[#242424] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#242424]">
        <h3 className="font-bold text-lg text-[#ffffff] flex items-center gap-2 uppercase tracking-wide">
          <Palette size={20} className="text-[#ff5500]" />
          Accent Color
        </h3>
        <p className="text-xs text-[#a0a0a0] mt-1">Choose a color for headings and highlights</p>
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
                  ? 'border-[#ff5500] bg-[#2a1500] ring-2 ring-[#ff5500]/20'
                  : 'border-[#242424] bg-[#1a1a1a] hover:border-[#ff5500]/40'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg shadow-sm border border-[#242424]"
                style={{ backgroundColor: color.value }}
              />
              <p className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-[#ff5500]' : 'text-[#606060]'}`}>
                {color.name}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

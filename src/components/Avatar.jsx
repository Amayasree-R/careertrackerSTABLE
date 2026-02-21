import React from 'react';

const Avatar = ({ name, size = 'md', className = '' }) => {
    // Extract initials (up to 2 characters)
    const initials = name
        ? name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?';

    // Size mapping for flexible usage
    const sizeClasses = {
        xs: 'w-8 h-8 text-xs border-2',
        sm: 'w-10 h-10 text-sm border-2',
        md: 'w-16 h-16 text-xl border-[3px]',
        lg: 'w-24 h-24 text-3xl border-4',
        xl: 'w-32 h-32 text-4xl border-[5px]',
        '2xl': 'w-40 h-40 text-5xl border-[6px]',
    };

    return (
        <div
            className={`
        relative flex items-center justify-center rounded-full 
        bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 
        text-white font-black shadow-xl border-white
        transition-all duration-500 hover:scale-105 
        hover:shadow-blue-200/50 hover:shadow-2xl hover:rotate-3
        cursor-default select-none
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>

            {/* Subtle Glow Ring on Hover */}
            <div className="absolute inset-[-4px] rounded-full bg-blue-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            {/* Initials with Inner Shadow */}
            <span className="relative z-10 drop-shadow-lg tracking-tight">
                {initials}
            </span>

            {/* Modern Soft Border / Ring */}
            <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none"></div>
        </div>
    );
};

export default Avatar;

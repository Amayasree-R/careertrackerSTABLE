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
        bg-[#2a1500] 
        text-[#ff5500] font-black border-[#242424]
        transition-all duration-300 hover:scale-105 
        cursor-default select-none
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
        >
            {/* Initials */}
            <span className="relative z-10 tracking-tight">
                {initials}
            </span>

            {/* Subtle Border */}
            <div className="absolute inset-0 rounded-full border border-[#242424] pointer-events-none"></div>
        </div>
    );
};

export default Avatar;

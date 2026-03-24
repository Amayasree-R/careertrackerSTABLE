export function Skeleton({ className = "" }) {
    return (
        <div className={`animate-pulse bg-[#1a1a1a] rounded-xl ${className}`}></div>
    )
}

export function SkillCardSkeleton() {
    return (
        <div className="p-6 rounded-[2rem] border-2 border-[#242424] bg-[#111111] animate-pulse">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a]"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-[#1a1a1a] rounded"></div>
                        <div className="h-3 w-16 bg-[#242424] rounded"></div>
                    </div>
                </div>
                <div className="w-6 h-6 bg-[#1a1a1a] rounded-full"></div>
            </div>
            <div className="space-y-2">
                <div className="h-3 w-full bg-[#242424] rounded"></div>
                <div className="h-3 w-5/6 bg-[#242424] rounded"></div>
            </div>
        </div>
    )
}

export function StatsCardSkeleton() {
    return (
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#242424] shadow-sm animate-pulse">
            <div className="h-3 w-16 bg-[#1a1a1a] rounded mb-2"></div>
            <div className="h-8 w-24 bg-[#242424] rounded"></div>
        </div>
    )
}

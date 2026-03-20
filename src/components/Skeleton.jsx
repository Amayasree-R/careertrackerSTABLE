export function Skeleton({ className = "" }) {
    return (
        <div className={`animate-pulse bg-[#1e1e2e] rounded-xl ${className}`}></div>
    )
}

export function SkillCardSkeleton() {
    return (
        <div className="p-6 rounded-[2rem] border-2 border-[#1e1e2e] bg-[#13131a] animate-pulse">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#1e1e2e]"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-[#1e1e2e] rounded"></div>
                        <div className="h-3 w-16 bg-[#2a2a3d] rounded"></div>
                    </div>
                </div>
                <div className="w-6 h-6 bg-[#1e1e2e] rounded-full"></div>
            </div>
            <div className="space-y-2">
                <div className="h-3 w-full bg-[#2a2a3d] rounded"></div>
                <div className="h-3 w-5/6 bg-[#2a2a3d] rounded"></div>
            </div>
        </div>
    )
}

export function StatsCardSkeleton() {
    return (
        <div className="bg-[#13131a] p-6 rounded-2xl border border-[#1e1e2e] shadow-sm animate-pulse">
            <div className="h-3 w-16 bg-[#1e1e2e] rounded mb-2"></div>
            <div className="h-8 w-24 bg-[#2a2a3d] rounded"></div>
        </div>
    )
}

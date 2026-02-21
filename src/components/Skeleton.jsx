export function Skeleton({ className = "" }) {
    return (
        <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`}></div>
    )
}

export function SkillCardSkeleton() {
    return (
        <div className="p-6 rounded-[2rem] border-2 border-slate-100 bg-white animate-pulse">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-200"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                        <div className="h-3 w-16 bg-slate-100 rounded"></div>
                    </div>
                </div>
                <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
            </div>
            <div className="space-y-2">
                <div className="h-3 w-full bg-slate-50 rounded"></div>
                <div className="h-3 w-5/6 bg-slate-50 rounded"></div>
            </div>
        </div>
    )
}

export function StatsCardSkeleton() {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
            <div className="h-3 w-16 bg-slate-200 rounded mb-2"></div>
            <div className="h-8 w-24 bg-slate-300 rounded"></div>
        </div>
    )
}

import type React from "react"
interface StatCardProps {
  title: string
  value: string
  subtitle?: string | React.ReactNode
  className?: string
}

export function StatCard({ title, value, subtitle, className = "" }: StatCardProps) {
  return (
    <div
      className={`bg-card/80 backdrop-blur-xl border border-border/20 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all ${className}`}
    >
      <p className="text-xs sm:text-sm text-muted-foreground mb-2">{title}</p>
      <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{value}</p>
      {subtitle && (
        <div className="text-xs sm:text-sm text-muted-foreground">
          {typeof subtitle === "string" ? subtitle : subtitle}
        </div>
      )}
    </div>
  )
}

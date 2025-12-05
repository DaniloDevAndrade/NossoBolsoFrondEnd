"use client"
import type React from "react"

export function ExpenseChart() {
  const categories = [
    { name: "Mercado", value: 35, color: "#00FF7F" },
    { name: "Contas", value: 25, color: "#00D96E" },
    { name: "Alimentação", value: 20, color: "#00B35C" },
    { name: "Transporte", value: 12, color: "#008D4A" },
    { name: "Outros", value: 8, color: "#006738" },
  ]

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-4 sm:p-6 shadow-lg">
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Gastos por categoria</h3>

      <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
        {/* Pie Chart Representation */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {categories.reduce((acc, cat, index) => {
              const previousTotal = categories.slice(0, index).reduce((sum, c) => sum + c.value, 0)
              const dashArray = `${cat.value} ${100 - cat.value}`
              const dashOffset = -previousTotal

              acc.push(
                <circle
                  key={cat.name}
                  cx="50"
                  cy="50"
                  r="15.915"
                  fill="none"
                  stroke={cat.color}
                  strokeWidth="31.83"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  className="transition-all"
                />,
              )
              return acc
            }, [] as React.JSX.Element[])}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-foreground">100%</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 sm:space-y-3 w-full">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm sm:text-base text-foreground font-medium">{cat.name}</span>
              </div>
              <span className="text-sm sm:text-base text-muted-foreground font-semibold">{cat.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

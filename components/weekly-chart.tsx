"use client"

export function WeeklyChart() {
  const weeks = [
    { week: "Sem 1", value: 450 },
    { week: "Sem 2", value: 620 },
    { week: "Sem 3", value: 580 },
    { week: "Sem 4", value: 800 },
  ]

  const maxValue = Math.max(...weeks.map((w) => w.value))

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-4 sm:p-6 shadow-lg">
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Gastos por semana</h3>

      <div className="space-y-4 sm:space-y-6">
        {weeks.map((week) => {
          const percentage = (week.value / maxValue) * 100

          return (
            <div key={week.week} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">{week.week}</span>
                <span className="text-foreground font-bold">R$ {week.value.toFixed(2)}</span>
              </div>
              <div className="h-2.5 sm:h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 shadow-lg shadow-primary/30"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Alert - Improved mobile padding */}
      <div className="mt-4 sm:mt-6 bg-primary/10 border border-primary/30 rounded-xl p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-primary font-medium">Vocês gastaram 12% a mais esta semana</p>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Activity, Flame, Target } from 'lucide-react'
import type { ToolMeta } from '@/data/tools'
import { ToolShell } from '@/components/layout/ToolShell'
import { Labeled, Notice, Panel, SegmentedControl, Select, Stat } from '@/components/ui/Primitives'
import { cn } from '@/lib/cn'

type Units = 'metric' | 'imperial'
type Sex = 'male' | 'female'
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryactive'

const ACTIVITY: Record<ActivityLevel, { label: string; factor: number }> = {
  sedentary: { label: 'Sedentary — little or no exercise', factor: 1.2 },
  light: { label: 'Light — exercise 1–3 days a week', factor: 1.375 },
  moderate: { label: 'Moderate — exercise 3–5 days a week', factor: 1.55 },
  active: { label: 'Active — exercise 6–7 days a week', factor: 1.725 },
  veryactive: { label: 'Very active — hard exercise daily', factor: 1.9 },
}

const BANDS = [
  { max: 18.5, label: 'Underweight', color: 'text-sky-600', bg: 'bg-sky-500' },
  { max: 25, label: 'Normal weight', color: 'text-emerald-600', bg: 'bg-emerald-500' },
  { max: 30, label: 'Overweight', color: 'text-amber-600', bg: 'bg-amber-500' },
  { max: 100, label: 'Obese', color: 'text-red-600', bg: 'bg-red-500' },
]

export default function BmiCalculator({ tool }: { tool: ToolMeta }) {
  const [units, setUnits] = useState<Units>('metric')
  const [sex, setSex] = useState<Sex>('male')
  const [age, setAge] = useState(30)
  const [heightCm, setHeightCm] = useState(175)
  const [weightKg, setWeightKg] = useState(72)
  const [heightFt, setHeightFt] = useState(5)
  const [heightIn, setHeightIn] = useState(9)
  const [weightLb, setWeightLb] = useState(160)
  const [activity, setActivity] = useState<ActivityLevel>('moderate')

  const heightM = units === 'metric' ? heightCm / 100 : (heightFt * 12 + heightIn) * 0.0254
  const weight = units === 'metric' ? weightKg : weightLb * 0.453592

  const bmi = heightM > 0 ? weight / (heightM * heightM) : 0
  const band = BANDS.find((b) => bmi < b.max) ?? BANDS[BANDS.length - 1]

  const idealMin = 18.5 * heightM * heightM
  const idealMax = 24.9 * heightM * heightM

  const bmr =
    sex === 'male'
      ? 10 * weight + 6.25 * (heightM * 100) - 5 * age + 5
      : 10 * weight + 6.25 * (heightM * 100) - 5 * age - 161
  const tdee = bmr * ACTIVITY[activity].factor

  const gaugePct = useMemo(() => Math.max(0, Math.min(100, ((bmi - 14) / (40 - 14)) * 100)), [bmi])

  const toDisplayWeight = (kg: number) =>
    units === 'metric' ? `${kg.toFixed(1)} kg` : `${(kg / 0.453592).toFixed(1)} lb`

  return (
    <ToolShell
      tool={tool}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Panel title="Your measurements">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <SegmentedControl
                value={units}
                onChange={(v) => setUnits(v)}
                options={[
                  { value: 'metric', label: 'Metric (kg/cm)' },
                  { value: 'imperial', label: 'Imperial (lb/ft)' },
                ]}
              />
              <SegmentedControl
                value={sex}
                onChange={(v) => setSex(v)}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {units === 'metric' ? (
                <>
                  <Labeled label="Height (cm)">
                    <input type="number" className="field" min={50} max={260} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} />
                  </Labeled>
                  <Labeled label="Weight (kg)">
                    <input type="number" className="field" min={10} max={400} value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
                  </Labeled>
                </>
              ) : (
                <>
                  <Labeled label="Height (feet)">
                    <input type="number" className="field" min={2} max={8} value={heightFt} onChange={(e) => setHeightFt(Number(e.target.value))} />
                  </Labeled>
                  <Labeled label="Height (inches)">
                    <input type="number" className="field" min={0} max={11} value={heightIn} onChange={(e) => setHeightIn(Number(e.target.value))} />
                  </Labeled>
                  <Labeled label="Weight (lb)">
                    <input type="number" className="field" min={20} max={900} value={weightLb} onChange={(e) => setWeightLb(Number(e.target.value))} />
                  </Labeled>
                </>
              )}
              <Labeled label="Age (years)">
                <input type="number" className="field" min={15} max={100} value={age} onChange={(e) => setAge(Number(e.target.value))} />
              </Labeled>
            </div>

            <Labeled label="Activity level">
              <Select value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
                {(Object.keys(ACTIVITY) as ActivityLevel[]).map((k) => (
                  <option key={k} value={k}>
                    {ACTIVITY[k].label}
                  </option>
                ))}
              </Select>
            </Labeled>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Your BMI">
            <div className="text-center">
              <div className={cn('font-display text-5xl font-extrabold', band.color)}>{bmi.toFixed(1)}</div>
              <div className={cn('mt-1 text-sm font-bold', band.color)}>{band.label}</div>
            </div>

            <div className="mt-5">
              <div className="relative h-3 overflow-hidden rounded-full">
                <div className="flex h-full">
                  <div className="w-[17%] bg-sky-400" />
                  <div className="w-[25%] bg-emerald-400" />
                  <div className="w-[19%] bg-amber-400" />
                  <div className="flex-1 bg-red-400" />
                </div>
              </div>
              <div className="relative mt-1 h-3">
                <div
                  className="absolute -top-2 h-5 w-1 -translate-x-1/2 rounded-full border-2 border-white bg-ink shadow-card"
                  style={{ left: `${gaugePct}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] font-semibold text-ink-mute">
                <span>14</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Stat label="Healthy weight" value={toDisplayWeight(idealMin)} sub="minimum" tone="good" />
              <Stat label="Healthy weight" value={toDisplayWeight(idealMax)} sub="maximum" tone="good" />
            </div>
            {bmi > 0 && (bmi < 18.5 || bmi >= 25) && (
              <Notice tone="warn" className="mt-3">
                Your BMI is outside the healthy range. To reach it you would need to{' '}
                {bmi < 18.5 ? 'gain' : 'lose'} about{' '}
                {toDisplayWeight(Math.abs(weight - (bmi < 18.5 ? idealMin : idealMax)))}.
              </Notice>
            )}
          </Panel>

          <Panel title="Daily energy">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="BMR" value={`${Math.round(bmr)}`} sub="kcal at rest" />
              <Stat label="TDEE" value={`${Math.round(tdee)}`} sub="kcal per day" tone="brand" />
            </div>
            <div className="mt-4 space-y-2 text-sm text-ink-mute">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                To lose weight: <strong className="text-ink">{Math.round(tdee - 500)} kcal</strong> per day
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                To maintain: <strong className="text-ink">{Math.round(tdee)} kcal</strong> per day
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-brand-600" />
                To gain weight: <strong className="text-ink">{Math.round(tdee + 400)} kcal</strong> per day
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </ToolShell>
  )
}

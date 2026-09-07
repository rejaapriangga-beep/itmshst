'use client'

import {
  ArrowDownRight,
  ArrowUpRight,
  Users,
  ShieldAlert,
  Star,
  Target,
  UserCheck,
  AlertTriangle,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type Trend = 'up' | 'down'

type StatCard = {
  label: string
  value: string
  sublabel: string
  trend: Trend
  trendValue: string
  accent: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const STAT_CARDS: StatCard[] = [
  {
    label: 'Total Workforce',
    value: '45.287',
    sublabel: 'Tersebar di 9 unit bisnis',
    trend: 'up',
    trendValue: '+2.4%',
    accent: '#2563eb',
    icon: Users,
  },
  {
    label: 'Critical Positions',
    value: '126',
    sublabel: '18 posisi belum ada suksesor',
    trend: 'down',
    trendValue: '-18 gaps',
    accent: '#d97706',
    icon: ShieldAlert,
  },
  {
    label: 'High Potential Talent',
    value: '1.248',
    sublabel: '67 siap dipromosikan',
    trend: 'up',
    trendValue: '+8.2%',
    accent: '#7c3aed',
    icon: Star,
  },
  {
    label: 'Succession Coverage',
    value: '82%',
    sublabel: 'dari posisi kritikal',
    trend: 'up',
    trendValue: '+5.4%',
    accent: '#059669',
    icon: Target,
  },
  {
    label: 'Ready-Now Successors',
    value: '64%',
    sublabel: 'dari total pipeline',
    trend: 'up',
    trendValue: '+3.1%',
    accent: '#0891b2',
    icon: UserCheck,
  },
  {
    label: 'Talent Risk',
    value: '7.8%',
    sublabel: 'indikasi flight risk',
    trend: 'down',
    trendValue: '-1.2%',
    accent: '#dc2626',
    icon: AlertTriangle,
  },
]

const RADAR_DATA = [
  { dimensi: 'Performance', skor: 88 },
  { dimensi: 'Potential', skor: 76 },
  { dimensi: 'Criticality', skor: 82 },
  { dimensi: 'Readiness', skor: 64 },
  { dimensi: 'Retention', skor: 71 },
  { dimensi: 'Capability', skor: 79 },
]

const SUCCESSION_TREND = [
  { quarter: 'Q1 25', coverage: 70, readyNow: 55 },
  { quarter: 'Q2 25', coverage: 74, readyNow: 57 },
  { quarter: 'Q3 25', coverage: 78, readyNow: 60 },
  { quarter: 'Q4 25', coverage: 80, readyNow: 62 },
  { quarter: 'Q1 26', coverage: 82, readyNow: 64 },
]

function StatCardView({ card }: { card: StatCard }) {
  const Icon = card.icon
  const TrendIcon = card.trend === 'up' ? ArrowUpRight : ArrowDownRight
  const trendColor = card.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: card.accent }} />
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{card.label}</span>
        <Icon size={16} className="text-slate-300" />
      </div>
      <div className="text-2xl font-bold text-slate-800">{card.value}</div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">{card.sublabel}</span>
        <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${trendColor}`}>
          <TrendIcon size={11} />
          {card.trendValue}
        </span>
      </div>
    </div>
  )
}

export default function TalentIntelligenceDashboard() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Ringkasan ekosistem talent KAI Group secara keseluruhan</p>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          Demo Data
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map((card) => (
          <StatCardView key={card.label} card={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-800">Talent Health</h3>
          <p className="mb-3 text-xs text-slate-400">Kekuatan saat ini vs. target di enam dimensi talent</p>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={RADAR_DATA} outerRadius="70%">
              <defs>
                <radialGradient id="talentHealthGradient" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.08} />
                </radialGradient>
              </defs>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="dimensi" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Radar
                name="Skor"
                dataKey="skor"
                stroke="#2563eb"
                fill="url(#talentHealthGradient)"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#2563eb', strokeWidth: 1.5, stroke: '#fff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-800">Succession Health</h3>
          <p className="mb-3 text-xs text-slate-400">Coverage dan kedalaman ready-now selama lima kuartal terakhir</p>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={SUCCESSION_TREND} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="coverageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="readyNowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[40, 90]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend
                verticalAlign="bottom"
                height={28}
                wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
                formatter={(v) => (v === 'coverage' ? 'Succession Coverage' : 'Ready-Now Successors')}
              />
              <Area type="monotone" dataKey="coverage" stroke="#6366f1" fill="url(#coverageGradient)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="readyNow" stroke="#059669" fill="url(#readyNowGradient)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { 
  BarChart3, 
  Users,
  Clock,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { ToastContainer } from '../../context/ToastContext'
import { 
  BarChart, 
  Bar, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'

interface ChartData {
  name: string
  visits: number
  newPatients: number
  returningPatients: number
}

const dailyData: ChartData[] = [
  { name: 'Mon', visits: 45, newPatients: 12, returningPatients: 33 },
  { name: 'Tue', visits: 52, newPatients: 15, returningPatients: 37 },
  { name: 'Wed', visits: 48, newPatients: 14, returningPatients: 34 },
  { name: 'Thu', visits: 61, newPatients: 18, returningPatients: 43 },
  { name: 'Fri', visits: 55, newPatients: 16, returningPatients: 39 },
  { name: 'Sat', visits: 38, newPatients: 8, returningPatients: 30 },
  { name: 'Sun', visits: 32, newPatients: 5, returningPatients: 27 },
]

const weeklyData = [
  { name: 'Week 1', visits: 210 },
  { name: 'Week 2', visits: 235 },
  { name: 'Week 3', visits: 252 },
  { name: 'Week 4', visits: 228 },
]

const monthlyData = [
  { name: 'Jan', visits: 680 },
  { name: 'Feb', visits: 720 },
  { name: 'Mar', visits: 695 },
  { name: 'Apr', visits: 745 },
  { name: 'May', visits: 780 },
  { name: 'Jun', visits: 810 },
]

export default function Analytics() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const data = period === 'daily' ? dailyData : period === 'weekly' ? weeklyData : monthlyData

  const pieData = [
    { name: 'Scheduled', value: 65, color: '#15803D' },
    { name: 'Walk-in', value: 35, color: '#0F766E' },
  ]

  const waitingTimeData = [
    { name: 'Mon', avgWait: 12 },
    { name: 'Tue', avgWait: 15 },
    { name: 'Wed', avgWait: 14 },
    { name: 'Thu', avgWait: 18 },
    { name: 'Fri', avgWait: 16 },
    { name: 'Sat', avgWait: 11 },
    { name: 'Sun', avgWait: 9 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-secondary">Track clinic performance and patient trends</p>
        </div>
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p as 'daily' | 'weekly' | 'monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-background-card text-text-secondary hover:bg-background-border'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Visits</p>
                <p className="text-3xl font-bold text-text-primary mt-1">
                  {period === 'daily' ? dailyData.reduce((a, b) => a + b.visits, 0) : 
                   period === 'weekly' ? weeklyData.reduce((a, b) => a + b.visits, 0) : 
                   monthlyData.reduce((a, b) => a + b.visits, 0)}
                </p>
                <p className="text-xs text-success mt-1 flex items-center gap-1">
                  <TrendingUp size={12} />
                  ↑ 12% from last period
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">New Patients</p>
                <p className="text-3xl font-bold text-success mt-1">
                  {period === 'daily' ? dailyData.reduce((a, b) => a + b.newPatients, 0) : 
                   period === 'weekly' ? weeklyData.reduce((a, b) => a + b.visits * 0.07, 0) : 
                   monthlyData.reduce((a, b) => a + b.visits * 0.08, 0)}
                </p>
                <p className="text-xs text-success mt-1 flex items-center gap-1">
                  <TrendingUp size={12} />
                  ↑ 8% from last period
                </p>
              </div>
              <div className="w-12 h-12 bg-success/50 rounded-lg flex items-center justify-center text-success">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Avg. Wait Time</p>
                <p className="text-3xl font-bold text-text-primary mt-1">
                  {period === 'daily' ? '14 min' : '16 min'} 
                </p>
                <p className="text-xs text-warning mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  {'< 20 min target'}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/50 rounded-lg flex items-center justify-center text-warning">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Follow-ups</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  {period === 'daily' ? '18' : '92'} 
                </p>
                <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                  <Calendar size={12} />
                  Completed this period
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                <Calendar size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} className="text-text-primary" />
              Patient Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey={period === 'daily' ? 'name' : period === 'weekly' ? 'name' : 'name'}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    cursor={{ fill: '#F1F5F9' }}
                  />
                  <Legend wrapperStyle={{ marginTop: 20 }} />
                  <Bar 
                    dataKey="visits" 
                    name="Total Visits" 
                    fill="#2563EB" 
                    radius={[4, 4, 0, 0]}
                    barSize={period === 'daily' ? 40 : 60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-primary">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
              Appointment Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend wrapperStyle={{ marginTop: 20 }} />
                </Pie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waiting Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} className="text-text-primary" />
            Average Waiting Time Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waitingTimeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgWait" 
                  name="Avg Wait Time (min)" 
                  stroke="#0F766E" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#0F766E', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <ToastContainer />
    </div>
  )
}

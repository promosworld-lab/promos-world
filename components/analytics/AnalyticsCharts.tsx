'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

interface AnalyticsChartsProps {
  chartData: any[];
}

export default function AnalyticsCharts({ chartData }: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <h2 className="font-black text-xl mb-6">Évolution des Vues</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46' }} />
              <Line type="monotone" dataKey="vues" stroke="#f97316" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <h2 className="font-black text-xl mb-6">Conversions (Ventes)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46' }} />
              <Bar dataKey="ventes" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

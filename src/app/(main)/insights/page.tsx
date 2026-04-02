'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PeriodSelector } from '@/components/insights/period-selector';
import { InsightsSummary } from '@/components/insights/insights-summary';
import { MoodCalendar } from '@/components/insights/mood-calendar';
import { Skeleton } from '@/components/ui/skeleton';
import type { InsightsData, InsightPeriod } from '@/types/insights';

const MoodDistributionChart = dynamic(
  () => import('@/components/insights/mood-distribution-chart'),
  { ssr: false, loading: () => <Skeleton className="h-48 rounded-lg" /> }
);

const MoodTrendChart = dynamic(
  () => import('@/components/insights/mood-trend-chart'),
  { ssr: false, loading: () => <Skeleton className="h-64 rounded-lg" /> }
);

export default function InsightsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<InsightPeriod>('month');
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const dateStr = date.toISOString().split('T')[0];
    fetch(`/api/insights?period=${period}&date=${dateStr}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period, date]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回</span>
        </button>

        <h1 className="text-2xl font-light tracking-wide mb-6">情绪洞察</h1>

        <PeriodSelector
          period={period}
          date={date}
          onPeriodChange={setPeriod}
          onDateChange={setDate}
        />

        {loading ? (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        ) : !data ? (
          <div className="text-center py-20">
            <p className="text-text-secondary">加载失败</p>
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {/* Summary */}
            <InsightsSummary summary={data.summary} />

            {/* Distribution */}
            <section>
              <h2 className="text-sm text-text-secondary mb-4">情绪分布</h2>
              <div className="bg-background-raised border border-border rounded-lg p-4">
                <MoodDistributionChart data={data.distribution} />
              </div>
            </section>

            {/* Calendar (only for month period) */}
            {period === 'month' && (
              <section>
                <h2 className="text-sm text-text-secondary mb-4">情绪日历</h2>
                <div className="bg-background-raised border border-border rounded-lg p-4">
                  <MoodCalendar data={data.calendar} date={date} />
                </div>
              </section>
            )}

            {/* Trend */}
            <section>
              <h2 className="text-sm text-text-secondary mb-4">情绪趋势</h2>
              <div className="bg-background-raised border border-border rounded-lg p-4">
                <MoodTrendChart data={data.trend} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

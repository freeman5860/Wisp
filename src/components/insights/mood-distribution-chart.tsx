'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getMoodConfig, MOODS } from '@/lib/constants';
import { CHART_THEME } from '@/lib/chart-theme';
import type { MoodDistribution } from '@/types/insights';

interface MoodDistributionChartProps {
  data: MoodDistribution[];
}

export default function MoodDistributionChart({ data }: MoodDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-tertiary text-sm">
        暂无数据
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="mood"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => {
                const config = getMoodConfig(entry.mood);
                return <Cell key={entry.mood} fill={config.color} />;
              })}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const item = payload[0].payload as MoodDistribution;
                const config = getMoodConfig(item.mood);
                const pct = ((item.count / total) * 100).toFixed(0);
                return (
                  <div
                    className="px-3 py-2 rounded-md text-xs"
                    style={{
                      backgroundColor: CHART_THEME.tooltipBg,
                      border: `1px solid ${CHART_THEME.tooltipBorder}`,
                      color: CHART_THEME.tooltipText,
                    }}
                  >
                    {config.emoji} {config.label}: {item.count} ({pct}%)
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {data.map((entry) => {
          const config = getMoodConfig(entry.mood);
          const pct = ((entry.count / total) * 100).toFixed(0);
          return (
            <div key={entry.mood} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-text-secondary">
                {config.emoji} {config.label}
              </span>
              <span className="text-text-tertiary">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { getMoodConfig, MOODS } from '@/lib/constants';
import { CHART_THEME } from '@/lib/chart-theme';
import type { TrendPoint } from '@/types/insights';

interface MoodTrendChartProps {
  data: TrendPoint[];
}

export default function MoodTrendChart({ data }: MoodTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-tertiary text-sm">
        暂无数据
      </div>
    );
  }

  // Find which moods appear in data
  const activeMoods = new Set<string>();
  for (const point of data) {
    for (const key of Object.keys(point)) {
      if (key !== 'date') activeMoods.add(key);
    }
  }

  const moodsToShow = MOODS.filter((m) => activeMoods.has(m.type));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_THEME.gridColor}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: CHART_THEME.textColor }}
            tickLine={false}
            axisLine={{ stroke: CHART_THEME.gridColor }}
            tickFormatter={(v: string) => {
              const parts = v.split('-');
              return parts.length === 3 ? `${parts[1]}/${parts[2]}` : v;
            }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: CHART_THEME.textColor }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div
                  className="px-3 py-2 rounded-md text-xs space-y-1"
                  style={{
                    backgroundColor: CHART_THEME.tooltipBg,
                    border: `1px solid ${CHART_THEME.tooltipBorder}`,
                    color: CHART_THEME.tooltipText,
                  }}
                >
                  <p className="text-text-tertiary mb-1">{label}</p>
                  {payload
                    .filter((p) => (p.value as number) > 0)
                    .map((p) => {
                      const config = getMoodConfig(p.dataKey as any);
                      return (
                        <p key={String(p.dataKey)} style={{ color: config.color }}>
                          {config.emoji} {config.label}: {p.value}
                        </p>
                      );
                    })}
                </div>
              );
            }}
          />
          {moodsToShow.map((mood) => (
            <Area
              key={mood.type}
              type="monotone"
              dataKey={mood.type}
              stackId="1"
              fill={`${mood.color}40`}
              stroke={mood.color}
              strokeWidth={1.5}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

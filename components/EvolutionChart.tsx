import React, { useEffect, useRef } from 'react';
import { JournalEntry, CustomMetric } from '../types';

declare global {
  interface Window {
    Chart: any;
  }
}

interface EvolutionChartProps {
  entries: JournalEntry[];
  metrics: string[]; // Array of metric IDs
  customMetrics: CustomMetric[];
  theme?: string;
}

const EvolutionChart: React.FC<EvolutionChartProps> = ({ entries, metrics, customMetrics, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any | null>(null);

  useEffect(() => {
    if (!canvasRef.current || metrics.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedEntries.length < 2) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = sortedEntries.map(entry => 
        new Date(entry.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    );
    
    const isDark = document.documentElement.classList.contains('dark') || theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const datasets = metrics.map(metricId => {
      const metricInfo = customMetrics.find(m => m.id === metricId);
      if (!metricInfo) return null;
      
      const data = sortedEntries.map(entry => entry.metrics[metricId] || null); // Use null for missing data
      const chartColor = metricInfo.color;

      return {
        label: metricInfo.label,
        data,
        fill: true,
        backgroundColor: chartColor + '33', // Add alpha for fill
        borderColor: chartColor,
        tension: 0.4,
        pointBackgroundColor: chartColor,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBorderColor: isDark ? '#18181B' : '#FFFFFF',
        pointBorderWidth: 2,
        spanGaps: true, // Connect lines over null data points
      };
    }).filter(Boolean);
    
    const textColor = isDark ? '#A0A0A5' : '#4B5563';
    const gridColor = isDark ? 'rgba(160, 160, 165, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const tooltipBg = isDark ? '#2A2A2F' : '#FFFFFF';
    const tooltipText = isDark ? '#F0F0F0' : '#111827';
    const tooltipMuted = isDark ? '#A0A0A5' : '#6B7280';
    const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    chartInstanceRef.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: { stepSize: 1, color: textColor },
            grid: { color: gridColor }
          },
          x: {
            ticks: { color: textColor },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { 
            display: true,
            position: 'bottom',
            labels: {
              color: textColor,
              boxWidth: 12,
              padding: 20,
            }
          },
          tooltip: {
            backgroundColor: tooltipBg,
            titleColor: tooltipText,
            bodyColor: tooltipMuted,
            boxPadding: 8,
            padding: 10,
            cornerRadius: 8,
            borderColor: tooltipBorder,
            borderWidth: 1,
            intersect: false,
            mode: 'index',
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };

  }, [entries, metrics, customMetrics, theme]);
  
  if (entries.length < 2) {
      return (
          <div className="text-center py-10 text-theme-muted h-[200px] sm:h-[300px] flex items-center justify-center bg-theme-bubble border border-theme rounded-lg">
              <p className="text-sm">Registra al menos dos entradas en tu diario para ver tu evolución.</p>
          </div>
      )
  }

  return (
    <div className="h-[200px] sm:h-[300px]">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default EvolutionChart;
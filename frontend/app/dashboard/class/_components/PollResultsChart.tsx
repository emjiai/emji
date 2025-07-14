'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card, CardContent } from '@/components/ui/card'; // Use existing UI components

interface ResultData {
  name: string; // Option text
  votes: number;
}

interface PollResultsChartProps {
  results: ResultData[]; // Example: [{ name: 'Option A', votes: 10 }, { name: 'Option B', votes: 5 }]
}

const COLORS = ['#0ea5e9', '#ec4899', '#f97316', '#10b981', '#8b5cf6', '#eab308']; // Tailwind sky-500, pink-500, orange-500, emerald-500, violet-500, amber-500

const PollResultsChart: React.FC<PollResultsChartProps> = ({ results = [] }) => {
  if (!results || results.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        Waiting for responses...
      </div>
    );
  }

  // Calculate total votes for percentage label
  const totalVotes = results.reduce((sum, item) => sum + item.votes, 0);

  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const percentage = totalVotes > 0 ? ((value / totalVotes) * 100).toFixed(0) : 0;
    if (width < 30) return null; // Don't render label if bar is too small

    return (
      <text x={x + width / 2} y={y + height / 2} fill="#fff" textAnchor="middle" dy=".3em" fontSize="12" fontWeight="bold">
        {`${value} (${percentage}%)`}
      </text>
    );
  };


  return (
    <div className="w-full h-64 md:h-80"> {/* Responsive height */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={results} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis
             type="category"
             dataKey="name"
             width={80} // Adjust width for labels if needed
             tick={{ fontSize: 12, fill: '#4b5563' }} // gray-600
             axisLine={false}
             tickLine={false}
           />
          <Tooltip
             cursor={{ fill: 'rgba(209, 213, 219, 0.3)' }} // gray-300 with opacity
             contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', border: '1px solid #e5e7eb', fontSize: '12px' }} // bg-white, rounded-md, border-gray-200
          />
          <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={40}>
            {results.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
             {/* Use LabelList for better control over label position and content */}
             <LabelList dataKey="votes" position="center" content={renderCustomizedLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PollResultsChart;
import React, { ReactNode } from 'react';
import clsx from 'clsx';

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-semibold">{value}</p>
        <p className={clsx(
          'text-sm mt-1',
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}>
          {change} desde ayer
        </p>
      </div>
    </div>
  );
};

export default StatCard;
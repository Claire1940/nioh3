'use client';

import type { PriorityPath } from './types';

interface Props {
  path?: PriorityPath;
  currentLevel: number;
}

export function PriorityUpgradePath({ path, currentLevel }: Props) {
  if (!path || !path.steps || path.steps.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-700/30 rounded-lg p-5 border border-gray-600">
      <h3 className="text-lg font-semibold text-white mb-2">Priority Upgrade Path</h3>
      <p className="text-sm text-gray-400 mb-4">{path.description}</p>

      <div className="space-y-3">
        {path.steps.map((step, idx) => {
          // Try to extract level from step text (e.g., "Level 20: ...")
          const levelMatch = step.match(/Level (\d+)/i);
          const stepLevel = levelMatch ? parseInt(levelMatch[1]) : 0;
          const isCompleted = stepLevel > 0 && stepLevel <= currentLevel;

          return (
            <div key={idx} className="flex items-start gap-3">
              {/* Checkbox/Number Badge */}
              <div
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Step Text */}
              <div className="flex-1 pt-0.5">
                <p
                  className={`text-sm ${
                    isCompleted
                      ? 'text-gray-400 line-through'
                      : 'text-white font-medium'
                  }`}
                >
                  {step}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Progress:</span>
          <span className="text-[#F4B860] font-semibold">
            {path.steps.filter(step => {
              const levelMatch = step.match(/Level (\d+)/i);
              const stepLevel = levelMatch ? parseInt(levelMatch[1]) : 0;
              return stepLevel > 0 && stepLevel <= currentLevel;
            }).length} / {path.steps.length} steps completed
          </span>
        </div>
      </div>
    </div>
  );
}

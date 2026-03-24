'use client';

import type { CommonMistake } from './types';

interface Props {
  mistakes: CommonMistake[];
}

export function CommonMistakesWarning({ mistakes }: Props) {
  if (!mistakes || mistakes.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-900/20 border-2 border-yellow-600/50 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">⚠️</span>
        <h3 className="text-lg font-semibold text-yellow-400">Avoid These Common Mistakes</h3>
      </div>

      <div className="space-y-4">
        {mistakes.map((item, idx) => (
          <div key={idx} className="bg-gray-800/30 rounded p-4 border border-yellow-600/30">
            {/* Mistake */}
            <div className="flex items-start gap-2 mb-2">
              <span className="text-red-400 font-bold text-sm flex-shrink-0">❌</span>
              <p className="text-sm text-red-400 font-medium">{item.mistake}</p>
            </div>

            {/* Solution */}
            <div className="flex items-start gap-2 pl-5">
              <span className="text-green-400 font-bold text-sm flex-shrink-0">✓</span>
              <p className="text-sm text-green-400">{item.solution}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

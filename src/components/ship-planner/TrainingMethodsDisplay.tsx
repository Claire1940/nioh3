'use client';

import type { TrainingMethod } from './types';

interface Props {
  methods: TrainingMethod[];
}

export function TrainingMethodsDisplay({ methods }: Props) {
  if (!methods || methods.length === 0) {
    return null;
  }

  const getXpRateBadge = (rate: string) => {
    const colorMap: Record<string, string> = {
      'high': 'bg-green-500/20 text-green-400 border-green-500/50',
      'medium-high': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      'medium': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'low-medium': 'bg-gray-500/20 text-gray-400 border-gray-500/50',
      'low': 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    };
    return colorMap[rate] || colorMap['medium'];
  };

  const getAfkBadge = (afkLevel: string) => {
    if (afkLevel === 'high') {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
    }
    if (afkLevel === 'medium') {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
    return 'bg-red-500/20 text-red-400 border-red-500/50';
  };

  return (
    <div className="bg-gray-700/30 rounded-lg p-5 border border-gray-600">
      <h3 className="text-lg font-semibold text-white mb-4">Recommended Training Methods</h3>

      <div className="space-y-3">
        {methods.map(method => (
          <div
            key={method.id}
            className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 hover:border-[#F4B860]/50 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white">{method.name}</h4>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded border ${getXpRateBadge(method.xp_rate)}`}>
                  {method.xp_rate} XP
                </span>
                <span className={`text-xs px-2 py-1 rounded border ${getAfkBadge(method.afk_level)}`}>
                  {method.afk_level === 'high' ? '😴 AFK' : method.afk_level === 'medium' ? '⚡ Semi-AFK' : '⚔️ Active'}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-2">{method.description}</p>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Level Range: {method.level_range}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

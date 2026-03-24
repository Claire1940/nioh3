'use client';

import type { HullUpgrade, HelmUpgrade, MastSail } from './types';

interface Props {
  hull?: HullUpgrade;
  helm?: HelmUpgrade;
  mast?: MastSail;
}

function UpgradeCard({
  title,
  upgrade,
  type
}: {
  title: string;
  upgrade: HullUpgrade | HelmUpgrade | MastSail;
  type: 'hull' | 'helm' | 'mast';
}) {
  const tier = 'tier' in upgrade ? upgrade.tier : undefined;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600 hover:border-[#F4B860]/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-white">{title}</h4>
        {tier !== undefined && (
          <span className="text-xs px-2 py-1 bg-[#F4B860]/20 text-[#F4B860] rounded border border-[#F4B860]/50">
            Tier {tier}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Material:</span>
          <span className="text-sm text-white">{upgrade.material}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Min Level:</span>
          <span className="text-sm text-[#F4B860]">Level {upgrade.min_level}</span>
        </div>

        {/* Stats */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Stats:</p>
          <div className="space-y-1">
            {Object.entries(upgrade.stats).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-400 capitalize">
                  {key.replace('_', ' ')}:
                </span>
                <span className="text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {upgrade.notes && (
          <p className="text-xs text-gray-400 mt-3 italic">{upgrade.notes}</p>
        )}
      </div>
    </div>
  );
}

export function ShipUpgradesDisplay({ hull, helm, mast }: Props) {
  if (!hull && !helm && !mast) {
    return null;
  }

  return (
    <div className="bg-gray-700/30 rounded-lg p-5 border border-gray-600">
      <h3 className="text-lg font-semibold text-white mb-4">Ship Upgrades</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hull && <UpgradeCard title="Hull" upgrade={hull} type="hull" />}
        {helm && <UpgradeCard title="Helm" upgrade={helm} type="helm" />}
        {mast && <UpgradeCard title="Mast & Sails" upgrade={mast} type="mast" />}
      </div>
    </div>
  );
}

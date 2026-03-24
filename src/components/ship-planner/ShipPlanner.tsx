'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import type { ShipsData, ShipPlannerProps } from './types';
import { ShipUpgradesDisplay } from './ShipUpgradesDisplay';
import { TrainingMethodsDisplay } from './TrainingMethodsDisplay';
import { PriorityUpgradePath } from './PriorityUpgradePath';
import { CommonMistakesWarning } from './CommonMistakesWarning';

export function ShipPlanner({
  variant = 'full',
  initialLevel = 1,
  initialPlaystyle = 'afk',
  showTitle = true
}: ShipPlannerProps) {
  const t = useTranslations('tools.shipPlanner');
  const [loading, setLoading] = useState(true);
  const [shipsData, setShipsData] = useState<ShipsData | null>(null);
  const [level, setLevel] = useState(initialLevel);
  const [playstyle, setPlaystyle] = useState(initialPlaystyle);

  useEffect(() => {
    fetch('/data/ships_and_facilities.json')
      .then(res => res.json())
      .then(data => {
        setShipsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load ship data:', err);
        setLoading(false);
      });
  }, []);

  const availableShips = shipsData?.ships?.filter(ship => ship.min_level <= level) || [];

  // Get recommended preset based on level AND playstyle
  const getRecommendedPreset = () => {
    if (!shipsData?.presets) return null;

    // Filter by level range
    const eligible = shipsData.presets.filter(p =>
      p.min_level <= level && (!p.max_level || level <= p.max_level)
    );

    // Match by playstyle
    const playstyleMapping: Record<string, string[]> = {
      'afk': ['level_42_plus_endgame_afk', 'level_31_42_double_hook', 'level_20_31_early_salvaging'],
      'active': ['barracuda_trials_active', 'port_tasks_runner'],
      'mixed': ['mixed_playstyle', 'level_24_plus_sloop_upgrade']
    };

    const preferredIds = playstyleMapping[playstyle] || [];
    const match = eligible.find(p => preferredIds.includes(p.id));

    return match || eligible.sort((a, b) => b.min_level - a.min_level)[0];
  };

  const preset = getRecommendedPreset();
  const recommended = shipsData?.ships?.find(s => s.id === preset?.ship_id);

  // Get recommended upgrades based on level
  const recommendedHull = shipsData?.hull_upgrades
    ?.filter(h => h.min_level <= level)
    .sort((a, b) => b.min_level - a.min_level)[0];

  const recommendedHelm = shipsData?.helm_upgrades
    ?.filter(h => h.min_level <= level)
    .sort((a, b) => b.min_level - a.min_level)[0];

  const recommendedMast = shipsData?.mast_sails
    ?.filter(m => m.min_level <= level)[0];

  // Get training methods for playstyle
  const trainingMethods = shipsData?.training_methods?.filter(method => {
    const playstyleMap: Record<string, string[]> = {
      'afk': ['salvaging'],
      'active': ['barracuda_trials', 'port_tasks'],
      'mixed': ['salvaging', 'port_tasks', 'sea_charting']
    };
    const preferred = playstyleMap[playstyle] || [];
    const [minLevel] = method.level_range.split('-').map(Number);
    return preferred.includes(method.id) && level >= minLevel;
  }) || [];

  // Get priority path
  const priorityPath = level <= 30
    ? shipsData?.priority_upgrade_paths?.absolute_beginner
    : shipsData?.priority_upgrade_paths?.efficient_progression;

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">{t('loading')}</p>
      </div>
    );
  }

  const containerClass = variant === 'embedded' ? 'w-full' : '';
  const gridClass = variant === 'embedded'
    ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
    : 'grid grid-cols-1 lg:grid-cols-2 gap-8';

  return (
    <div className={containerClass}>
      {showTitle && variant === 'full' && (
        <>
          <h1 className="text-4xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-300 mb-8">{t('subtitle')}</p>
          <p className="text-gray-400 mb-12 max-w-3xl">{t('description')}</p>
        </>
      )}

      <div className={gridClass}>
        {/* Input Section */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">
            {variant === 'embedded' ? 'Configure' : 'Configure Your Build'}
          </h2>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">{t('currentLevel')}</label>
            <input
              type="range"
              min="1"
              max="99"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-2xl font-bold text-[#F4B860] mt-2">Level {level}</div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">{t('playstyle')}</label>
            <select
              value={playstyle}
              onChange={(e) => setPlaystyle(e.target.value as 'afk' | 'active' | 'mixed')}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
            >
              <option value="afk">{t('playstyleAfk')}</option>
              <option value="active">{t('playstyleActive')}</option>
              <option value="mixed">{t('playstyleMixed')}</option>
            </select>
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">{t('recommendedShip')}</h2>

          {recommended ? (
            <div className="space-y-6">
              {/* Ship Info */}
              <div className="p-4 bg-gray-700/50 rounded border border-gray-600">
                <h3 className="text-xl font-bold text-[#F4B860] mb-2">{recommended.name}</h3>
                <p className="text-gray-300 text-sm mb-2">{recommended.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-400">{t('minLevel')}: <span className="text-white">{recommended.min_level}</span></span>
                  <span className="text-gray-400">Slots: <span className="text-white">{recommended.slots}</span></span>
                </div>
              </div>

              {/* Core Facilities */}
              {preset && preset.core_facilities && preset.core_facilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('coreFacilities')}</h3>
                  <p className="text-gray-400 text-sm mb-3">{preset.description}</p>
                  <ul className="space-y-2">
                    {preset.core_facilities.map((facilityId: string, idx: number) => {
                      const facility = shipsData?.facilities.find(f => f.id === facilityId);
                      return facility ? (
                        <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-green-400 flex-shrink-0">✓</span>
                          <span>{facility.name} <span className="text-gray-500">(Level {facility.min_level})</span></span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}

              {/* Optional Facilities */}
              {preset && preset.optional_facilities && preset.optional_facilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('optionalFacilities')}</h3>
                  <ul className="space-y-2">
                    {preset.optional_facilities.map((facilityId: string, idx: number) => {
                      const facility = shipsData?.facilities.find(f => f.id === facilityId);
                      return facility ? (
                        <li key={idx} className="text-gray-400 text-sm flex items-start gap-2">
                          <span className="flex-shrink-0">○</span>
                          <span>{facility.name} <span className="text-gray-500">(Level {facility.min_level})</span></span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">{t('noShipAvailable')}</p>
          )}
        </div>
      </div>

      {/* Additional Sections - Full Width Below Grid */}
      {recommended && (
        <div className="mt-8 space-y-6">
          {/* Ship Upgrades */}
          <ShipUpgradesDisplay
            hull={recommendedHull}
            helm={recommendedHelm}
            mast={recommendedMast}
          />

          {/* Training Methods */}
          <TrainingMethodsDisplay methods={trainingMethods} />

          {/* Priority Upgrade Path */}
          <PriorityUpgradePath path={priorityPath} currentLevel={level} />

          {/* Common Mistakes */}
          <CommonMistakesWarning mistakes={shipsData?.common_mistakes || []} />
        </div>
      )}
    </div>
  );
}

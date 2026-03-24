export interface Ship {
  id: string;
  name: string;
  min_level: number;
  max_level?: number;
  roles: string[];
  slots: number;
  description: string;
  unlock_requirement?: string;
}

export interface Facility {
  id: string;
  name: string;
  min_level: number;
  category: string;
  xp_role: string;
  priority?: string;
  notes: string;
  recommended_for: string[];
}

export interface Preset {
  id: string;
  label: string;
  min_level: number;
  max_level?: number;
  ship_id: string;
  core_facilities: string[];
  optional_facilities: string[];
  priority_order?: string[];
  description: string;
}

export interface HullUpgrade {
  id: string;
  name: string;
  min_level: number;
  material: string;
  tier: number;
  stats: {
    durability: string;
    weight_capacity: string;
  };
  notes: string;
}

export interface HelmUpgrade {
  id: string;
  name: string;
  min_level: number;
  material: string;
  tier: number;
  stats: {
    steering: string;
    navigation_bonus: string;
  };
  notes: string;
}

export interface MastSail {
  id: string;
  name: string;
  min_level: number;
  material: string;
  stats: {
    speed: string;
    wind_efficiency: string;
  };
  notes: string;
}

export interface TrainingMethod {
  id: string;
  name: string;
  level_range: string;
  xp_rate: string;
  afk_level: string;
  description: string;
}

export interface PriorityPath {
  description: string;
  steps: string[];
}

export interface CommonMistake {
  mistake: string;
  solution: string;
}

export interface ShipsData {
  ships: Ship[];
  facilities: Facility[];
  presets: Preset[];
  hull_upgrades?: HullUpgrade[];
  helm_upgrades?: HelmUpgrade[];
  mast_sails?: MastSail[];
  training_methods?: TrainingMethod[];
  priority_upgrade_paths?: {
    absolute_beginner?: PriorityPath;
    efficient_progression?: PriorityPath;
  };
  common_mistakes?: CommonMistake[];
}

export interface ShipPlannerProps {
  variant?: 'full' | 'embedded';
  initialLevel?: number;
  initialPlaystyle?: 'afk' | 'active' | 'mixed';
  showTitle?: boolean;
}

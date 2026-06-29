// Road type modifiers
const ROAD_TYPE_MODIFIERS = {
  smooth: 1.0,
  mixed: 0.92,
  gravel: 0.82,
  wet: 0.88,
};

// Tire condition modifiers
const TIRE_CONDITION_MODIFIERS = {
  1: 0.85,
  2: 0.87,
  3: 0.89,
  4: 0.91,
  5: 0.93,
  6: 0.95,
  7: 0.97,
  8: 0.99,
  9: 1.01,
  10: 1.03,
};

// Wheel diameter modifiers — larger wheels need slightly less pressure
const WHEEL_DIAMETER_MODIFIERS = {
  "700c": 1.0,
  "650b": 1.03,
  26: 1.05,
};

// Tire type modifiers — tubeless runs lower pressure safely
const TIRE_TYPE_MODIFIERS = {
  clincher: 1.0,
  tubeless: 0.9,
  tube: 1.05,
};

// Weight distribution by bike type — front/rear split
const WEIGHT_DISTRIBUTION = {
  road: { front: 0.48, rear: 0.52 },
  gravel: { front: 0.47, rear: 0.53 },
  mountain: { front: 0.465, rear: 0.535 },
  triathlon: { front: 0.5, rear: 0.5 },
};

export const ROAD_TYPE_LABELS = {
  smooth: "Smooth road",
  mixed: "Mixed terrain",
  gravel: "Gravel / trail",
  wet: "Wet road",
};

export const ROAD_TYPE_DESCRIPTIONS = {
  smooth: "Optimized for speed and efficiency on paved roads",
  mixed: "Balanced for pavement and light off-road sections",
  gravel: "Lower pressure improves grip and absorbs trail vibration",
  wet: "Reduced pressure widens the contact patch for wet traction",
};

export const TIRE_CONDITION_LABELS = {
  1: "Very poor",
  2: "Poor",
  3: "Below average",
  4: "Fair",
  5: "Average",
  6: "Above average",
  7: "Good",
  8: "Very good",
  9: "Excellent",
  10: "Perfect",
};

export const WHEEL_DIAMETER_LABELS = {
  "700c": '700c / 29"',
  "650b": '650b / 27.5"',
  26: '26"',
};

export const TIRE_TYPE_LABELS = {
  clincher: "Clincher",
  tubeless: "Tubeless",
  tube: "Inner tube",
};

export const BIKE_TYPE_LABELS = {
  road: "Road bike",
  gravel: "Gravel bike",
  mountain: "Mountain bike",
  triathlon: "Triathlon / TT",
};

/**
 * Calculates recommended front and rear tire PSI
 *
 * @param {number} riderWeightLbs  - rider body weight in pounds
 * @param {number} bikeWeightLbs   - bike weight in pounds
 * @param {number} tireCondition   - 1 (worst) to 10 (best)
 * @param {string} roadType        - smooth | mixed | gravel | wet
 * @param {number} tireWidthMm     - tire width in mm e.g. 25, 32, 40
 * @param {string} wheelDiameter   - 700c | 650b | 26
 * @param {string} tireType        - clincher | tubeless | tube
 * @param {string} bikeType        - road | gravel | mountain | triathlon
 * @returns {{ front: number, rear: number }}
 */
export function calculatePSI(
  riderWeightLbs,
  bikeWeightLbs,
  tireCondition,
  roadType,
  tireWidthMm = 25,
  wheelDiameter = "700c",
  tireType = "clincher",
  bikeType = "road",
) {
  const totalWeight = riderWeightLbs + bikeWeightLbs;
  const distribution =
    WEIGHT_DISTRIBUTION[bikeType] ?? WEIGHT_DISTRIBUTION.road;

  // front and rear carry different loads based on bike type
  const frontWeight = totalWeight * distribution.front;
  const rearWeight = totalWeight * distribution.rear;

  // tire width scaling — wider tires need less pressure
  // based on the Frank Berto tire pressure model
  const widthFactor = Math.pow(25 / tireWidthMm, 1.5);

  const roadMod = ROAD_TYPE_MODIFIERS[roadType] ?? 1.0;
  const conditionMod = TIRE_CONDITION_MODIFIERS[tireCondition] ?? 0.99;
  const diameterMod = WHEEL_DIAMETER_MODIFIERS[wheelDiameter] ?? 1.0;
  const typeMod = TIRE_TYPE_MODIFIERS[tireType] ?? 1.0;

  const combinedMod = roadMod * conditionMod * diameterMod * typeMod;

  // base PSI per wheel using weight on that wheel
  const rearBase = rearWeight * 0.9;
  const frontBase = frontWeight * 0.9;

  const rear = Math.round(rearBase * combinedMod * widthFactor);
  const front = Math.round(frontBase * combinedMod * widthFactor);

  return {
    front: Math.max(20, Math.min(160, front)),
    rear: Math.max(20, Math.min(160, rear)),
  };
}

/**
 * Returns a PSI safety warning if values are outside typical ranges
 */
export function getPSIWarning(front, rear, tireType) {
  const minSafe = tireType === "tubeless" ? 20 : 40;
  if (front < minSafe || rear < minSafe) {
    return "PSI is on the lower end — check for slow leaks before riding";
  }
  if (front > 120 || rear > 120) {
    return "PSI is on the higher end — inspect tires for wear or damage";
  }
  return null;
}

/**
 * Returns a friendly summary sentence for the result
 */
export function getPSISummary(front, rear, roadType) {
  const desc = ROAD_TYPE_DESCRIPTIONS[roadType];
  return `${front} PSI front · ${rear} PSI rear — ${desc}`;
}

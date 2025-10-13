/**
 * Scales a raw input value to engineering units using linear interpolation
 * @param rawValue - The raw input value to scale
 * @param rawMin - Minimum raw value (e.g., 0 for 4-20mA at 0mA)
 * @param rawMax - Maximum raw value (e.g., 32767 for INT16)
 * @param engMin - Minimum engineering value
 * @param engMax - Maximum engineering value
 * @returns Scaled value in engineering units
 */
export function scaleValue(
  rawValue: number,
  rawMin: number,
  rawMax: number,
  engMin: number,
  engMax: number
): number {
  // Clamp raw value to valid range
  const clampedRaw = Math.max(rawMin, Math.min(rawMax, rawValue));

  // Calculate scaling factor
  const rawRange = rawMax - rawMin;
  const engRange = engMax - engMin;

  // Prevent division by zero
  if (rawRange === 0) {
    return engMin;
  }

  // Linear interpolation formula
  const scaledValue = ((clampedRaw - rawMin) / rawRange) * engRange + engMin;

  return scaledValue;
}

/**
 * Interface for scaling configuration
 */
export interface ScalingConfig {
  rawMin: number;
  rawMax: number;
  engMin: number;
  engMax: number;
}

/**
 * Common scaling configurations for different sensor types
 */
export const SCALING_CONFIGS = {
  // Standard INT16 full range
  INT16_FULL: {
    rawMin: -32768,
    rawMax: 32767,
    engMin: 0,
    engMax: 100
  } as ScalingConfig,

  // 4-20mA signal (typical for industrial sensors)
  ANALOG_4_20MA: {
    rawMin: 6400,    // ~4mA at 12-bit ADC
    rawMax: 32000,   // ~20mA at 12-bit ADC
    engMin: 0,
    engMax: 100
  } as ScalingConfig,
};
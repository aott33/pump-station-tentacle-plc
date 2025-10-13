import { createLogger, LogLevel } from "@joyautomation/coral";

const logger = createLogger("sensor-monitor", LogLevel.debug);

// Track initialization state
let initialized = false;

/**
 * Sensor Monitor Task
 *
 * Continuously monitors pump station sensor values and logs any anomalies.
 * Executes at 100ms scan rate for responsive control applications.
 *
 * Registers monitored:
 * - 2000: Suction Pressure (0-100 PSI)
 * - 2001: Discharge Pressure (0-200 PSI)
 * - 2002: Flow Rate (0-500 GPM)
 * - 2003: Motor Temperature (50-150°F)
 *
 * Note: All sensor values are already scaled to engineering units by the
 * variable definitions' onResponse callbacks. This task reads the scaled
 * values and performs validation/logging only.
 *
 * @param variables - Tentacle PLC variables object (read-only access via .value)
 * @param setVar - Function to write variable values (not used in this task)
 */
export function sensorMonitorTask(variables: any, setVar: any): void {
  try {
    // Log initialization on first execution
    if (!initialized) {
      logger.info("Sensor monitor task initialized", {
        scanRate: "100ms",
        registers: "1999-2002",
      });
      initialized = true;
    }

    // Read sensor values (already scaled to engineering units)
    const suctionPressure = variables.suctionPressure?.value;
    const dischargePressure = variables.dischargePressure?.value;
    const flowRate = variables.flowRate?.value;
    const motorTemperature = variables.motorTemperature?.value;

    // Handle null/undefined values with fallback
    if (suctionPressure === null || suctionPressure === undefined) {
      logger.error("Failed to read sensor", {
        sensor: "suctionPressure",
        error: "Value is null or undefined",
      });
    }

    if (dischargePressure === null || dischargePressure === undefined) {
      logger.error("Failed to read sensor", {
        sensor: "dischargePressure",
        error: "Value is null or undefined",
      });
    }

    if (flowRate === null || flowRate === undefined) {
      logger.error("Failed to read sensor", {
        sensor: "flowRate",
        error: "Value is null or undefined",
      });
    }

    if (motorTemperature === null || motorTemperature === undefined) {
      logger.error("Failed to read sensor", {
        sensor: "motorTemperature",
        error: "Value is null or undefined",
      });
    }

    // Validate sensor ranges and log warnings for out-of-range values
    if (
      suctionPressure !== null && suctionPressure !== undefined &&
      (suctionPressure < 0 || suctionPressure > 100)
    ) {
      logger.warn("Sensor value out of expected range", {
        sensor: "suctionPressure",
        value: suctionPressure,
        expected: "0-100 PSI",
      });
    }

    if (
      dischargePressure !== null && dischargePressure !== undefined &&
      (dischargePressure < 0 || dischargePressure > 200)
    ) {
      logger.warn("Sensor value out of expected range", {
        sensor: "dischargePressure",
        value: dischargePressure,
        expected: "0-200 PSI",
      });
    }

    if (
      flowRate !== null && flowRate !== undefined &&
      (flowRate < 0 || flowRate > 500)
    ) {
      logger.warn("Sensor value out of expected range", {
        sensor: "flowRate",
        value: flowRate,
        expected: "0-500 GPM",
      });
    }

    if (
      motorTemperature !== null && motorTemperature !== undefined &&
      (motorTemperature < 50 || motorTemperature > 150)
    ) {
      logger.warn("Sensor value out of expected range", {
        sensor: "motorTemperature",
        value: motorTemperature,
        expected: "50-150°F",
      });
    }
  } catch (error) {
    logger.error("Sensor monitor task critical error", { error });
  }
}

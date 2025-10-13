import { createLogger, LogLevel } from "@joyautomation/coral";

const logger = createLogger("pump-control", LogLevel.debug);

// Module-level state
let initialized = false;
let startupTimerCount = 0;

// Startup delay constant (4 cycles × 500ms = 2 seconds)
const STARTUP_DELAY_CYCLES = 4;

/**
 * Check safety interlocks for pump operation
 *
 * @param motorTemp - Current motor temperature (°F)
 * @param suctionPress - Current suction pressure (PSI)
 * @param tempSetpoint - Temperature setpoint threshold (°F)
 * @param pressSetpoint - Pressure setpoint threshold (PSI)
 * @param isStarting - Whether pump is in startup phase (exempts pressure check)
 * @returns Object with safe flag and optional reason for interlock violation
 */
function checkSafetyInterlocks(
  motorTemp: number,
  suctionPress: number,
  tempSetpoint: number,
  pressSetpoint: number,
  isStarting: boolean
): { safe: boolean; reason?: string } {
  // Temperature interlock (always active)
  if (motorTemp >= tempSetpoint) {
    return { safe: false, reason: "Motor temperature critical" };
  }

  // Pressure interlock (only active after startup phase)
  if (!isStarting && suctionPress <= pressSetpoint) {
    return { safe: false, reason: "Low suction pressure - cavitation risk" };
  }

  return { safe: true };
}

/**
 * Pump Control Task
 *
 * Implements start/stop control logic with safety interlocks for pump station.
 * Executes at 500ms scan rate.
 *
 * State Machine:
 * - Stopped: Waits for start button and safety interlock clearance
 * - Running: Monitors stop button and safety interlocks for emergency shutdown
 *
 * Safety Interlocks:
 * - Motor temperature: Must be < temperatureSetpoint (default 145°F, SCADA-configurable, always active)
 * - Suction pressure: Must be > pressureSetpoint (default 5 PSI, SCADA-configurable, exempted for first 2 seconds after start)
 *
 * @param variables - Tentacle PLC variables object (read-only access via .value)
 * @param setVar - Function to write variable values
 */
export function pumpControlTask(variables: any, setVar: any): void {
  // One-time initialization
  if (!initialized) {
    logger.info("Pump control task initialized", { scanRate: "500ms" });
    initialized = true;
  }

  try {
    // Read sensor values
    const motorTemp = variables.motorTemperature?.value;
    const suctionPress = variables.suctionPressure?.value;

    // Read setpoints
    const tempSetpoint = variables.temperatureSetpoint?.value;
    const pressSetpoint = variables.pressureSetpoint?.value;

    // Read control inputs
    const startButton = variables.localStart?.value;
    const stopButton = variables.localStop?.value;

    // Read current pump state
    const currentPumpState = variables.pumpEnabled?.value;

    // Validate all required variables are present
    if (
      motorTemp === undefined || motorTemp === null ||
      suctionPress === undefined || suctionPress === null ||
      tempSetpoint === undefined || tempSetpoint === null ||
      pressSetpoint === undefined || pressSetpoint === null ||
      startButton === undefined || startButton === null ||
      stopButton === undefined || stopButton === null ||
      currentPumpState === undefined || currentPumpState === null
    ) {
      logger.error("Pump control task: Missing required variables", {
        motorTemp,
        suctionPress,
        tempSetpoint,
        pressSetpoint,
        startButton,
        stopButton,
        currentPumpState,
      });
      return;
    }

    // Determine if pump is in startup phase (pressure buildup exemption)
    const isInStartupPhase = currentPumpState && startupTimerCount < STARTUP_DELAY_CYCLES;

    // State Machine: Stopped State
    if (currentPumpState === false) {
      // Check for start command
      if (startButton === true) {
        // Check safety interlocks (startup mode - pressure check exempted)
        const interlockCheck = checkSafetyInterlocks(
          motorTemp,
          suctionPress,
          tempSetpoint,
          pressSetpoint,
          true // isStarting = true (startup mode)
        );

        if (interlockCheck.safe) {
          // Start pump
          setVar("pumpEnabled", true);
          startupTimerCount = 0; // Reset startup timer
          logger.info("Pump started", {
            motorTemp,
            suctionPress,
            tempSetpoint,
            pressSetpoint,
          });
        } else {
          // Start command rejected due to safety interlock
          logger.warn("Start command rejected - safety interlock", {
            reason: interlockCheck.reason,
            motorTemp,
            suctionPress,
            tempSetpoint,
            pressSetpoint,
          });
        }
      }
    }

    // State Machine: Running State
    if (currentPumpState === true) {
      // Increment startup timer if still in startup phase
      if (isInStartupPhase) {
        startupTimerCount++;
        logger.debug(
          `Pump starting... waiting for pressure buildup (${startupTimerCount}/${STARTUP_DELAY_CYCLES} cycles)`
        );
      }

      // Check stop button (NC button: false = pressed)
      if (stopButton === false) {
        setVar("pumpEnabled", false);
        logger.info("Pump stopped by operator");
        return;
      }

      // Check safety interlocks (with startup phase awareness)
      const interlockCheck = checkSafetyInterlocks(
        motorTemp,
        suctionPress,
        tempSetpoint,
        pressSetpoint,
        isInStartupPhase
      );

      if (!interlockCheck.safe) {
        // Emergency stop due to safety interlock violation
        setVar("pumpEnabled", false);
        logger.error("Emergency stop - safety interlock", {
          reason: interlockCheck.reason,
          motorTemp,
          suctionPress,
          tempSetpoint,
          pressSetpoint,
        });
      }
    }

    // Write pump state to simulator for pump-aware sensor behavior
    setVar("pumpStateOutput", variables.pumpEnabled.value);

  } catch (error) {
    logger.error("Pump control task critical error", { error });
  }
}

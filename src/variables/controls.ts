import type {
  PlcVariableBooleanWithModbusSource,
  PlcVariableBoolean,
  PlcVariableNumber,
} from "@joyautomation/tentacle";
import type { Sources } from "./types.ts";

/**
 * Pump Control Variables
 *
 * Control I/O and internal state variables for pump operation:
 * - localStop: Normally closed stop button input (Modbus coil 2500)
 * - localStart: Normally open start button input (Modbus coil 2501)
 * - pumpEnabled: Internal pump running state
 * - pumpStateOutput: Pump state output to simulator (Modbus coil 2502)
 * - temperatureSetpoint: Motor temperature alarm threshold (SCADA-configurable)
 * - pressureSetpoint: Minimum suction pressure threshold (SCADA-configurable)
 *
 * All Modbus I/O uses 100ms scan rate for responsive control.
 */

export const controlVariables = {
  /**
   * Normally Closed (NC) Stop Button Input
   *
   * - true = button not pressed (circuit closed, normal operation allowed)
   * - false = button pressed (circuit open, emergency stop)
   *
   * Safety-oriented design: Wire break or power loss = stop command
   * Read from Modbus coil 2500 every 100ms
   */
  localStop: {
    id: "localStop",
    description: "Normally closed stop button (true = not pressed, false = pressed)",
    datatype: "boolean" as const,
    default: true,
    source: {
      id: "modbusRemoteIO",
      type: "modbus" as const,
      rate: 100,
      bidirectional: false, // Read-only input
      register: 2500,
      registerType: "COIL" as const,
      format: "INT16" as const
    },
  } as PlcVariableBooleanWithModbusSource<Sources>,

  /**
   * Normally Open (NO) Start Button Input
   *
   * - false = button not pressed (circuit open, no start command)
   * - true = button pressed (circuit closed, start command active)
   *
   * Requires active signal to initiate pump start sequence
   * Read from Modbus coil 2501 every 100ms
   */
  localStart: {
    id: "localStart",
    description: "Normally open start button (false = not pressed, true = pressed)",
    datatype: "boolean" as const,
    default: false,
    source: {
      id: "modbusRemoteIO",
      type: "modbus" as const,
      rate: 100,
      bidirectional: false, // Read-only input
      register: 2501,
      registerType: "COIL" as const,
      format: "INT16" as const
    },
  } as PlcVariableBooleanWithModbusSource<Sources>,

  /**
   * Internal Pump Running State
   *
   * - true = pump is running
   * - false = pump is stopped
   *
   * This internal state variable is updated by the pump-control task based on
   * control logic (start/stop buttons, interlocks, alarms). It represents the
   * commanded pump state and is written to pumpStateOutput for simulator feedback.
   */
  pumpEnabled: {
    id: "pumpEnabled",
    description: "Internal pump running state (true = running, false = stopped)",
    datatype: "boolean" as const,
    default: false, // Pump starts in stopped state
  } as PlcVariableBoolean,

  /**
   * Pump State Output to Simulator
   *
   * - true = pump is running (written to coil 2502)
   * - false = pump is stopped (written to coil 2502)
   *
   * Feedback mechanism:
   * 1. pump-control task updates pumpEnabled based on control logic
   * 2. pump-control task writes pumpEnabled value to pumpStateOutput
   * 3. Simulator reads coil 2502 to determine pump operating state
   * 4. Simulator adjusts sensor behavior (pressure, flow) based on pump state
   *
   * Written to Modbus coil 2502 every 100ms
   */
  pumpStateOutput: {
    id: "pumpStateOutput",
    description: "Pump state output to simulator for pump-aware sensor behavior",
    datatype: "boolean" as const,
    default: false,
    source: {
      id: "modbusRemoteIO",
      type: "modbus" as const,
      rate: 100,
      bidirectional: true, // Writable output
      register: 2502,
      registerType: "COIL" as const,
      format: "INT16" as const,
    },
  } as PlcVariableBooleanWithModbusSource<Sources>,

  /**
   * Motor Temperature Alarm Threshold
   *
   * Configurable setpoint for motor overtemperature protection (°F).
   * When motorTemperature sensor exceeds this threshold, pump-control task
   * will trip the motor overtemperature alarm and stop the pump.
   *
   * Default: 145°F
   * Configurable via SCADA system (Tentacle UI, GraphQL API, or MQTT)
   */
  temperatureSetpoint: {
    id: "temperatureSetpoint",
    description: "Motor temperature alarm threshold (°F) - configurable via SCADA",
    datatype: "number" as const,
    default: 145,
    decimals: 1,
    metadata: {
      units: "°F",
    },
  } as PlcVariableNumber,

  /**
   * Minimum Suction Pressure Threshold
   *
   * Configurable setpoint for cavitation protection (PSI).
   * When suctionPressure sensor falls below this threshold, pump-control task
   * will trip the low suction pressure alarm and stop the pump.
   *
   * Default: 5 PSI
   * Configurable via SCADA system (Tentacle UI, GraphQL API, or MQTT)
   */
  pressureSetpoint: {
    id: "pressureSetpoint",
    description: "Minimum suction pressure threshold (PSI) - configurable via SCADA",
    datatype: "number" as const,
    default: 5,
    decimals: 2,
    metadata: {
      units: "PSI",
    },
  } as PlcVariableNumber,
};

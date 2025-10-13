import type { PlcVariableNumberWithModbusSource } from "@joyautomation/tentacle";
import type { Sources } from "./types.ts";
import { scaleValue } from "../utils/scaling.ts";

/**
 * Pump Station Sensor Variables
 *
 * Four sensors monitor critical pump operation parameters:
 * - suctionPressure: Pump inlet pressure (prevents cavitation)
 * - dischargePressure: Pump outlet pressure (system delivery)
 * - flowRate: Water flow through pump
 * - motorTemperature: Motor winding temperature (overheating protection)
 *
 * All sensors use 100ms scan rate for responsive control.
 * Raw Modbus range: 0-32000 (typical 12-bit ADC)
 */
export const sensorVariables = {
  suctionPressure: {
    id: "suctionPressure",
    description: "Pump inlet pressure",
    datatype: "number" as const,
    default: 0,
    decimals: 2,
    metadata: {
      units: "PSI",
      engMin: 0,
      engMax: 100,
    },
    source: {
      id: "modbusRemoteIO",
      type: "modbus" as const,
      rate: 100,
      bidirectional: false,
      register: 2000,
      registerType: "HOLDING_REGISTER" as const,
      format: "INT16" as const,
      onResponse: (value: string | number | boolean) => {
        return scaleValue(Number(value), 0, 32000, 0, 100);
      },
    },
  } as PlcVariableNumberWithModbusSource<Sources>,

  dischargePressure: {
    id: "dischargePressure",
    description: "Pump outlet pressure",
    datatype: "number" as const,
    default: 0,
    decimals: 2,
    metadata: {
      units: "PSI",
      engMin: 0,
      engMax: 200,
    },
    source: {
      id: "modbusRemoteIO",
      type: "modbus" as const,
      rate: 100,
      bidirectional: false,
      register: 2001,
      registerType: "HOLDING_REGISTER" as const,
      format: "INT16" as const,
      onResponse: (value: string | number | boolean) => {
        return scaleValue(Number(value), 0, 32000, 0, 200);
      },
    },
  } as PlcVariableNumberWithModbusSource<Sources>,

  flowRate: {
    id: "flowRate",
    description: "Water flow rate",
    datatype: "number" as const,
    default: 0,
    decimals: 1,
    metadata: {
      units: "GPM",
      engMin: 0,
      engMax: 500,
    },
    source: {
      id: "modbusRemoteIO",
      type: "modbus" as const,
      rate: 100,
      bidirectional: false,
      register: 2002,
      registerType: "HOLDING_REGISTER" as const,
      format: "INT16" as const,
      onResponse: (value: string | number | boolean) => {
        return scaleValue(Number(value), 0, 32000, 0, 500);
      },
    },
  } as PlcVariableNumberWithModbusSource<Sources>,

  motorTemperature: {
    id: "motorTemperature",
    description: "Motor winding temperature",
    datatype: "number" as const,
    default: 0,
    decimals: 1,
    metadata: {
      units: "°F",
      engMin: 50,
      engMax: 150,
    },
    source: {
      id: "modbusRemoteIO",
      type: "modbus" as const,
      rate: 100,
      bidirectional: false,
      register: 2003,
      registerType: "HOLDING_REGISTER" as const,
      format: "INT16" as const,
      onResponse: (value: string | number | boolean) => {
        return scaleValue(Number(value), 0, 32000, 50, 150);
      },
    },
  } as PlcVariableNumberWithModbusSource<Sources>,
};
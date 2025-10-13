// Import Tentacle Resources
import {
  createTentacle,
  MqttConnection,
  type PlcVariableNumberWithModbusSource,
  type PlcVariableBooleanWithModbusSource,
  type PlcVariableNumber,
  type PlcVariableBoolean,
} from "@joyautomation/tentacle";

// Import Loggers
import {
  createLogger,
  LogLevel
} from "@joyautomation/coral";

// Import variables and types
import type { Sources } from "./variables/types.ts";
import { sensorVariables } from "./variables/sensors.ts";
import { controlVariables } from "./variables/controls.ts";

// Import tasks
import { sensorMonitorTask } from "./tasks/sensor-monitor.ts";
import { pumpControlTask } from "./tasks/pump-control.ts";

// Initialize logger
const logger = createLogger("tentacle-plc", LogLevel.info);

// Environment variables
const MODBUS_HOST = Deno.env.get("MODBUS_IO_HOST") || "modbus-sim";
const MODBUS_PORT = parseInt(Deno.env.get("MODBUS_IO_PORT") || "5020");
const MQTT_HOST = Deno.env.get("MQTT_HOST") || "hivemq";
const MQTT_PORT = parseInt(Deno.env.get("MQTT_PORT") || "1883");
const SENSOR_MONITOR_RATE = parseInt(Deno.env.get("TASK_SENSOR_MONITOR_RATE_MS") || "100");
const PUMP_CONTROL_RATE = parseInt(Deno.env.get("TASK_PUMP_CONTROL_RATE_MS") || "500");

// Type definitions
type Variables = {
  // Sensor variables
  suctionPressure: PlcVariableNumberWithModbusSource<Sources>;
  dischargePressure: PlcVariableNumberWithModbusSource<Sources>;
  flowRate: PlcVariableNumberWithModbusSource<Sources>;
  motorTemperature: PlcVariableNumberWithModbusSource<Sources>;

  // Control variables
  localStart: PlcVariableBooleanWithModbusSource<Sources>;
  localStop: PlcVariableBooleanWithModbusSource<Sources>;
  pumpEnabled: PlcVariableBoolean;
  pumpStateOutput: PlcVariableBooleanWithModbusSource<Sources>;

  // Setpoint variables
  temperatureSetpoint: PlcVariableNumber;
  pressureSetpoint: PlcVariableNumber;
};

type Mqtts = {
  local: MqttConnection;
};

// Define sources configuration
const sources: Sources = {
  modbusRemoteIO: {
    id: "modbusRemoteIO",
    name: "Remote I/O",
    description: "Modbus connection to pump station simulator",
    type: "modbus",
    enabled: true,
    host: MODBUS_HOST,
    port: MODBUS_PORT,
    unitId: 1,
    timeout: 3000,
    retryMinDelay: 1000,
    retryMaxDelay: 60000,
    reverseBits: false,
    reverseWords: false,
  },
};

// Define variables configuration
const variables: Variables = {
  ...sensorVariables,
  ...controlVariables,
};

// Define MQTT configuration
const mqtts: Mqtts = {
  local: {
      enabled: true,
      name: "local",
      description: "Local MQTT connection",
      serverUrl: `mqtt://${MQTT_HOST}:${MQTT_PORT}`,
      username: "",
      password: "",
      groupId: "pump-station",
      clientId: `client1-tentacle-plc`,
      nodeId: "tentacle-plc",
      deviceId: "tentacle-plc",
      version: "spBv1.0",
  },
};

logger.info("Initializing Tentacle PLC - Pump Station Control System");
logger.info("Environment configuration", {
  modbusHost: MODBUS_HOST,
  modbusPort: MODBUS_PORT,
  mqttHost: MQTT_HOST,
  mqttPort: MQTT_PORT,
  taskRates: {
    sensorMonitor: SENSOR_MONITOR_RATE,
    pumpControl: PUMP_CONTROL_RATE
  }
});

try {
  // Create and start the PLC
  const plc = await createTentacle<Mqtts, Sources, Variables>({
    tasks: {
      sensorMonitor: {
        name: "sensor-monitor",
        description: "Monitor sensor data and validate ranges",
        scanRate: SENSOR_MONITOR_RATE,
        program: sensorMonitorTask,
      },
      pumpControl: {
        name: "pump-control",
        description: "Pump control logic with safety interlocks",
        scanRate: PUMP_CONTROL_RATE,
        program: pumpControlTask,
      },
    },
    mqtt: mqtts,
    sources,
    variables,
  });

  logger.info("Starting PLC...");
  plc();

  logger.info("Tentacle PLC started successfully", {
    variables: Object.keys(variables).length,
    variableList: Object.keys(variables),
    tasks: 2,
    taskList: ["sensor-monitor", "pump-control"],
    sources: Object.keys(sources).length,
    modbus: { host: MODBUS_HOST, port: MODBUS_PORT },
    mqtt: { host: MQTT_HOST, port: MQTT_PORT }
  });

  logger.info(`GraphQL interface available at http://localhost:4123`);
  logger.info(`Tentacle UI available at http://localhost:3000`);

  // Log initial connection status
  setTimeout(() => {
    logger.info("=== Initial Connection Status ===");
    logger.info(`Modbus Source: ${MODBUS_HOST}:${MODBUS_PORT}`);
    logger.info(`MQTT Broker: ${MQTT_HOST}:${MQTT_PORT}`);
    logger.info("================================");
  }, 2000);
} catch (error) {
  logger.error("Failed to initialize Tentacle PLC", { error });
  Deno.exit(1);
}

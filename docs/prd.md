# Pump Station Tentacle PLC - Ignition SCADA Integration PRD

## Intro Project Analysis and Context

### Analysis Source
**IDE-based fresh analysis** - Analyzed existing project structure, README, docker-compose.yml, and source code

### Current Project State

The **Pump Station Tentacle PLC** is a complete industrial control system implementing soft PLC functionality using the Tentacle PLC framework. The system currently provides:

**Core Functionality:**
- Real-time sensor monitoring (suction pressure, discharge pressure, flow rate, motor temperature) via Modbus TCP at 100ms scan rate
- Automated pump control logic with safety interlocks (low pressure, high temperature protection) at 500ms scan rate
- State machine-based pump sequencing with fault handling
- Real-time data publishing via MQTT Sparkplug B protocol

**Current Architecture:**
- **Tentacle PLC**: Deno/TypeScript-based soft PLC runtime (v0.0.44) with GraphQL API
- **Modbus Simulator**: Python-based hardware simulator providing realistic sensor waveforms
- **MQTT Communication**: HiveMQ broker handling Sparkplug B protocol messages
- **Monitoring Interface**: React-based Tentacle UI (v0.0.7) with GraphQL subscriptions
- **Orchestration**: Docker Compose managing 4 services with health checks

### Available Documentation Analysis

**Available Documentation:**
- ✅ Tech Stack Documentation - Complete in README
- ✅ Source Tree/Architecture - Clear structure documented
- ✅ API Documentation - GraphQL endpoints documented
- ❌ Coding Standards - Not documented
- ✅ External API Documentation - Modbus and MQTT protocols documented
- ❌ UX/UI Guidelines - Not documented
- ❌ Technical Debt Documentation - Not documented

**Note**: The README provides comprehensive system architecture with Mermaid diagrams, service descriptions, and troubleshooting guides. Sufficient for this enhancement.

### Enhancement Scope Definition

**Enhancement Type:**
- ✅ **Integration with New Systems** (PRIMARY)
- ✅ New Feature Addition (SCADA visualization)

**Enhancement Description:**
Integration of Ignition 8.3 SCADA platform with PostgreSQL database to provide enterprise-grade visualization, historical data trending, and advanced analytics for the pump station control system. This will complement the existing Tentacle UI with production-ready SCADA capabilities while maintaining all existing control functionality unchanged.

**Impact Assessment:**
- ✅ **Moderate Impact** (some existing code changes)
  - Existing Tentacle PLC and control logic remain 100% unchanged
  - Tentacle UI continues to operate as-is
  - MQTT Sparkplug B publishing already implemented - Ignition will subscribe as a client
  - Docker Compose orchestration needs expansion to add 5 new services (Ignition gateway, PostgreSQL, Liquibase, pgAdmin, Traefik)
  - Network configuration requires integration with Traefik proxy
  - No changes to Modbus communication or control tasks required

### Goals and Background Context

**Goals:**
- Enable enterprise-grade SCADA visualization using Ignition Perspective alongside existing Tentacle UI
- Implement historical data trending and analytics using Ignition Historian with PostgreSQL backend
- Provide advanced alarming and event management through Ignition Event Stream
- Maintain 100% compatibility with existing Tentacle PLC control logic, Modbus I/O, and Tentacle UI
- Create foundation for future multi-site SCADA deployments using Sparkplug B architecture
- Use Traefik proxy for local development domain routing
- Include pgAdmin for database management (development/testing environment)

**Background Context:**

The current pump station system is a functional proof-of-concept demonstrating Tentacle PLC capabilities with basic web monitoring via Tentacle UI. The README explicitly identifies "Integrate with Ignition SCADA for full SCADA visualization" as a planned next step.

The system was architecturally designed for this integration - MQTT Sparkplug B is an industry-standard protocol specifically created for SCADA systems like Ignition. All PLC variables are already being published to HiveMQ in the correct format. This enhancement represents the natural evolution from proof-of-concept to production-ready industrial control system, enabling advanced features like historical trending, sophisticated alarming, and enterprise reporting that are critical for industrial operations.

**Key Architectural Decisions:**
- **Traefik Proxy**: Using the Traefik reverse proxy from the Ignition template for subdomain-based local development access
- **pgAdmin Inclusion**: Keeping pgAdmin service for database management in this testing/development project
- **Tentacle UI Preservation**: Maintaining existing Tentacle UI - no deprecation or modification
- **Additive Integration**: All new services are additions; zero modifications to existing main functionality

**Change Log:**

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
| Initial PRD | 2025-10-28 | v0.1 | Ignition SCADA integration planning | PM Agent |

## Requirements

### Functional Requirements

**FR1**: The system shall add Ignition 8.3 gateway as a new MQTT Sparkplug B subscriber to the existing HiveMQ broker without modifying the Tentacle PLC publishing configuration.

**FR2**: The Ignition gateway shall consume all existing Sparkplug B NBIRTH (birth certificate) and NDATA (data update) messages from the `spBv1.0/pump-station/*` topic structure.

**FR3**: The system shall provide a PostgreSQL 16 database service for Ignition Historian and transaction storage.

**FR4**: The Ignition gateway shall include pre-enabled modules: Event Stream, Historian, Perspective, PostgreSQL Driver, Web Development, and OPC UA.

**FR5**: The system shall implement Liquibase database migrations for automated schema version control in the PostgreSQL database.

**FR6**: The system shall provide pgAdmin web interface for database management and query development.

**FR7**: The Ignition gateway shall be accessible via Traefik reverse proxy at `https://ignition83.localtest.me` and direct access at `http://localhost:8088`.

**FR8**: The system shall maintain existing Tentacle UI access at `http://localhost:3000` with no functional changes.

**FR9**: The Ignition gateway shall use the commissioning.json approach to skip interactive setup for automated deployment.

**FR10**: All new services (Ignition, PostgreSQL, Liquibase, pgAdmin, Traefik) shall integrate into the existing Docker Compose orchestration with proper health checks and dependency management.

**FR11**: The Ignition gateway shall operate using the 2-hour resettable trial license mode.

**FR12**: The system shall configure MQTT Engine module to connect to the HiveMQ broker for Sparkplug B message consumption and automatic tag discovery.

**FR13**: The Ignition gateway shall include a "central" tag provider with reference tags derived from Sparkplug B data, supporting UDT-based alarm and history configuration.

**FR14**: The Ignition Perspective project shall include the following initial views:
- **Overview Page**: Dashboard displaying all pump stations (currently 1, scalable for future multi-site deployments)
- **Pump Station Detail Page**: Template-based view using indirect tag path bindings for pump station monitoring
- **Alarms Page**: Real-time and historical alarm display with acknowledgment capability
- **Trends Page**: Historical data trending for sensor and control variables
- **Admin Page**: User management and system administration interface

### Non-Functional Requirements

**NFR1**: The integration shall not modify any existing Tentacle PLC source code, configuration files, or environment variables.

**NFR2**: The existing system performance (100ms sensor scan, 500ms control scan) shall remain unchanged with Ignition running.

**NFR3**: MQTT broker message throughput shall support both existing Tentacle UI subscriptions and new Ignition subscriptions without latency degradation.

**NFR4**: The PostgreSQL database shall be configured with persistent volumes to maintain historical data across container restarts.

**NFR5**: All new services shall include health checks and automatic restart policies consistent with existing services.

**NFR6**: The Ignition gateway shall start with EULA automatically accepted and quickstart disabled for non-interactive deployment.

**NFR7**: The system shall use the Ignition Standard Edition with the specified pre-enabled modules.

**NFR8**: The Traefik proxy shall route subdomain requests while maintaining backward compatibility with existing direct port access patterns.

**NFR9**: Service startup dependencies shall ensure proper initialization order: PostgreSQL → Liquibase → Ignition gateway, and HiveMQ → Tentacle PLC → Ignition (for MQTT).

**NFR10**: Documentation shall be updated to reflect new service access points, credentials, and troubleshooting procedures.

**NFR11**: The 2-hour trial license shall automatically reset upon gateway restart, requiring no manual license management for development/testing purposes.

**NFR12**: Perspective view templates shall be designed for reusability across multiple pump stations using parameterized tag paths.

**NFR13**: All Perspective views shall comply with ISA-101 (IEC 62682) High Performance HMI standards, including neutral gray backgrounds, alarm-by-exception color usage, and simplified schematic graphics.

### Compatibility Requirements

**CR1**: **Existing MQTT Communication Compatibility** - The HiveMQ broker shall continue to serve existing Tentacle PLC publisher and Tentacle UI consumers without configuration changes, while adding Ignition as a new Sparkplug B subscriber.

**CR2**: **Docker Network Compatibility** - All new services shall connect to the existing `sim-network` bridge network, with Ignition and pgAdmin additionally connecting to an external `proxy` network for Traefik routing.

**CR3**: **Environment Variable Compatibility** - Existing `.env` file structure and variables shall remain unchanged; new Ignition-specific variables shall be additive only.

**CR4**: **Port Compatibility** - New services shall use non-conflicting ports: Ignition (8088), PostgreSQL (5432), pgAdmin (via Traefik), Traefik (80/443). Existing ports (3000, 4123, 5020, 8080, 1883, 8081) remain allocated to current services.

**CR5**: **Volume Compatibility** - Existing volume mounts for Tentacle PLC source code and configuration shall remain unchanged. New volume mounts for Ignition projects, PostgreSQL data, and Liquibase migrations shall be isolated to new directory structures.

**CR6**: **Service Naming Compatibility** - Existing service names (`tentacle-plc`, `tentacle-ui`, `modbus-sim`, `hivemq`) shall not be modified. New services use distinct names (`gateway`, `database`, `liquibase`, `pgadmin`, `traefik`).

## User Interface Enhancement Goals

### Integration with Existing UI

The Ignition Perspective interface will complement, not replace, the existing Tentacle UI. Both interfaces will operate simultaneously with the following distinction:

**Tentacle UI (Existing - Preserved)**:
- Continues to provide real-time PLC variable monitoring via GraphQL subscriptions
- Serves as the lightweight, developer-focused debugging interface
- Direct connection to Tentacle PLC GraphQL API (port 4123)
- No changes to functionality, styling, or access patterns

**Ignition Perspective (New - SCADA Focus)**:
- Enterprise-grade SCADA visualization with industrial design patterns
- Advanced features: historical trending, alarm management, user authentication, reporting
- Data sourced exclusively from MQTT Sparkplug B messages (HiveMQ broker)
- Production-ready interface suitable for operations staff and management

**Integration Approach**:
- Both UIs consume the same real-time process data from different sources (GraphQL vs. MQTT)
- No direct communication between the two UI systems required
- Ignition provides capabilities beyond Tentacle UI scope (historian, alarms, multi-user management)
- Users can run both interfaces simultaneously for different use cases

### Modified/New Screens and Views

The Ignition Perspective project will include five core views designed for industrial pump station operations:

#### 1. Overview Page (Home Dashboard)
- **Purpose**: High-level status of all pump stations in the system
- **Current Scope**: Single pump station display, architected for future multi-site expansion
- **Key Components**:
  - Pump station summary cards (name, status, key metrics)
  - Overall system health indicators
  - Navigation to detailed pump station views
  - Critical alarm summary banner
- **Data Bindings**: Tag provider reference tags from `central` provider

#### 2. Pump Station Detail Page
- **Purpose**: Comprehensive real-time monitoring of a single pump station
- **Architecture**: Template-based view with indirect tag path bindings for reusability
- **Key Components**:
  - Sensor displays (suction pressure, discharge pressure, flow rate, motor temperature)
  - Pump control status (running/stopped, fault indicators)
  - Safety interlock status (low pressure, high temperature alarms)
  - Real-time trend sparklines for quick visual reference
  - Manual control interface (if enabled) for start/stop commands
- **Tag Path Pattern**: `[central]{StationPath}/Sensors/*` and `[central]{StationPath}/Controls/*`
- **Scalability**: Single template supports multiple pump stations by passing different tag path parameters

#### 3. Alarms Page
- **Purpose**: Real-time and historical alarm monitoring with acknowledgment
- **Key Components**:
  - Active alarms table with priority, timestamp, source, and status
  - Alarm acknowledgment controls
  - Historical alarm journal with filtering (date range, priority, source)
  - Alarm analytics (frequency charts, mean time to acknowledge)
- **Alarm Configuration**: UDT-based alarms on reference tags (configured in stories or by end users)
- **Data Source**: Ignition Event Stream module with PostgreSQL storage

#### 4. Trends Page
- **Purpose**: Historical data visualization for process analysis
- **Key Components**:
  - Multi-pen trend charts with configurable time ranges
  - Pre-configured trend groups (e.g., "All Sensors", "Pressures Only", "Temperature Monitoring")
  - Date/time range selector (last hour, last 8 hours, last 24 hours, custom)
  - Trend data export capability (CSV/Excel)
  - Y-axis auto-scaling or manual range configuration
- **Data Source**: Ignition Historian with PostgreSQL storage
- **History Configuration**: Tag history enabled on reference tags via UDTs

#### 5. Admin Page
- **Purpose**: User management and system administration
- **Key Components**:
  - User account management (add/edit/deactivate users)
  - Role and permission assignment
  - Audit log viewer (user actions, configuration changes)
  - System health dashboard (gateway status, database connections, MQTT broker connectivity)
  - Gateway backup/restore interface (Perspective project and tag configuration)

### UI Consistency Requirements

**ISA-101 High Performance HMI Compliance**:

The Ignition Perspective interface must adhere to ISA-101 (IEC 62682) High Performance HMI standards for process control applications:

**Situational Awareness Philosophy**:
- **Abnormal Condition Focus**: Displays must emphasize abnormal conditions while minimizing visual clutter during normal operation
- **Information Hierarchy**: Critical process information presented prominently; less important data suppressed or de-emphasized
- **Alarm-by-Exception**: Only display alarms and deviations from normal state; suppress routine status information
- **High Signal-to-Noise Ratio**: Minimize decorative graphics, gradients, 3D effects, and non-essential visual elements

**Visual Design Standards (ISA-101 Level 1 Display)**:
- **Color Usage**:
  - **Gray Background** (neutral): Use medium gray (RGB: 128, 128, 128 or similar) as default background to provide visual rest
  - **Abnormal State Colors** (ANSI/ISA-18.2):
    - Red: Alarm condition requiring immediate action
    - Yellow: Warning condition requiring attention
    - White/Black: Normal operating state (low contrast, non-distracting)
    - Gray: Disabled, unavailable, or not applicable
  - **Avoid Green for Status**: Green should NOT be used for "running" status; use white or neutral color for normal operation
  - **Color Sparsity**: Limit color to abnormal conditions only (target: <20% of screen colored during normal operation)
- **Typography**:
  - Sans-serif fonts (e.g., Arial, Segoe UI) for readability
  - Minimum 12pt for body text, 14pt for critical process values
  - No unnecessary font styling (avoid bold/italic except for emphasis)
- **Graphics and Symbols**:
  - Simplified, schematic representations (no photorealistic or 3D graphics)
  - Process equipment shown as simple geometric shapes
  - Piping and instrumentation diagram (P&ID) style preferred
  - No gradients, shadows, or bevels on components

**Ignition Implementation Standards**:
- **Theme**: Custom light theme with medium gray background (override Ignition defaults)
- **Component Library**: Standard Perspective components styled for ISA-101 compliance
- **Responsive Design**: Views must support desktop (1920x1080 primary) and tablet (1024x768 minimum) resolutions
- **Color Coding**: ANSI/ISA-18.2 alarm colors:
  - Red: Alarm/Critical fault (requires immediate action)
  - Yellow: Warning/Caution (requires attention)
  - White: Normal operating state
  - Gray: Disabled/Unavailable/Not applicable
  - Blue: Selected item (interactive highlight only)
- **Alarm Presentation**: Use flashing/blinking sparingly and only for unacknowledged critical alarms
- **Trend Charts**: Minimize grid lines and decorative elements; focus on data traces

**Navigation Consistency**:
- Primary navigation: Top menu bar with links to all five views
- Breadcrumb navigation on detail pages
- "Home" button always returns to Overview Page
- Consistent header/footer across all views with gateway name and current user display

**Data Display Consistency**:
- Pressure values: Display in PSI with 1 decimal place
- Flow rate: Display in GPM with 1 decimal place
- Temperature: Display in °F with 1 decimal place
- Timestamps: ISO 8601 format with local timezone display
- Boolean states: Text labels ("Running"/"Stopped") instead of True/False

**Accessibility**:
- All status indicators must have text labels in addition to color coding (for colorblind users)
- Minimum font size: 12pt for body text, 10pt for labels
- Touch-friendly controls: Minimum 44x44px tap targets for tablet operation

## Technical Constraints and Integration Requirements

### Existing Technology Stack

**Current Technology Stack:**

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Deno | 2.x | JavaScript/TypeScript runtime for Tentacle PLC |
| **PLC Framework** | Tentacle PLC | v0.0.44 | Soft PLC runtime with task scheduling and I/O management |
| **UI Framework** | React | (via Tentacle UI v0.0.7) | Web-based monitoring interface |
| **API Layer** | GraphQL | (Tentacle built-in) | Real-time data queries and subscriptions |
| **Protocol - I/O** | Modbus TCP | Standard | Industrial I/O communication with simulator |
| **Protocol - SCADA** | MQTT Sparkplug B | v1.0 | Time-series data publishing to SCADA systems |
| **MQTT Broker** | HiveMQ | 4.x (latest) | MQTT message broker with web-based control center |
| **Simulator** | Python (simple-modbus-pump-station-sim) | Custom | Modbus TCP hardware simulator |
| **Container Orchestration** | Docker Compose | Standard | Multi-service deployment and management |
| **Language** | TypeScript | (via Deno) | PLC application code and task logic |

**New Technology Stack (Additive):**

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **SCADA Platform** | Ignition | 8.3.0-rc1 Standard Edition | Enterprise visualization and data management |
| **Database** | PostgreSQL | 16 | Relational database for historian and transactions |
| **Database Migrations** | Liquibase | Latest | Schema version control and automated migrations |
| **Database Admin** | pgAdmin | 4 (latest) | Web-based database management interface |
| **Reverse Proxy** | Traefik | Latest | Subdomain routing and HTTPS termination |

### Integration Approach

#### Database Integration Strategy
- **PostgreSQL Service**: Standalone database container with persistent volume storage
- **Ignition Connection**: Ignition gateway connects to PostgreSQL via internal Docker network (`sim-network`)
- **Database Name**: `postgres` (default database)
- **Authentication**: Username `postgres`, password `P@ssword1!` (development credentials)
- **Historian Storage**: Ignition Historian module stores tag history in PostgreSQL with automatic partitioning
- **Application Storage**: Perspective project configuration, user accounts, and audit logs stored in PostgreSQL
- **Backup Strategy**: Volume-based backups; database migration scripts in version control via Liquibase
- **No Integration with Existing Services**: PostgreSQL is exclusively for Ignition use; Tentacle PLC has no database dependency

#### API Integration Strategy
- **Existing API Preservation**: Tentacle PLC GraphQL API (port 4123) remains unchanged and continues serving Tentacle UI
- **Ignition Data Source**: Ignition does NOT consume the GraphQL API; all data flows through MQTT Sparkplug B
- **MQTT Engine Configuration**: Ignition MQTT Engine module configured to subscribe to HiveMQ broker at `hivemq:1883`
- **Sparkplug B Namespace**: Subscribe to `spBv1.0/pump-station/#` wildcard topic for all pump station messages
- **Tag Auto-Discovery**: MQTT Engine automatically creates MQTT Transmission tags from NBIRTH messages
- **Reference Tags**: Manual creation of reference tags in "central" provider pointing to MQTT Transmission tags
- **UDT Architecture**: User-Defined Types (UDTs) structure reference tags with embedded alarm and history configuration
- **No Data Translation Required**: Sparkplug B protocol provides standard data types and metadata

#### Frontend Integration Strategy
- **Dual UI Architecture**: Tentacle UI and Ignition Perspective run independently and simultaneously
- **Tentacle UI Access**: Remains at `http://localhost:3000` (unchanged)
- **Ignition Perspective Access**:
  - Primary: `https://ignition83.localtest.me` (via Traefik subdomain routing)
  - Direct: `http://localhost:8088` (direct gateway access)
- **No UI Cross-Communication**: The two interfaces do not communicate with each other
- **Shared Data Source**: Both UIs display the same real-time process data via different protocols (GraphQL vs. MQTT)
- **User Segmentation**: Tentacle UI for developers/debugging; Ignition for operations/management
- **Authentication**: Tentacle UI remains unauthenticated; Ignition implements user authentication and role-based access control

#### Testing Integration Strategy
- **Existing Tests Unchanged**: No modifications to existing Tentacle PLC test suite
- **Manual Integration Testing**: Verify MQTT message flow from Tentacle PLC through HiveMQ to Ignition
- **Ignition Testing Approach**:
  - Designer testing: Verify tag bindings and view functionality in Ignition Designer
  - Runtime testing: Validate data updates, alarms, and historian in Perspective sessions
  - Database testing: Verify PostgreSQL schema migrations via Liquibase
- **No Automated Tests for Ignition**: Ignition projects tested manually through Designer and gateway runtime
- **Simulator-Based Testing**: Use existing Modbus simulator for end-to-end system validation

### Code Organization and Standards

#### File Structure Approach
```
pump-station-tentacle-plc/
├── src/                          # Existing Tentacle PLC code (UNCHANGED)
│   ├── main.ts
│   ├── tasks/
│   ├── variables/
│   └── utils/
├── services/                      # NEW: Ignition and database configuration
│   ├── ignition/
│   │   ├── config/               # Gateway configuration files
│   │   ├── projects/             # Perspective project files
│   │   └── commissioning.json    # Skip commissioning file
│   ├── postgres/
│   │   ├── liquibase/            # Database migration changesets
│   │   │   ├── main.yaml
│   │   │   └── liquibase.docker.properties
│   │   ├── tables/               # Table definition SQL files
│   │   ├── simulated-data/       # Test data (if needed)
│   │   └── init-sql/             # Database initialization scripts
│   └── pgadmin/
│       └── servers.json          # pgAdmin server configuration
├── shared/                        # NEW: Shared resources (git submodule)
│   └── gateway-utilities/        # Gateway utilities project (from template)
├── scripts/                       # NEW: Utility scripts
│   └── wait-for-it.sh            # Container startup coordination script
├── docker-compose.yml            # MODIFIED: Add new services
├── .env                          # MODIFIED: Add new environment variables
└── README.md                     # MODIFIED: Document new services
```

#### Naming Conventions
- **Docker Services**: Descriptive lowercase names (`gateway`, `database`, `liquibase`, `pgadmin`, `traefik`)
- **Network Names**: `sim-network` (existing), `proxy` (new external network for Traefik)
- **Volume Names**: Follow pattern `<service>-<purpose>` (e.g., `postgres-data`, `ignition-projects`)
- **Ignition Resources**: Follow Ignition conventions (PascalCase for views, camelCase for properties)
- **Tag Provider Name**: `central` (lowercase, single word for simplicity)
- **UDT Names**: PascalCase (e.g., `PumpStation`, `SensorGroup`)

#### Coding Standards
- **Tentacle PLC Code**: Existing TypeScript standards remain unchanged (no new PLC code required)
- **Liquibase Migrations**: YAML-based changesets with semantic versioning
- **Ignition Projects**: Use Perspective native components; avoid custom scripts unless necessary
- **SQL Standards**: PostgreSQL standard SQL; use lowercase table/column names with underscores
- **Configuration Files**: YAML or JSON format; use comments for non-obvious settings

#### Documentation Standards
- **README Updates**: Document all new services, access points, credentials, and troubleshooting
- **Inline Comments**: Liquibase changesets include purpose comments
- **Ignition Documentation**: Use Ignition Designer's built-in description fields for views and tags
- **Architecture Diagrams**: Update existing Mermaid diagram to include Ignition, PostgreSQL, and Traefik

### Deployment and Operations

#### Build Process Integration
- **No Build Required**: Ignition gateway uses pre-built Docker image from Inductive Automation
- **Tentacle PLC Build**: Existing Deno-based build process unchanged
- **Database Schema**: Liquibase runs migrations automatically on container startup
- **Project Deployment**: Ignition projects deployed via volume mounts (hot-reload in local-dev mode)

#### Deployment Strategy
- **Single-Command Startup**: `docker compose up -d` starts entire system (existing + new services)
- **Service Dependencies**: Docker Compose `depends_on` ensures proper startup order
- **Health Checks**: All services include health check definitions for automated restart
- **Volume Persistence**: Critical data (PostgreSQL database, Ignition projects) stored in Docker volumes
- **Development Mode**: Ignition runs with `-Dignition.config.mode=local-dev` for hot-reload capability

#### Monitoring and Logging
- **Existing Logging**: Tentacle PLC logs remain unchanged (Docker logs via `docker compose logs tentacle-plc`)
- **Ignition Logging**: Gateway logs available via Ignition web interface and Docker logs
- **PostgreSQL Logging**: Database logs available via `docker compose logs database`
- **HiveMQ Monitoring**: Existing HiveMQ Control Center (port 8081) monitors MQTT traffic from both Tentacle and Ignition
- **Traefik Dashboard**: Traefik provides request routing visualization (if enabled)

#### Configuration Management
- **Environment Variables**: New variables added to `.env` file (database credentials, Ignition settings)
- **Secrets Management**: Development credentials hardcoded; production deployment would use Docker secrets or external vault
- **Ignition Configuration**: Gateway configuration files mounted from `services/ignition/config/`
- **Database Configuration**: Connection settings in Liquibase properties file and Ignition gateway config
- **Network Configuration**: Traefik routing rules defined in Docker Compose labels

### Risk Assessment and Mitigation

#### Technical Risks
1. **MQTT Message Volume**: Ignition subscribing to all Sparkplug B messages may increase HiveMQ load
   - **Mitigation**: HiveMQ is enterprise-grade and designed for this use case; monitor broker metrics via Control Center
2. **Ignition Trial License Reset**: 2-hour trial requires gateway restart every 2 hours
   - **Mitigation**: Document restart procedure; consider upgrade to Maker Edition for longer sessions
3. **PostgreSQL Resource Usage**: Database may consume significant memory for historian storage
   - **Mitigation**: Configure historian pruning policies; monitor database size via pgAdmin
4. **Traefik External Network**: Requires manual network creation before `docker compose up`
   - **Mitigation**: Document network creation step in README; provide setup script

#### Integration Risks
1. **Sparkplug B Tag Mapping**: MQTT Engine auto-discovery may create unexpected tag structures
   - **Mitigation**: Manually verify tag structure after first connection; document tag path patterns
2. **Network Isolation**: Proxy network and sim-network must be configured correctly for dual connectivity
   - **Mitigation**: Test connectivity from Ignition to HiveMQ; validate Traefik routing to gateway
3. **Startup Race Conditions**: Services may fail if dependencies aren't ready
   - **Mitigation**: Use `wait-for-it.sh` script for Liquibase; Docker health checks for all services

#### Deployment Risks
1. **Port Conflicts**: New ports (8088, 5432) may conflict with existing system services
   - **Mitigation**: Document port usage; provide troubleshooting steps in README
2. **Volume Permissions**: PostgreSQL volume may have permission issues on some host systems
   - **Mitigation**: Document permission requirements; use named volumes instead of bind mounts
3. **Submodule Initialization**: Gateway utilities submodule requires manual initialization
   - **Mitigation**: Document `git submodule update --init --recursive` step in setup instructions

#### Mitigation Strategies
- **Comprehensive Documentation**: Update README with step-by-step setup, troubleshooting, and service access
- **Health Checks**: All services include health checks for automatic restart on failure
- **Incremental Deployment**: Enable testing of each service independently before full integration
- **Rollback Plan**: Existing system continues to function even if Ignition services fail to start
- **Monitoring Integration**: Use HiveMQ Control Center to validate MQTT message flow from Tentacle to Ignition

## Epic and Story Structure

### Epic Approach

**Epic Structure Decision**: **Single Comprehensive Epic** with rationale:

This enhancement is structured as a single epic titled "Ignition SCADA Integration" because:
1. **Unified Goal**: All work contributes to a single cohesive objective - adding Ignition SCADA visualization to the existing pump station system
2. **Sequential Dependencies**: Stories build upon each other in a logical progression (infrastructure → configuration → UI development)
3. **Brownfield Best Practice**: For integrations with existing systems, maintaining a single epic ensures proper tracking of all changes that could impact the running system
4. **Clear Scope Boundary**: The integration is clearly bounded - it's "add Ignition SCADA" not "add Ignition plus refactor Tentacle plus redesign simulator"
5. **Testing Cohesion**: Integration verification is easier when all stories are grouped under a single epic milestone

The epic includes 8 stories sequenced to minimize risk to the existing operational system. Each story is independently testable and delivers incremental value while maintaining system integrity.

## Epic 1: Ignition SCADA Integration

**Epic Goal**: Integrate Ignition 8.3 SCADA platform with PostgreSQL database to provide enterprise-grade visualization, historical trending, and alarm management for the pump station control system, while maintaining 100% compatibility with existing Tentacle PLC control logic and Tentacle UI.

**Integration Requirements**:
- Zero modifications to existing Tentacle PLC source code or configuration
- Additive-only changes to Docker Compose orchestration
- MQTT Sparkplug B as the exclusive data integration point
- Dual UI architecture (Tentacle UI + Ignition Perspective) operating simultaneously
- PostgreSQL-backed historian and alarm storage
- Traefik reverse proxy for subdomain-based access

---

### Story 1.1: Infrastructure Setup - Docker Compose and Network Configuration

As a **DevOps Engineer**,
I want **to extend the Docker Compose configuration with Ignition, PostgreSQL, Traefik, and supporting services**,
so that **the infrastructure foundation is in place for SCADA integration without disrupting existing services**.

#### Acceptance Criteria
1. Docker Compose file includes five new service definitions: `gateway`, `database`, `liquibase`, `pgadmin`, and `traefik`
2. Traefik external `proxy` network is created and documented in README
3. New services connect to both `sim-network` (existing) and `proxy` (new) networks as appropriate
4. All existing services (`tentacle-plc`, `tentacle-ui`, `modbus-sim`, `hivemq`) remain unchanged in configuration
5. New environment variables added to `.env` file for database credentials and Ignition settings
6. Service dependencies properly configured: `database` before `liquibase` and `gateway`, `hivemq` before `gateway`
7. Port mappings configured: Ignition (8088), PostgreSQL (5432), Traefik (80, 443)
8. Health checks defined for `gateway` and `database` services
9. Volume mounts configured for Ignition projects, configuration, and PostgreSQL data persistence

#### Integration Verification
**IV1**: Existing system functionality verification - Run `docker compose up -d` and verify all four original services (tentacle-plc, tentacle-ui, modbus-sim, hivemq) start successfully and remain accessible at their original ports
**IV2**: Integration point verification - Verify new services start without errors: `docker compose ps` shows all services as "running" or "healthy"
**IV3**: Performance impact verification - Confirm Tentacle PLC continues 100ms/500ms scan rates by checking GraphQL real-time data updates at `http://localhost:4123/graphql`

---

### Story 1.2: Directory Structure and Configuration Files

As a **DevOps Engineer**,
I want **to create the directory structure and configuration files for Ignition, PostgreSQL, and Liquibase**,
so that **the services have proper configuration and persistent storage locations**.

#### Acceptance Criteria
1. Directory structure created matching the file organization standard: `services/ignition/`, `services/postgres/`, `services/pgadmin/`, `shared/`, `scripts/`
2. `wait-for-it.sh` script added to `scripts/` directory with executable permissions
3. Git submodule initialized for `shared/gateway-utilities/` project from Ignition template repository
4. `services/ignition/commissioning.json` file created to skip interactive gateway setup
5. `services/postgres/liquibase/` directory created with `liquibase.docker.properties` configuration file
6. `services/postgres/liquibase/main.yaml` changelog file created (initially empty or minimal)
7. `services/pgadmin/servers.json` configuration file created with PostgreSQL connection definition
8. `.gitignore` updated to exclude Ignition gateway runtime data and PostgreSQL volumes (but include configuration files)
9. All configuration files use development credentials: PostgreSQL (`postgres`/`P@ssword1!`), pgAdmin (`admin@admin.com`/`root`)

#### Integration Verification
**IV1**: Existing system functionality verification - Verify no changes to `src/` directory or existing Tentacle PLC configuration files
**IV2**: Integration point verification - Run `docker compose up -d` and verify Liquibase completes migrations successfully (exits with code 0)
**IV3**: Performance impact verification - Confirm Docker volumes are created and persist data across container restarts (`docker compose down && docker compose up -d`)

---

### Story 1.3: Ignition Gateway Initial Startup and MQTT Engine Configuration

As a **SCADA Engineer**,
I want **to configure the Ignition gateway to connect to the HiveMQ broker and receive Sparkplug B messages**,
so that **Ignition can automatically discover PLC tags from MQTT Transmission data**.

#### Acceptance Criteria
1. Ignition gateway accessible at `https://ignition83.localtest.me` (Traefik) and `http://localhost:8088` (direct)
2. Gateway operating in 2-hour resettable trial license mode
3. MQTT Engine module enabled and configured to connect to `hivemq:1883`
4. MQTT Engine connected to HiveMQ broker (verify via MQTT Engine status page in gateway)
5. MQTT Engine subscribed to `spBv1.0/pump-station/#` wildcard topic
6. MQTT Transmission tags automatically created in default tag provider from Sparkplug B NBIRTH messages
7. Verify MQTT Transmission tags update in real-time by monitoring Tentacle PLC sensor values
8. HiveMQ Control Center (`http://localhost:8081`) shows Ignition as a connected client alongside Tentacle PLC
9. PostgreSQL connection configured in Ignition gateway with test connection successful

#### Integration Verification
**IV1**: Existing system functionality verification - Verify Tentacle UI continues to display real-time data at `http://localhost:3000` without interruption
**IV2**: Integration point verification - Use HiveMQ Control Center to verify MQTT message flow: Tentacle PLC publishes, Ignition subscribes
**IV3**: Performance impact verification - Monitor HiveMQ broker metrics to confirm message throughput supports both Tentacle UI and Ignition clients without latency increase

---

### Story 1.4: Tag Provider Setup - Central Provider with UDTs and Reference Tags

As a **SCADA Engineer**,
I want **to create the "central" tag provider with UDT definitions and reference tags pointing to MQTT Transmission data**,
so that **we have a structured tag hierarchy with alarm and history configuration capabilities**.

#### Acceptance Criteria
1. "central" tag provider created in Ignition Designer (Memory Tag Provider type)
2. UDT definition "PumpStation" created with structure matching Tentacle PLC variable organization:
   - Sensors folder: SuctionPressure, DischargePressure, FlowRate, MotorTemperature
   - Controls folder: PumpRunning, LocalStopButton, LocalStartButton, HighTempAlarm
   - Setpoints folder: TempAlarmSetpoint, MinSuctionPressureSetpoint
3. UDT instance "PumpStation_01" instantiated in `central` tag provider
4. Reference tags within UDT configured to point to corresponding MQTT Transmission tags (e.g., `[central]PumpStation_01/Sensors/SuctionPressure` → `[default]MQTT Engine/.../SuctionPressure`)
5. Tag data types verified to match PLC variable types (Float64 for analog, Boolean for digital)
6. Real-time tag value updates verified by comparing `central` reference tags to MQTT Transmission source tags
7. UDT exported as JSON file and saved to `services/ignition/config/` for version control

#### Integration Verification
**IV1**: Existing system functionality verification - Verify Tentacle PLC continues publishing MQTT messages unchanged (check HiveMQ Control Center message counts)
**IV2**: Integration point verification - Verify reference tags in `central` provider show identical values to MQTT Transmission tags with <1 second latency
**IV3**: Performance impact verification - Confirm tag count in Ignition (Designer → Tag Browser) matches expected count (10-12 tags for single pump station)

---

### Story 1.5: Historian Configuration and Database Storage

As a **SCADA Engineer**,
I want **to enable tag history on the central provider reference tags with PostgreSQL storage**,
so that **historical data is available for trending and analytics**.

#### Acceptance Criteria
1. Ignition Historian module configured to use PostgreSQL database connection
2. History provider "PostgreSQL_Historian" created and set as default
3. Tag history enabled on all sensor tags in `central` provider UDT (SuctionPressure, DischargePressure, FlowRate, MotorTemperature)
4. History sample mode configured as "On Change" with 60-second max time between samples
5. History deadband configured to match Tentacle PLC analog resolution (0.1 for all sensors)
6. Database partitioning configured for 1-day partitions with 30-day retention policy
7. Verify historical data is being stored by querying PostgreSQL via pgAdmin (`http://localhost:8081` → pgAdmin)
8. Tag History Binding tested in Designer (create test component showing last 1 hour of data)
9. Historian pruning/maintenance scheduled task configured

#### Integration Verification
**IV1**: Existing system functionality verification - Verify Tentacle PLC scan rates and memory usage remain stable (no performance degradation)
**IV2**: Integration point verification - Verify PostgreSQL database size increases over time (check via pgAdmin) and partitions are created daily
**IV3**: Performance impact verification - Confirm historian storage rate matches expected data volume (~4 tags × 60 samples/minute × 8 bytes = ~2KB/min)

---

### Story 1.6: Alarm Configuration with Event Stream

As a **SCADA Engineer**,
I want **to configure alarms on critical process values using Ignition Event Stream module**,
so that **operators receive real-time notifications of abnormal pump station conditions**.

#### Acceptance Criteria
1. High Temperature Alarm configured on `[central]PumpStation_01/Sensors/MotorTemperature`
   - Alarm threshold: Greater than `TempAlarmSetpoint` (default 145°F)
   - Priority: High (level 2)
   - Display path: "Pump Station 01 / Motor Temperature High"
2. Low Suction Pressure Alarm configured on `[central]PumpStation_01/Sensors/SuctionPressure`
   - Alarm threshold: Less than `MinSuctionPressureSetpoint` (default 5 PSI)
   - Priority: Critical (level 1)
   - Display path: "Pump Station 01 / Suction Pressure Low"
3. Pump Fault Alarm configured on `[central]PumpStation_01/Controls/HighTempAlarm`
   - Alarm threshold: Equals True
   - Priority: High (level 2)
   - Display path: "Pump Station 01 / Pump Fault"
4. Alarm journal storage configured to use PostgreSQL database
5. Alarm notification pipeline created (Gateway → Event Stream → PostgreSQL)
6. Test alarms by triggering conditions via Modbus simulator and verifying alarm activation
7. Verify alarm acknowledgment workflow functions correctly
8. Alarm shelving configuration set (allow operators to shelve alarms for 1-4 hours)

#### Integration Verification
**IV1**: Existing system functionality verification - Verify Tentacle PLC internal alarm logic (HighTempAlarm variable) continues to operate independently of Ignition alarms
**IV2**: Integration point verification - Trigger alarm condition, verify alarm appears in gateway alarm status table and PostgreSQL alarm journal
**IV3**: Performance impact verification - Confirm alarm evaluation does not impact tag update rate (verify via Tag Diagnostics in Designer)

---

### Story 1.7: Perspective Project - Core Views Development

As a **HMI Developer**,
I want **to create the five core Perspective views (Overview, Detail, Alarms, Trends, Admin)**,
so that **operators have a functional SCADA interface for monitoring and controlling the pump station**.

#### Acceptance Criteria
1. Perspective project "PumpStationSCADA" created and set as default for Perspective sessions
2. **ISA-101 Theme Configuration**:
   - Custom theme created with medium gray background (RGB: 128, 128, 128)
   - Default component styles updated to use neutral colors for normal states
   - Alarm colors configured per ANSI/ISA-18.2 (red=alarm, yellow=warning, white=normal)
3. **Overview Page** view created with:
   - Medium gray background per ISA-101 standards
   - Single pump station summary card with simplified schematic representation
   - Sensor values displayed in white during normal operation, yellow/red during abnormal conditions
   - Navigation button linking to Detail Page
   - Active alarm count badge (only visible when alarms exist - alarm-by-exception)
   - Minimal header with gateway name and current timestamp
4. **Pump Station Detail Page** view created with:
   - Simplified P&ID-style schematic of pump system (no 3D graphics or gradients)
   - Four sensor value displays with units and ISA-101 compliant color coding (white=normal, yellow=warning, red=alarm)
   - Pump running status indicator using white for normal operation (NOT green), red for stopped/faulted
   - Minimal real-time trend sparklines (last 5 minutes) with reduced grid lines
   - Indirect binding setup using view parameters for tag path (e.g., `{StationPath}` parameter)
   - Safety interlock status indicators (only highlighted when active - alarm-by-exception)
5. **Alarms Page** view created with:
   - Alarm Status Table component with clean, high-contrast design
   - Columns: Priority (color-coded), Timestamp, Source, Display Path, Status
   - Acknowledgment button for selected alarms
   - Filter dropdowns (priority, acknowledged status)
   - Flash/blink animation only for unacknowledged critical alarms
6. **Trends Page** view created with:
   - Power Chart component with 4 pens (all sensors)
   - Minimal chart styling (reduced grid lines, no background gradients)
   - Time range selector dropdown (1 hour, 8 hours, 24 hours, custom)
   - Legend with high-contrast colors for data traces
7. **Admin Page** view created with:
   - User Source Users Table component for user management
   - Gateway status display (version, uptime, license type)
   - Link to native Ignition Config page
8. Navigation menu created with links to all five views (top horizontal menu bar, minimal styling)
9. **ISA-101 Compliance Verification**:
   - Color sparsity test: <20% of Overview screen uses color during normal operation
   - Abnormal condition test: Trigger alarm, verify immediate visual prominence
   - Situational awareness test: User can identify abnormal conditions within 3 seconds

#### Integration Verification
**IV1**: Existing system functionality verification - Verify Tentacle UI remains accessible and functional during Perspective session creation and testing
**IV2**: Integration point verification - Open Perspective session, verify all views load without errors and display real-time data from `central` tag provider
**IV3**: Performance impact verification - Test with multiple concurrent Perspective sessions (2-3 browsers) to verify gateway and database can handle load

---

### Story 1.8: Documentation Updates and System Integration Testing

As a **DevOps Engineer**,
I want **to update the README with Ignition service documentation and perform end-to-end integration testing**,
so that **the system is fully documented and verified for operational readiness**.

#### Acceptance Criteria
1. README updated with new "System Architecture" Mermaid diagram including Ignition, PostgreSQL, and Traefik
2. README "Services" section updated with entries for all five new services (gateway, database, liquibase, pgadmin, traefik)
3. README "Service Ports" table updated with new port mappings
4. README "Quick Start" section updated with Traefik network creation prerequisite: `docker network create proxy`
5. README "Access Services" section updated with Ignition gateway URLs and credentials
6. README "Troubleshooting" section expanded with Ignition-specific issues:
   - Ignition 2-hour trial reset procedure
   - MQTT Engine connection troubleshooting
   - PostgreSQL connection issues
   - Traefik subdomain access problems
7. README "Known Limitations" section added documenting technical debt and constraints:
   - Ignition 2-hour trial license requires gateway restart every 2 hours for continued operation
   - Development credentials hardcoded in configuration files (PostgreSQL: `postgres`/`P@ssword1!`, pgAdmin: `admin@admin.com`/`root`) - not suitable for production use
   - Manual testing only for Ignition Perspective views and tag configuration (no automated UI tests)
   - Traefik `proxy` network requires manual creation before first startup (`docker network create proxy`)
   - Git submodule initialization required for `shared/gateway-utilities/` (`git submodule update --init --recursive`)
   - pgAdmin accessible via Traefik subdomain only (no direct port mapping) - requires Traefik to be running
8. End-to-end integration test executed:
   - Step 1: Fresh clone of repository
   - Step 2: `docker compose down && docker compose up -d` (clean startup)
   - Step 3: Verify all 9 services start successfully
   - Step 4: Access Tentacle UI, verify pump control operates correctly
   - Step 5: Access Ignition Perspective, verify all views display real-time data
   - Step 6: Trigger alarm condition, verify alarm appears in Perspective Alarms page
   - Step 7: View historical trend, verify data from historian displays correctly
9. "Next Steps" section updated to reflect completed Ignition integration

#### Integration Verification
**IV1**: Existing system functionality verification - Perform full regression test of Tentacle PLC control system (sensor monitoring, pump sequencing, safety interlocks) while Ignition is running
**IV2**: Integration point verification - Verify dual UI architecture: simultaneous access to Tentacle UI and Ignition Perspective showing identical real-time data
**IV3**: Performance impact verification - Monitor Docker resource usage (CPU, memory) with all services running; document baseline metrics for future comparison


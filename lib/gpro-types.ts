// ─── Raw MySQL row types ─────────────────────────────────────────────────────

export interface EstadoPilotoRow {
  ep_idm: number;
  ep_oa: number;
  ep_agre: number;
  ep_carisma: number;
  ep_concentracion: number;
  ep_experiencia: number;
  ep_motivacion: number;
  ep_reputacion: number;
  ep_resistencia: number;
  ep_talento: number;
  ep_con_tecnico: number;
  ep_peso: number;
}

export interface EstadoAutoRow {
  ea_idm: number;
  ea_chasis_lvl: number;
  ea_chasis_desg: number;
  ea_motor_lvl: number;
  ea_motor_desg: number;
  ea_ad_lvl: number;
  ea_ad_desg: number;
  ea_at_lvl: number;
  ea_at_desg: number;
  ea_fp_lvl: number;
  ea_fp_desg: number;
  ea_pont_lvl: number;
  ea_pont_desg: number;
  ea_refri_lvl: number;
  ea_refri_desg: number;
  ea_caja_lvl: number;
  ea_caja_desg: number;
  ea_freno_lvl: number;
  ea_freno_desg: number;
  ea_susp_lvl: number;
  ea_susp_desg: number;
  ea_elec_lvl: number;
  ea_elec_desg: number;
}

export interface UsuarioRow {
  usr_id: number;
  usr_nick: string;
  usr_nombre: string;
  usr_apellido: string;
  usr_suporter: number;
  usr_idm: number;
}

export interface RaceAnalysisRow {
  IDM: number;
  temporada: number;
  carrera: number;
  jsonstr: string;
}

export interface EstadoStaffRow {
  es_idm: number;
  es_estress: number;
  es_concentracion: number;
}

export interface DriProfileRow {
  IDM: number;
  temporada: number;
  carrera: number;
  jsonstr: string;
}

export interface StandingsRow {
  IDM: number;
  temporada: number;
  carrera: number;
  jsonstr: string;
}

export interface TrackRow {
  id: number;
  name: string;
  natCode: string;
  kms: number;
  laps: number;
  lapDistance: number;
  power: number;
  handl: number;
  accel: number;
  category: number;
  gpsHeld: number;
  // from tracks_profiles (LEFT JOIN — nullable)
  avgSpeed: number | null;
  nbTurns: number | null;
  timeInOutPits: number | null;
  downforce: number | null;
  overtaking: number | null;
  suspRigidity: number | null;
  fuelConsumption: number | null;
  tyreWear: number | null;
  gripLevel: number | null;
}

export interface SeasonRow {
  temporada: number;
}

// ─── Embedded JSON structure types ──────────────────────────────────────────

export interface RaceJsonCarPart {
  lvl: number;
  startWear: number;
  finishWear: number;
}

export interface RaceJsonLap {
  idx: number;
  lapTime: string;
  pos: number;
  tyres: string;
  weather: string;
  temp: number;
  hum: number;
  boostLap: boolean;
  events: unknown[];
}

export interface RaceJsonPit {
  idx: number;
  lap: number;
  reason: string;
  tyreCond: number;
  fuelLeft: number;
  refilledTo: number;
  pitTime: number;
}

export interface RaceJsonTransaction {
  desc: string;
  amount: number;
}

export interface DriverInfo {
  name?: string;
  OA?: number;
  con?: number;
  tal?: number;
  exp?: number;
  agr?: number;
  tei?: number;
  sta?: number;
  cha?: number;
  mot?: number;
  rep?: number;
}

export interface RaceJson {
  trackName: string;
  trackId: number;
  trackNatCode: string;
  trackCountry: string;
  group: string;
  q1Time: string;
  q1Pos: number;
  q2Time: string;
  q2Pos: number;
  q1Risk: number;
  q2Risk: number;
  startRisk: number;
  overtakeRisk: number;
  defendRisk: number;
  driver: DriverInfo;
  driverChanges: DriverInfo;
  setupsUsed: Record<string, string | number | null>[];
  weather: Record<string, string | number | null>;
  laps: RaceJsonLap[];
  pits: RaceJsonPit[];
  chassis: RaceJsonCarPart;
  engine: RaceJsonCarPart;
  FWing: RaceJsonCarPart;
  RWing: RaceJsonCarPart;
  underbody: RaceJsonCarPart;
  sidepods: RaceJsonCarPart;
  cooling: RaceJsonCarPart;
  gear: RaceJsonCarPart;
  brakes: RaceJsonCarPart;
  susp: RaceJsonCarPart;
  electronics: RaceJsonCarPart;
  transactions: RaceJsonTransaction[];
  startFuel: number;
  finishTyres: string;
  finishFuel: number;
  otAttempts: number;
  overtakes: number;
  otAttemptsOnYou: number;
  overtakesOnYou: number;
  currentBalance: number;
  carPower: number;
  carHandl: number;
  carAccel: number;
  q1Energy: number;
  q2Energy: number;
  raceEnergy: number;
  problems: unknown[];
  tyreSupplier: string;
}

export interface DriProfileJson {
  overall: number;
  concentration: number;
  talent: number;
  aggressiveness: number;
  experience: number;
  techInsight: number;
  stamina: number;
  charisma: number;
  motivation: number;
  reputation: number;
  weight: number;
  age: number;
  driName: string;
}

// ─── API response types (shape returned to the client) ──────────────────────

export interface CarPartResponse {
  lvl: number;
  wear: number;
}

export interface DashboardSummaryResponse {
  pilot: {
    oa: number;
    aggressiveness: number;
    charisma: number;
    concentration: number;
    experience: number;
    motivation: number;
    reputation: number;
    stamina: number;
    talent: number;
    techInsight: number;
    weight: number;
  } | null;
  car: {
    chassis: CarPartResponse;
    engine: CarPartResponse;
    fWing: CarPartResponse;
    rWing: CarPartResponse;
    underbody: CarPartResponse;
    sidepods: CarPartResponse;
    cooling: CarPartResponse;
    gear: CarPartResponse;
    brakes: CarPartResponse;
    susp: CarPartResponse;
    electronics: CarPartResponse;
  } | null;
  user: {
    nick: string;
    name: string;
    supporter: number;
  } | null;
  latestSeason: number;
  latestRace: {
    carrera: number;
    trackName: string;
    group: string;
    finishPos: number | null;
    q1Pos: number;
    balance: number;
  } | null;
  totalRaces: number;
  staff: {
    stress: number;
    concentration: number;
  } | null;
}

export interface LapResponse {
  idx: number;
  lapTime: string;
  pos: number;
  tyres: string;
  weather: string;
  temp: number;
  hum: number;
  boostLap: boolean;
  events: unknown[];
}

export interface PitResponse {
  idx: number;
  lap: number;
  reason: string;
  tyreCond: number;
  fuelLeft: number;
  refilledTo: number;
  pitTime: number;
}

export interface TransactionResponse {
  desc: string;
  amount: number;
}

export interface RaceDetailResponse {
  trackName: string;
  trackId: number;
  trackNatCode: string;
  trackCountry: string;
  group: string;
  q1Time: string;
  q1Pos: number;
  q2Time: string;
  q2Pos: number;
  q1Risk: number;
  q2Risk: number;
  startRisk: number;
  overtakeRisk: number;
  defendRisk: number;
  driver: DriverInfo;
  driverChanges: DriverInfo;
  setupsUsed: Record<string, string | number | null>[];
  weather: Record<string, string | number | null>;
  laps: LapResponse[];
  pits: PitResponse[];
  carParts: {
    chassis: RaceJsonCarPart;
    engine: RaceJsonCarPart;
    fWing: RaceJsonCarPart;
    rWing: RaceJsonCarPart;
    underbody: RaceJsonCarPart;
    sidepods: RaceJsonCarPart;
    cooling: RaceJsonCarPart;
    gear: RaceJsonCarPart;
    brakes: RaceJsonCarPart;
    susp: RaceJsonCarPart;
    electronics: RaceJsonCarPart;
  };
  transactions: TransactionResponse[];
  startFuel: number;
  finishTyres: string;
  finishFuel: number;
  otAttempts: number;
  overtakes: number;
  otAttemptsOnYou: number;
  overtakesOnYou: number;
  currentBalance: number;
  carPower: number;
  carHandl: number;
  carAccel: number;
  q1Energy: number;
  q2Energy: number;
  raceEnergy: number;
  problems: unknown[];
}

export interface PilotEvolutionPoint {
  temporada: number;
  carrera: number;
  label: string;
  overall: number;
  concentration: number;
  talent: number;
  aggressiveness: number;
  experience: number;
  techInsight: number;
  stamina: number;
  charisma: number;
  motivation: number;
  reputation: number;
  weight: number;
  age: number;
  name: string;
}

export interface VehiclePartResponse {
  label: string;
  lvl: number;
  startWear: number;
  finishWear: number;
}

export interface VehicleRacePoint {
  temporada: number;
  carrera: number;
  label: string;
  trackName: string;
  parts: Record<string, VehiclePartResponse>;
}

export interface StandingEntry {
  IDM?: number;
  manId?: number;
  managerId?: number;
  pos?: number;
  position?: number;
  pts?: number;
  points?: number;
  name?: string;
}

export interface StandingsPoint {
  temporada: number;
  carrera: number;
  standings: Record<string, unknown>;
}

export interface TrackPerformancePoint {
  temporada: number;
  carrera: number;
  q1Pos: number | null;
  q2Pos: number | null;
  finishPos: number | null;
  carPower: number | null;
  carHandl: number | null;
  carAccel: number | null;
}

export interface TrackPerformanceResponse {
  track: {
    id: number;
    name: string;
    natCode: string;
    power: number;
    handl: number;
    accel: number;
  } | null;
  races: TrackPerformancePoint[];
}

export interface RaceSummary {
  temporada: number;
  carrera: number;
  trackName: string;
  trackId: number;
  trackNatCode: string;
  group: string;
  q1Time: string;
  q1Pos: number;
  q2Time: string;
  q2Pos: number;
  finishPos: number | null;
  totalLaps: number;
  pits: number;
  weather: string;
  startFuel: number;
  tyreSupplier: string;
}

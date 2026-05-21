export interface GetTokenRequest {
  qrcode?: string;
  username?: string;
  password?: string;
}

export interface GetTokenResponse {
  success: boolean;
  msg: string;
  token: string;
  isMachine: boolean;
}

export interface TokenRegRequest {
  username: string;
  password: string;
  cf_token: string;
}

export interface TokenRegResponse {
  success: boolean;
  msg: string;
  token: string;
}

export interface TokenBindRequest {
  token: string;
  username: string;
  old_password?: string;
  new_password: string;
}

export interface TokenBindResponse {
  success: boolean;
  msg: string;
}

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  token?: string;
  expires_at?: string;
  expired?: boolean;
}

export interface TokenLogoutRequest {
  token: string;
}

export interface TokenLogoutResponse {
  success: boolean;
  msg: string;
}

export interface AimeDBRegRequest {
  token: string;
}

export interface AimeDBRegResponse {
  success: boolean;
  msg: string;
  accessCode: string;
}

export interface AimeDBRegTempRequest {
  token: string;
}

export interface AimeDBRegTempResponse {
  success: boolean;
  msg: string;
  accessCode: string;
}

export interface AimeDBRegTokenRequest {
  SGWCMAID: string;
  clientId: string;
  token: string;
  cf_token: string;
}

export interface AimeDBRegTokenResponse {
  success: boolean;
  msg: string;
}

export interface ForwardAddRequest {
  token: string;
  rule: string;
  enable: boolean;
  value: string;
  clientId?: string;
  clientPwd?: string;
}

export interface ForwardAddResponse {
  success: boolean;
  msg: string;
}

export interface ForwardDelRequest {
  token: string;
  rule: string;
  clientId?: string;
  clientPwd?: string;
}

export interface ForwardDelResponse {
  success: boolean;
  msg: string;
  forwardData: ForwardRulesUser;
}

export interface ForwardGetRequest {
  token: string;
  clientId?: string;
  clientPwd?: string;
}

export interface ForwardGetResponse {
  success: boolean;
  msg: string;
  forwardData: ForwardRulesUser;
}

export interface ForwardRulesUser {
  [key: string]: {
    enable: boolean;
    value: string;
  };
}

export interface PhotoDelRequest {
  token: string;
}

export interface PhotoDelResponse {
  success: boolean;
  msg: string;
}

export interface PhotoDelFileRequest {
  token: string;
  fileName: string;
}

export interface PhotoDelFileResponse {
  success: boolean;
  msg: string;
}

export interface PhotoGetRequest {
  token: string;
}

export interface PhotoGetResponse {
  success: boolean;
  msg: string;
  fileList: string[];
}

export interface PhotoGetFileRequest {
  token: string;
  fileName: string;
}

export interface PhotoGetFileResponse {
  success: boolean;
  msg: string;
}

export interface CacheBackupRequest {
  token: string;
}

export interface CacheBackupResponse {
  success: boolean;
  msg: string;
  data: unknown;
}

export interface CacheBackupAquaRequest {
  token: string;
}

export interface CacheBackupAquaResponse {
  success: boolean;
  msg: string;
  data: unknown;
}

export interface CacheRestoreRequest {
  token: string;
  data: Record<string, unknown>;
}

export interface CacheRestoreResponse {
  success: boolean;
  msg: string;
  count: number;
}

export interface UploadCacheDelRequest {
  token: string;
  indexName: string;
}

export interface UploadCacheDelResponse {
  success: boolean;
  msg: string;
  data: string[];
}

export interface UploadCacheGetRequest {
  token: string;
}

export interface UploadCacheGetResponse {
  success: boolean;
  msg: string;
  data: string[];
}

export interface UploadCacheUploadRequest {
  token: string;
  indexName: string;
  SGWCMAID: string;
}

export interface UploadCacheUploadResponse {
  success: boolean;
  msg: string;
  data: string;
  music: string;
}

export interface UploadCacheGetFileRequest {
  token: string;
  indexName: string;
}

export interface UploadCacheGetFileResponse {
  success: boolean;
  msg: string;
  data: unknown;
}

export interface BlackRoomReqRequest {
  token: string;
  authTime: number;
}

export interface BlackRoomReqResponse {
  success: boolean;
  msg: string;
}

export interface UsageGetRequest {
  token: string;
}

export interface UsageGetResponse {
  success: boolean;
  msg: string;
  usageData: UsageData;
}

export interface UsageData {
  playerNum: number;
  chimeBindPlayerNum: number;
  machineNum: number;
  specialMachineNum: number;
  forwardRuleNum: number;
  totalRequestNum: number;
  onlineMachineNum: number;
  onlinePlayerNum: number;
  pullDataNum: number;
  pullDataAvgTime: number;
  pullDataTolTime: number;
}

export interface M2lCtlAddRequest {
  token: string;
  pwd?: string;
  data: string;
}

export interface M2lCtlAddResponse {
  success: boolean;
  msg: string;
}

export interface M2lCtlRetGetRequest {
  token: string;
}

export interface M2lCtlRetGetResponse {
  success: boolean;
  msg: string;
  returnData: string;
}

export interface M2lCtlIPCConfigGetRequest {
  token: string;
}

export interface M2lCtlIPCConfigGetResponse {
  success: boolean;
  msg: string;
  configs: Record<string, string>;
}

export interface PlayerQueueGetRequest {
  token: string;
  clientId: string;
}

export interface PlayerQueueGetResponse {
  success: boolean;
  msg: string;
  playerQueueData: PlayerQueueGetData;
}

export interface PlayerQueueGetData {
  clientId: string;
  statistics: Statistics;
  currentOnlinePlayers: OnlinePlayerDetail[];
  timeRangeStatistics: TimeRangeStatistic[];
  playerActivityAnalysis: PlayerActivityAnalysis;
  recentPlayRecords: PlayRecordDetail[];
  peakHoursAnalysis: PeakHoursAnalysis;
  sessionStatistics: SessionStatistics;
  recentSessionRecords: SessionRecord[];
  sessionDurationAnalysis: SessionDurationAnalysis;
  playerSessionFrequencyAnalysis: PlayerSessionFrequencyAnalysis;
  sessionHourlyDistribution: SessionHourlyDistribution;
  generatedAt: string;
}

export interface Statistics {
  currentOnlineCount: number;
  isOnline: boolean;
  last30MinutesCount: number;
  last1HourCount: number;
  last2HoursCount: number;
  last3HoursCount: number;
  last6HoursCount: number;
  last12HoursCount: number;
  last24HoursCount: number;
  totalPlayRecords: number;
  totalSessionRecords: number;
}

export interface OnlinePlayerDetail {
  userName: string;
  loginTime: string;
  playDuration: number;
  playDurationFormatted: string;
}

export interface TimeRangeStatistic {
  timeRange: string;
  duration: number;
  playerCount: number;
  uniquePlayerCount: number;
}

export interface PlayerActivityAnalysis {
  durationGroups: DurationGroup[];
  averagePlayDuration: number;
  averagePlayDurationFormatted: string;
  maxPlayDuration: number;
  maxPlayDurationFormatted: string;
  minPlayDuration: number;
  minPlayDurationFormatted: string;
}

export interface DurationGroup {
  groupName: string;
  minDuration: number;
  maxDuration: number;
  playerCount: number;
  percentage: number;
}

export interface PlayRecordDetail {
  userName: string;
  loginTime: string;
  logoutTime: string;
  duration: number;
  durationFormatted: string;
}

export interface SessionRecord {
  sessionId: string;
  userName: string;
  loginTime: string;
  logoutTime: string;
  duration: number;
  durationFormatted: string;
}

export interface SessionStatistics {
  last30MinutesSessionCount: number;
  last1HourSessionCount: number;
  last2HoursSessionCount: number;
  last3HoursSessionCount: number;
  last6HoursSessionCount: number;
  last12HoursSessionCount: number;
  last24HoursSessionCount: number;
  last7DaysSessionCount: number;
  averageSessionsPerDay: number;
  averageSessionsPerUser: number;
  totalSessions: number;
}

export interface SessionDurationAnalysis {
  durationGroups: SessionDurationGroup[];
  averageSessionDuration: number;
  averageSessionDurationFormatted: string;
  maxSessionDuration: number;
  maxSessionDurationFormatted: string;
  minSessionDuration: number;
  minSessionDurationFormatted: string;
  medianSessionDuration: number;
  medianSessionDurationFormatted: string;
}

export interface SessionDurationGroup {
  groupName: string;
  minDuration: number;
  maxDuration: number;
  sessionCount: number;
  percentage: number;
}

export interface PlayerSessionFrequencyAnalysis {
  topActiveUsers: TopActiveUser[];
  frequencyGroups: FrequencyGroup[];
  returningPlayersCount: number;
  returningPlayersRate: number;
}

export interface TopActiveUser {
  userName: string;
  sessionCount: number;
  totalDuration: number;
  totalDurationFormatted: string;
  averageDuration: number;
  averageDurationFormatted: string;
  firstLoginTime: string;
  lastLoginTime: string;
}

export interface FrequencyGroup {
  groupName: string;
  minSessions: number;
  maxSessions: number;
  playerCount: number;
  percentage: number;
}

export interface SessionHourlyDistribution {
  hourlySessionStats: HourlySessionStatistic[];
  peakSessionHour: number;
  peakSessionHourCount: number;
  peakSessionTimeRange: string;
}

export interface HourlySessionStatistic {
  hour: number;
  sessionCount: number;
  timeRange: string;
}

export interface PeakHoursAnalysis {
  hourlyStatistics: HourlyStatistic[];
  peakHour: number;
  peakHourCount: number;
  peakTimeRange: string;
}

export interface HourlyStatistic {
  hour: number;
  playerCount: number;
  timeRange: string;
}

export interface RegionStat {
  regionName: string;
  count: number;
}

export interface RegionGetRequest {
  token: string;
}

export interface RegionGetResponse {
  success: boolean;
  msg: string;
  data: RegionStat[];
}

export interface LogonMachine {
  name: string;
  cid: string;
}

export interface M2LIdGetRequest {
  token: string;
}

export interface M2LIdGetResponse {
  success: boolean;
  msg: string;
  m2lId?: string;
  userId?: string;
}

export interface M2LIdBindUserIdRequest {
  token: string;
  userId: number;
  cf_token: string;
}

export interface M2LIdBindUserIdResponse {
  success: boolean;
  msg: string;
}

export interface M2LIdBindQRCodeRequest {
  token: string;
  qrcode: string;
}

export interface M2LIdBindQRCodeResponse {
  success: boolean;
  msg: string;
}

export interface HTTPCheckResult {
  name: string;
  success: boolean;
  ping_ms: number;
  error_msg?: string;
}

export interface TCPCheckResult {
  name: string;
  success: boolean;
  ping_ms: number;
  error_msg?: string;
}

export interface MachineHealthInfo {
  cpu_usage: string;
  memory_usage: string;
  ram_usage: string;
  local_ip: string;
  gateway_ip: string;
  public_ip: string;
  system_uptime: string;
  network_status: string;
}

export interface SideloadInfo {
  branch: string;
}

export interface OrderItemStatus {
  name: string;
  status: string;
  progress: number;
  rf_state: number;
  rf_state_desc: string;
}

export interface OrderHealthInfo {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  current_order: string;
  current_item: string;
  current_status: string;
  download_progress: number;
  order_details: OrderItemStatus[];
}

export interface DiskInfo {
  drive_letter: string;
  total_gb: number;
  free_gb: number;
  read_speed: number;
  write_speed: number;
}

export interface StorageInfo {
  disks: DiskInfo[];
}

export interface NetworkSpeedInfo {
  download_speed: number;
  upload_speed: number;
}

export interface InstallPathStats {
  path: string;
  count: string;
}

export interface HealthCheckData {
  timestamp: string;
  key_chip?: string;
  private_key?: string;
  http_checks: HTTPCheckResult[];
  tcp_checks: TCPCheckResult[];
  machine_health: MachineHealthInfo;
  sideload: SideloadInfo;
  order_health: OrderHealthInfo;
  storage: StorageInfo;
  network_speed: NetworkSpeedInfo;
  install_path_stats?: InstallPathStats[];
}

export interface HealthCheckGetRequest {
  token: string;
}

export interface HealthCheckGetResponse {
  code: number;
  message: string;
  data?: {
    keyChip: string;
    online: boolean;
    data: HealthCheckData;
    reported_at: string;
    message: string;
  };
}

export interface UserPlaylog {
  userId: number;
  orderId: number;
  playlogId: number;
  version: number;
  placeId: number;
  placeName: string;
  loginDate: number;
  playDate: string;
  userPlayDate: string;
  type: number;
  musicId: number;
  level: number;
  trackNo: number;
  vsMode: number;
  vsUserName: string;
  vsStatus: number;
  vsUserRating: number;
  vsUserAchievement: number;
  vsUserGradeRank: number;
  vsRank: number;
  playerNum: number;
  playedUserId1: number;
  playedUserName1: string;
  playedMusicLevel1: number;
  playedUserId2: number;
  playedUserName2: string;
  playedMusicLevel2: number;
  playedUserId3: number;
  playedUserName3: string;
  playedMusicLevel3: number;
  characterId1: number;
  characterLevel1: number;
  characterAwakening1: number;
  characterId2: number;
  characterLevel2: number;
  characterAwakening2: number;
  characterId3: number;
  characterLevel3: number;
  characterAwakening3: number;
  characterId4: number;
  characterLevel4: number;
  characterAwakening4: number;
  characterId5: number;
  characterLevel5: number;
  characterAwakening5: number;
  achievement: number;
  deluxscore: number;
  scoreRank: number;
  maxCombo: number;
  totalCombo: number;
  maxSync: number;
  totalSync: number;
  tapCriticalPerfect: number;
  tapPerfect: number;
  tapGreat: number;
  tapGood: number;
  tapMiss: number;
  holdCriticalPerfect: number;
  holdPerfect: number;
  holdGreat: number;
  holdGood: number;
  holdMiss: number;
  slideCriticalPerfect: number;
  slidePerfect: number;
  slideGreat: number;
  slideGood: number;
  slideMiss: number;
  touchCriticalPerfect: number;
  touchPerfect: number;
  touchGreat: number;
  touchGood: number;
  touchMiss: number;
  breakCriticalPerfect: number;
  breakPerfect: number;
  breakGreat: number;
  breakGood: number;
  breakMiss: number;
  isTap: boolean;
  isHold: boolean;
  isSlide: boolean;
  isTouch: boolean;
  isBreak: boolean;
  isCriticalDisp: boolean;
  isFastLateDisp: boolean;
  fastCount: number;
  lateCount: number;
  isAchieveNewRecord: boolean;
  isDeluxscoreNewRecord: boolean;
  comboStatus: number;
  syncStatus: number;
  isClear: boolean;
  beforeRating: number;
  afterRating: number;
  beforeGrade: number;
  afterGrade: number;
  afterGradeRank: number;
  beforeDeluxRating: number;
  afterDeluxRating: number;
  isPlayTutorial: boolean;
  isEventMode: boolean;
  isFreedomMode: boolean;
  playMode: number;
  isNewFree: boolean;
  trialPlayAchievement: number;
  extNum1: number;
  extNum2: number;
  extNum4: number;
  extBool1: boolean;
  playCount?: number;
}

export interface PlaylogGetRequest {
  token: string;
  start: number;
  end: number;
}

export interface PlaylogGetResponse {
  success: boolean;
  msg: string;
  total: number;
  playlogList: UserPlaylog[];
}


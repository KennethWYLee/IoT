// controller.hpp — Week7 紙杯垃圾桶＋App（不用外接按鈕）v3：純 C++ 控制邏輯
//
// 依據：../../behavior_v3.md（2026-10-21）。
// 不含任何 Arduino 標頭：bin_app.ino 與主機測試 ../test_controller.cpp 共用同一份。
// 本檔只「決定」要送哪一個舵機動作（Action）；真正寫舵機只在 bin_app.ino 的 loop()。
//
// 時間：全部使用 uint32_t 毫秒，以 (now - start) 的無號減法計算經過時間，
// millis() 約 49.7 天繞回一次也不會出錯（只要單段等待短於 49.7 天）。
// 只有要求有效期 exp 這種「絕對裝置時間」用 (int32_t)(exp - now) 判斷先後。
#pragma once

#include <stdarg.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

namespace binapp {

// ---------------- 固定規則（behavior_v3） ----------------
static constexpr uint32_t SESSION_MS = 180000u;       // 本輪上限：從「準備舵機」送出初始 CLOSE 起算
static constexpr uint32_t STABLE_MS = 500u;           // 同一判斷連續 500 ms 才算穩定
static constexpr uint32_t AUTO_OPEN_MS = 5000u;       // AUTO：從 OPEN 命令實際送出起算 5 s
static constexpr uint32_t CMD_GAP_MS = 1000u;         // 位置命令變更至少間隔 1 s
static constexpr uint32_t SAMPLE_FRESH_MS = 150u;     // 樣本年齡超過即「不新鮮」，也會重新起算穩定
static constexpr uint32_t REQ_MAX_AHEAD_MS = 5000u;   // 要求有效期 exp 最多比裝置現在晚 5 s
static constexpr int32_t CAL_MIN_GAP = 100;           // 兩筆校正 RAW 至少相差 100
static constexpr int32_t OPEN_FOR_MIN_S = 1;
static constexpr int32_t OPEN_FOR_MAX_S = 60;
static constexpr int32_t PULSE_MIN_US = 500;          // 只是 PWM 可接受範圍，不代表機械安全
static constexpr int32_t PULSE_MAX_US = 2500;
static constexpr int32_t ENDPOINT_MIN_GAP_US = 100;   // 兩端點至少相差（擋住填錯成相同值）
static constexpr int64_t PHONE_EPOCH_MIN_MS = 1577836800000LL;  // 2020-01-01T00:00:00Z；更早視為手機時鐘無效
static constexpr int RESULT_SLOTS = 6;                 // 狀態中保留最近幾筆控制結果

inline uint32_t elapsedMs(uint32_t now, uint32_t start) { return (uint32_t)(now - start); }
inline int32_t clampAge(uint32_t v) { return v > 0x7FFFFFFFu ? (int32_t)0x7FFFFFFF : (int32_t)v; }

// ---------------- 列舉 ----------------
enum class Phase : uint8_t { PREVIEW, CONFIRM, RUNNING, STOPPED, TIMEOUT };
enum class Fault : uint8_t { NONE, SERVO, OLED, AP, NETWORK };
inline const char* faultName(Fault f) {
  switch(f) {case Fault::SERVO:return "servo";case Fault::OLED:return "oled";case Fault::AP:return "ap";case Fault::NETWORK:return "network";default:return "none";}
}
inline const char* faultShort(Fault f) {
  switch(f) {case Fault::SERVO:return "SERVO FAULT";case Fault::OLED:return "OLED FAULT";case Fault::AP:return "AP FAULT";case Fault::NETWORK:return "HTTP FAULT";default:return "";}
}
enum class Mode : uint8_t { NONE, AUTO, OPEN_FOR, HOLD_OPEN, CLOSE, CLOSE_AT, MANUAL_CLOSED };
enum class View : uint8_t { PREVIEW, CONFIRM, AUTO, COUNTDOWN, HOLD, WAIT_CLEAR, CLOSE_PENDING, MANUAL_CLOSED, STOPPED, TIMEOUT };
enum class Zone : uint8_t { UNKNOWN, CLEAR, MIDDLE, COVERED };
enum class Pos : uint8_t { NONE, OPEN, CLOSE };
enum class Wait : uint8_t { NONE, GAP, CLEAR, SENSOR };
enum class Action : uint8_t { NONE, ATTACH_CLOSE, OPEN, CLOSE, DETACH };
enum class Cmd : uint8_t { NONE, CAL_CLEAR, CAL_COVERED, PREPARE, START, OPEN_FOR, CLOSE, HOLD_OPEN, AUTO, CLOSE_AT, STOP };
enum class Res : uint8_t {
  ACCEPTED, DUPLICATE, BAD_BOOT, OLD_RUN, OLD_ID, EXPIRED, EXP_TOO_FAR, LATCHED, WRONG_PHASE,
  SETUP_LOCKED, OLED_FAIL, CAL_NEEDED, SENSOR_STALE, NOT_CLEAR, BAD_SECS, BAD_TIME,
  TIME_NOT_MINUTE, TIME_PAST, TIME_BEYOND, TIME_NOT_TODAY
};

inline const char* phaseName(Phase p) {
  switch (p) {
    case Phase::PREVIEW: return "preview";
    case Phase::CONFIRM: return "confirm";
    case Phase::RUNNING: return "running";
    case Phase::STOPPED: return "stopped";
    case Phase::TIMEOUT: return "timeout";
  }
  return "?";
}
inline const char* modeName(Mode m) {
  switch (m) {
    case Mode::NONE: return "none";
    case Mode::AUTO: return "auto";
    case Mode::OPEN_FOR: return "open_for";
    case Mode::HOLD_OPEN: return "hold_open";
    case Mode::CLOSE: return "close";
    case Mode::CLOSE_AT: return "close_at";
    case Mode::MANUAL_CLOSED: return "manual_closed";
  }
  return "?";
}
inline const char* viewName(View v) {
  switch (v) {
    case View::PREVIEW: return "preview";
    case View::CONFIRM: return "confirm";
    case View::AUTO: return "auto";
    case View::COUNTDOWN: return "countdown";
    case View::HOLD: return "hold";
    case View::WAIT_CLEAR: return "wait_clear";
    case View::CLOSE_PENDING: return "close_pending";
    case View::MANUAL_CLOSED: return "manual_closed";
    case View::STOPPED: return "stopped";
    case View::TIMEOUT: return "timeout";
  }
  return "?";
}
inline const char* zoneName(Zone z) {
  switch (z) {
    case Zone::UNKNOWN: return "unknown";
    case Zone::CLEAR: return "clear";
    case Zone::MIDDLE: return "middle";
    case Zone::COVERED: return "covered";
  }
  return "?";
}
inline const char* zoneShort(Zone z) {
  switch (z) {
    case Zone::CLEAR: return "CLEAR";
    case Zone::MIDDLE: return "WAIT";
    case Zone::COVERED: return "COVERED";
    default: return "--";
  }
}
inline const char* posName(Pos p) {
  switch (p) {
    case Pos::NONE: return "none";
    case Pos::OPEN: return "open";
    case Pos::CLOSE: return "close";
  }
  return "?";
}
inline const char* waitName(Wait w) {
  switch (w) {
    case Wait::NONE: return "none";
    case Wait::GAP: return "gap";
    case Wait::CLEAR: return "clear";
    case Wait::SENSOR: return "sensor";
  }
  return "?";
}
inline const char* actionName(Action a) {
  switch (a) {
    case Action::NONE: return "none";
    case Action::ATTACH_CLOSE: return "attach_close";
    case Action::OPEN: return "open";
    case Action::CLOSE: return "close";
    case Action::DETACH: return "detach";
  }
  return "?";
}
inline const char* resName(Res r) {
  switch (r) {
    case Res::ACCEPTED: return "accepted";
    case Res::DUPLICATE: return "duplicate";
    case Res::BAD_BOOT: return "bad_boot";
    case Res::OLD_RUN: return "old_run";
    case Res::OLD_ID: return "old_id";
    case Res::EXPIRED: return "expired";
    case Res::EXP_TOO_FAR: return "exp_too_far";
    case Res::LATCHED: return "latched";
    case Res::WRONG_PHASE: return "wrong_phase";
    case Res::SETUP_LOCKED: return "setup_locked";
    case Res::OLED_FAIL: return "oled_fail";
    case Res::CAL_NEEDED: return "cal_needed";
    case Res::SENSOR_STALE: return "sensor_stale";
    case Res::NOT_CLEAR: return "not_clear";
    case Res::BAD_SECS: return "bad_secs";
    case Res::BAD_TIME: return "bad_time";
    case Res::TIME_NOT_MINUTE: return "time_not_minute";
    case Res::TIME_PAST: return "time_past";
    case Res::TIME_BEYOND: return "time_beyond";
    case Res::TIME_NOT_TODAY: return "time_not_today";
  }
  return "?";
}

struct CmdNameEntry {
  Cmd cmd;
  const char* name;
};
static constexpr CmdNameEntry kCmdNames[] = {
    {Cmd::CAL_CLEAR, "cal_clear"}, {Cmd::CAL_COVERED, "cal_covered"}, {Cmd::PREPARE, "prepare"},
    {Cmd::START, "start"},         {Cmd::OPEN_FOR, "open_for"},       {Cmd::CLOSE, "close"},
    {Cmd::HOLD_OPEN, "hold_open"}, {Cmd::AUTO, "auto"},               {Cmd::CLOSE_AT, "close_at"},
    {Cmd::STOP, "stop"}};

inline const char* cmdName(Cmd c) {
  for (const CmdNameEntry& e : kCmdNames)
    if (e.cmd == c) return e.name;
  return "none";
}
inline bool cmdFromName(const char* s, Cmd& out) {
  if (s == nullptr) return false;
  for (const CmdNameEntry& e : kCmdNames)
    if (strcmp(e.name, s) == 0) {
      out = e.cmd;
      return true;
    }
  return false;
}

// ---------------- 教師設定 ----------------
struct Config {
  bool servoSetupConfirmed = false;
  int32_t safeRestUs = -1;    // 關蓋端點
  int32_t safeActiveUs = -1;  // 開蓋端點
};

// 舵機設定是否允許 attach。false 時控制器永遠不產生 ATTACH/OPEN/CLOSE。
inline bool configValid(const Config& c) {
  if (!c.servoSetupConfirmed) return false;
  if (c.safeRestUs < PULSE_MIN_US || c.safeRestUs > PULSE_MAX_US) return false;
  if (c.safeActiveUs < PULSE_MIN_US || c.safeActiveUs > PULSE_MAX_US) return false;
  const int32_t d = c.safeActiveUs - c.safeRestUs;
  return (d < 0 ? -d : d) >= ENDPOINT_MIN_GAP_US;
}

// ---------------- 要求（網路任務解析 → 佇列 → loop） ----------------
struct Request {
  Cmd cmd = Cmd::NONE;
  uint32_t boot = 0;
  uint32_t run = 0;
  uint32_t id = 0;
  uint32_t exp = 0;  // 裝置時基 millis()：此時刻之後要求作廢
  bool secsOk = false;
  int32_t secs = 0;
  bool timeOk = false;
  int64_t phoneNowMs = 0;
  int64_t targetMs = 0;
  int32_t utcOffsetMin = 0;
};

struct RawFields {  // 缺欄位用 nullptr
  const char* cmd;
  const char* boot;
  const char* run;
  const char* id;
  const char* exp;
  const char* secs;
  const char* phoneNowMs;
  const char* targetMs;
  const char* utcOffsetMin = "0";
};

// 只接受純十進位數字（不接受空白、正負號、小數點、科學記號）。
inline bool parseU64(const char* s, uint64_t& out) {
  if (s == nullptr || *s == '\0') return false;
  uint64_t v = 0;
  int n = 0;
  for (const char* p = s; *p; ++p) {
    if (*p < '0' || *p > '9') return false;
    if (++n > 19) return false;  // 10^19 < 2^64，不會溢位
    v = v * 10u + (uint64_t)(*p - '0');
  }
  out = v;
  return true;
}
inline bool parseU32(const char* s, uint32_t& out) {
  uint64_t v = 0;
  if (!parseU64(s, v) || v > 0xFFFFFFFFull) return false;
  out = (uint32_t)v;
  return true;
}
inline bool parseI64NonNeg(const char* s, int64_t& out) {
  uint64_t v = 0;
  if (!parseU64(s, v) || v > 9223372036854775807ull) return false;
  out = (int64_t)v;
  return true;
}

// 回傳 nullptr 表示外層格式正確（可排入佇列）；否則回傳錯誤代碼（HTTP 400，不排入）。
// 指令專屬欄位（secs、時間）格式錯誤不在這裡拒絕，而由控制迴圈回報 bad_secs / bad_time。
inline const char* parseRequest(const RawFields& f, Request& r) {
  r = Request();
  if (!cmdFromName(f.cmd, r.cmd)) return "bad_cmd";
  if (!parseU32(f.boot, r.boot)) return "bad_boot_field";
  if (!parseU32(f.id, r.id) || r.id == 0) return "bad_id";
  if (r.cmd != Cmd::STOP) {  // 停止優先：只需 boot 與 id
    if (!parseU32(f.run, r.run)) return "bad_run_field";
    if (!parseU32(f.exp, r.exp)) return "bad_exp_field";
  }
  if (r.cmd == Cmd::OPEN_FOR) {
    uint32_t s = 0;
    if (parseU32(f.secs, s) && s <= 1000000u) {
      r.secs = (int32_t)s;
      r.secsOk = true;
    }
  }
  if (r.cmd == Cmd::CLOSE_AT) {
    int64_t a = 0, b = 0;
    uint32_t magnitude = 0;
    const bool negative = f.utcOffsetMin && f.utcOffsetMin[0] == '-';
    const bool offsetOk = f.utcOffsetMin && parseU32(f.utcOffsetMin + (negative ? 1 : 0), magnitude) &&
      magnitude <= (negative ? 720u : 840u);
    const int offset = offsetOk ? (negative ? -int(magnitude) : int(magnitude)) : 0;
    if (parseI64NonNeg(f.phoneNowMs, a) && parseI64NonNeg(f.targetMs, b) && offsetOk) {
      r.phoneNowMs = a;
      r.targetMs = b;
      r.timeOk = true;
      r.utcOffsetMin = offset;
    }
  }
  return nullptr;
}

// ---------------- 狀態快照（loop 寫、網路任務讀） ----------------
struct ResultEntry {
  uint32_t id = 0;
  Cmd cmd = Cmd::NONE;
  Res res = Res::ACCEPTED;
  uint32_t atMs = 0;
};

struct Snapshot {
  uint32_t boot = 0, run = 0, nowMs = 0, lastSeq = 0, dupCount = 0, cmdCount = 0, queueDrop = 0;
  Phase phase = Phase::PREVIEW;
  Mode mode = Mode::NONE;
  View view = View::PREVIEW;
  Pos lastCmd = Pos::NONE;
  Pos pending = Pos::NONE;
  Wait wait = Wait::NONE;
  Zone zone = Zone::UNKNOWN;
  bool setupOk = false, oledOk = false, attached = false, fault = false;
  Fault faultReason = Fault::NONE;
  bool calOk = false, coveredHigh = false, stable = false, sampleFresh = false, countdownStarted = false;
  int32_t lastCmdAgeMs = -1, sessionLeftMs = -1, countdownLeftMs = -1;
  int32_t raw = -1, sampleAgeMs = -1, zoneMs = -1, calClear = -1, calCovered = -1, calGap = -1;
  int64_t targetPhoneMs = 0;
  int32_t utcOffsetMin = 0;
  uint8_t nResults = 0;
  ResultEntry results[RESULT_SLOTS];  // 新的在前
};

// ---------------- 控制器 ----------------
class Controller {
 public:
  void init(const Config& cfg, uint32_t bootId) {
    *this = Controller();
    cfg_ = cfg;
    boot_ = bootId;
  }
  void setOledOk(bool ok) { oledOk_ = ok; }

  // ---- 感測：loop 每 20 ms 呼叫 ----
  void onSample(uint16_t raw, uint32_t now) {
    const bool gap = hasSample_ && elapsedMs(now, sampleMs_) > SAMPLE_FRESH_MS;
    const Zone z = classify(raw);
    if (!hasSample_ || gap || z != zone_) {  // 判斷改變或取樣中斷：穩定計時重新開始
      zone_ = z;
      zoneSince_ = now;
      zoneStable_ = false;
      ++episode_;
    } else if (!zoneStable_ && elapsedMs(now, zoneSince_) >= STABLE_MS) {
      zoneStable_ = true;  // 鎖存，避免極長時間後 uint32 繞回造成誤判
    }
    hasSample_ = true;
    raw_ = raw;
    sampleMs_ = now;
  }

  bool calOk() const {
    return hasCalClear_ && hasCalCovered_ && absDiff(calClear_, calCovered_) >= CAL_MIN_GAP;
  }
  // 依兩筆校正自動判方向；三等分：靠未遮光 1/3 = CLEAR，靠遮光 1/3 = COVERED，中間 = MIDDLE(WAIT)。
  Zone classify(uint16_t raw) const {
    if (!calOk()) return Zone::UNKNOWN;
    const int32_t span = absDiff(calClear_, calCovered_);
    const int32_t pos = (calCovered_ > calClear_) ? (int32_t)raw - (int32_t)calClear_
                                                  : (int32_t)calClear_ - (int32_t)raw;
    if (3 * pos <= span) return Zone::CLEAR;
    if (3 * pos >= 2 * span) return Zone::COVERED;
    return Zone::MIDDLE;
  }
  bool sampleFresh(uint32_t now) const { return hasSample_ && elapsedMs(now, sampleMs_) <= SAMPLE_FRESH_MS; }
  bool stableIn(Zone z, uint32_t now) const {
    return z != Zone::UNKNOWN && sampleFresh(now) && zone_ == z && zoneStable_;
  }
  bool stableClear(uint32_t now) const { return stableIn(Zone::CLEAR, now); }

  // ---- 要求（loop 從佇列取出後呼叫；同一圈之後必須以相同 now 呼叫 tick） ----
  Res handle(const Request& r, uint32_t now) {
    checkDeadline(now);
    if (r.boot != boot_) return record(r.id, r.cmd, Res::BAD_BOOT, now);
    if (r.cmd == Cmd::STOP) return stop(r.id, now);
    if (hasSeq_ && r.id == lastSeq_) {  // 同一 ID 重送：不重做、不重起計時
      ++dupCount_;
      return Res::DUPLICATE;
    }
    if (hasSeq_ && r.id < lastSeq_) return record(r.id, r.cmd, Res::OLD_ID, now);
    if (r.run != run_) return record(r.id, r.cmd, Res::OLD_RUN, now);
    hasSeq_ = true;
    lastSeq_ = r.id;
    const uint32_t ahead = r.exp - now;
    if ((int32_t)ahead <= 0) return record(r.id, r.cmd, Res::EXPIRED, now);
    if (ahead > REQ_MAX_AHEAD_MS) return record(r.id, r.cmd, Res::EXP_TOO_FAR, now);
    if (phase_ == Phase::STOPPED || phase_ == Phase::TIMEOUT) return record(r.id, r.cmd, Res::LATCHED, now);
    return record(r.id, r.cmd, apply(r, now), now);
  }

  // 停止優先：不看 run／有效期／順序（boot 由網路任務先核對）。不送收尾關蓋。
  Res stop(uint32_t id, uint32_t now) {
    checkDeadline(now);
    if (!hasSeq_ || id > lastSeq_) {
      hasSeq_ = true;
      lastSeq_ = id;
    }
    if (phase_ == Phase::TIMEOUT) return record(id, Cmd::STOP, Res::LATCHED, now);
    enterStopped();
    return record(id, Cmd::STOP, Res::ACCEPTED, now);
  }

  // attach 失敗等：鎖定為停止（不送關蓋）。
  void latchFault(uint32_t now, Fault reason = Fault::SERVO) {
    checkDeadline(now);
    if(!fault_) faultReason_ = reason;
    fault_ = true;
    if (phase_ != Phase::TIMEOUT) enterStopped();
  }

  // ---- 每圈呼叫；回傳本圈要送的舵機動作（最多一個）。先查期限。 ----
  Action tick(uint32_t now) {
    checkDeadline(now);
    if (needDetach_) {
      needDetach_ = false;
      attached_ = false;
      pending_ = Pos::NONE;
      wait_ = Wait::NONE;
      return Action::DETACH;
    }
    if (phase_ == Phase::STOPPED || phase_ == Phase::TIMEOUT) {
      pending_ = Pos::NONE;
      wait_ = Wait::NONE;
      return Action::NONE;
    }
    if (needAttachClose_) {
      needAttachClose_ = false;
      // 初始 CLOSE 送出前再查一次（與 handle 同一圈、同一 now）。
      Res why = Res::ACCEPTED;
      if (!configValid(cfg_)) why = Res::SETUP_LOCKED;
      else if (!oledOk_) why = Res::OLED_FAIL;
      else if (!stableClear(now)) why = Res::NOT_CLEAR;
      if (why != Res::ACCEPTED) {
        phase_ = Phase::PREVIEW;
        run_ -= 1;
        mode_ = Mode::NONE;
        amendResult(prepareId_, Cmd::PREPARE, why);
        return Action::NONE;
      }
      attached_ = true;
      lastCmd_ = Pos::CLOSE;
      lastCmdMs_ = now;
      sessionStart_ = now;  // 180 s 從初始 CLOSE 實際送出起算
      ++cmdCount_;
      return Action::ATTACH_CLOSE;
    }
    if (phase_ != Phase::RUNNING) {
      pending_ = Pos::NONE;
      wait_ = Wait::NONE;
      return Action::NONE;
    }
    return runStep(now);
  }

  View view() const {
    switch (phase_) {
      case Phase::PREVIEW: return View::PREVIEW;
      case Phase::CONFIRM: return View::CONFIRM;
      case Phase::STOPPED: return View::STOPPED;
      case Phase::TIMEOUT: return View::TIMEOUT;
      case Phase::RUNNING: break;
    }
    if (wait_ == Wait::CLEAR || wait_ == Wait::SENSOR) return View::WAIT_CLEAR;
    switch (mode_) {
      case Mode::OPEN_FOR:
      case Mode::CLOSE_AT: return View::COUNTDOWN;
      case Mode::HOLD_OPEN: return View::HOLD;
      case Mode::CLOSE: return View::CLOSE_PENDING;
      case Mode::MANUAL_CLOSED: return View::MANUAL_CLOSED;
      default: return View::AUTO;
    }
  }

  void fillSnapshot(uint32_t now, Snapshot& s) const {
    s = Snapshot();
    s.boot = boot_;
    s.run = run_;
    s.faultReason = faultReason_;
    s.nowMs = now;
    s.lastSeq = lastSeq_;
    s.dupCount = dupCount_;
    s.cmdCount = cmdCount_;
    s.phase = phase_;
    s.mode = mode_;
    s.view = view();
    s.lastCmd = lastCmd_;
    s.pending = pending_;
    s.wait = wait_;
    s.zone = zone_;
    s.setupOk = configValid(cfg_);
    s.oledOk = oledOk_;
    s.attached = attached_;
    s.fault = fault_;
    s.calOk = calOk();
    s.targetPhoneMs = mode_ == Mode::CLOSE_AT ? targetPhoneMs_ : 0;
    s.utcOffsetMin = utcOffsetMin_;
    s.coveredHigh = s.calOk && calCovered_ > calClear_;
    s.sampleFresh = sampleFresh(now);
    s.stable = zoneStable_ && s.sampleFresh;
    if (lastCmd_ != Pos::NONE) s.lastCmdAgeMs = clampAge(elapsedMs(now, lastCmdMs_));
    if (phase_ == Phase::CONFIRM || phase_ == Phase::RUNNING) {
      const uint32_t e = elapsedMs(now, sessionStart_);
      s.sessionLeftMs = e >= SESSION_MS ? 0 : (int32_t)(SESSION_MS - e);
    }
    if (cdActive_) {
      const uint32_t e = elapsedMs(now, cdStart_);
      s.countdownStarted = true;
      s.countdownLeftMs = (cdExpired_ || e >= cdDur_) ? 0 : clampAge(cdDur_ - e);
    } else if (cdWaitOpen_) {
      s.countdownLeftMs = clampAge(cdDur_);  // 尚未起算：等 OPEN 命令送出
    }
    if (hasSample_) {
      s.raw = raw_;
      s.sampleAgeMs = clampAge(elapsedMs(now, sampleMs_));
      s.zoneMs = clampAge(elapsedMs(now, zoneSince_));
    }
    if (hasCalClear_) s.calClear = calClear_;
    if (hasCalCovered_) s.calCovered = calCovered_;
    if (hasCalClear_ && hasCalCovered_) s.calGap = absDiff(calClear_, calCovered_);
    s.nResults = ringCount_;
    for (int k = 0; k < ringCount_; ++k) {
      const int idx = (ringHead_ - 1 - k + 2 * RESULT_SLOTS) % RESULT_SLOTS;
      s.results[k] = ring_[idx];
    }
  }

  // ---- 測試／除錯用唯讀存取 ----
  Phase phase() const { return phase_; }
  Mode mode() const { return mode_; }
  Pos lastCmd() const { return lastCmd_; }
  Pos pending() const { return pending_; }
  Wait wait() const { return wait_; }
  Zone zone() const { return zone_; }
  bool attached() const { return attached_; }
  bool fault() const { return fault_; }
  uint32_t run() const { return run_; }
  uint32_t boot() const { return boot_; }
  uint32_t lastSeq() const { return lastSeq_; }
  uint32_t dupCount() const { return dupCount_; }

 private:
  static int32_t absDiff(uint16_t a, uint16_t b) { return a > b ? (int32_t)(a - b) : (int32_t)(b - a); }

  Res record(uint32_t id, Cmd cmd, Res res, uint32_t now) {
    ResultEntry& e = ring_[ringHead_];
    e.id = id;
    e.cmd = cmd;
    e.res = res;
    e.atMs = now;
    ringHead_ = (uint8_t)((ringHead_ + 1) % RESULT_SLOTS);
    if (ringCount_ < RESULT_SLOTS) ++ringCount_;
    return res;
  }
  void amendResult(uint32_t id, Cmd cmd, Res res) {
    for (int i = 0; i < ringCount_; ++i)
      if (ring_[i].id == id && ring_[i].cmd == cmd) ring_[i].res = res;
  }

  void checkDeadline(uint32_t now) {
    if ((phase_ == Phase::CONFIRM || phase_ == Phase::RUNNING) && elapsedMs(now, sessionStart_) >= SESSION_MS) {
      phase_ = Phase::TIMEOUT;  // 不送關蓋；只 detach 並鎖定
      mode_ = Mode::NONE;
      cancelTimers();
      needAttachClose_ = false;
      if (attached_) needDetach_ = true;
    }
  }
  void enterStopped() {
    phase_ = Phase::STOPPED;
    mode_ = Mode::NONE;
    cancelTimers();
    needAttachClose_ = false;
    if (attached_) needDetach_ = true;
  }
  void cancelTimers() {
    cdActive_ = false;
    cdWaitOpen_ = false;
    cdExpired_ = false;
    pending_ = Pos::NONE;
    wait_ = Wait::NONE;
  }
  void startCountdown(uint32_t now) {
    cdActive_ = true;
    cdWaitOpen_ = false;
    cdExpired_ = false;
    cdStart_ = now;
  }
  bool cdExpired(uint32_t now) {
    if (!cdActive_) return false;
    if (!cdExpired_ && elapsedMs(now, cdStart_) >= cdDur_) cdExpired_ = true;
    return cdExpired_;
  }
  void enterAuto(uint32_t now, bool acceptCurrentCover = false) {
    mode_ = Mode::AUTO;
    armEpisode_ = episode_;  // 需要「之後新開始」的遮光才開蓋
    if (acceptCurrentCover && stableIn(Zone::COVERED, now)) armEpisode_ = episode_ - 1;
    if (lastCmd_ == Pos::OPEN) {  // 最後命令是 OPEN：從現在重新維持 5 s
      cdDur_ = AUTO_OPEN_MS;
      startCountdown(now);
    }
  }

  Res apply(const Request& r, uint32_t now) {
    switch (r.cmd) {
      case Cmd::CAL_CLEAR:
      case Cmd::CAL_COVERED:
        if (phase_ != Phase::PREVIEW) return Res::WRONG_PHASE;
        if (!sampleFresh(now)) return Res::SENSOR_STALE;
        if (r.cmd == Cmd::CAL_CLEAR) {
          calClear_ = raw_;
          hasCalClear_ = true;
        } else {
          calCovered_ = raw_;
          hasCalCovered_ = true;
        }
        zone_ = Zone::UNKNOWN;  // 門檻改變：穩定判斷重新開始
        zoneSince_ = now;
        zoneStable_ = false;
        ++episode_;
        return Res::ACCEPTED;
      case Cmd::PREPARE:
        if (phase_ != Phase::PREVIEW) return Res::WRONG_PHASE;
        if (!configValid(cfg_)) return Res::SETUP_LOCKED;
        if (!oledOk_) return Res::OLED_FAIL;
        if (!calOk()) return Res::CAL_NEEDED;
        if (!sampleFresh(now)) return Res::SENSOR_STALE;
        if (!stableClear(now)) return Res::NOT_CLEAR;
        phase_ = Phase::CONFIRM;
        run_ += 1;
        sessionStart_ = now;
        needAttachClose_ = true;
        prepareId_ = r.id;
        mode_ = Mode::NONE;
        return Res::ACCEPTED;
      case Cmd::START:
        if (phase_ != Phase::CONFIRM || needAttachClose_) return Res::WRONG_PHASE;
        phase_ = Phase::RUNNING;
        enterAuto(now);
        return Res::ACCEPTED;
      default:
        break;
    }
    if (phase_ != Phase::RUNNING) return Res::WRONG_PHASE;
    switch (r.cmd) {
      case Cmd::OPEN_FOR:
        if (!r.secsOk || r.secs < OPEN_FOR_MIN_S || r.secs > OPEN_FOR_MAX_S) return Res::BAD_SECS;
        cancelTimers();
        mode_ = Mode::OPEN_FOR;
        cdDur_ = (uint32_t)r.secs * 1000u;
        if (lastCmd_ == Pos::OPEN) startCountdown(now);  // 已 OPEN：從現在算
        else cdWaitOpen_ = true;                          // 未 OPEN：從 OPEN 送出起算
        return Res::ACCEPTED;
      case Cmd::CLOSE:
        cancelTimers();
        mode_ = Mode::CLOSE;
        return Res::ACCEPTED;
      case Cmd::HOLD_OPEN:
        cancelTimers();
        mode_ = Mode::HOLD_OPEN;
        return Res::ACCEPTED;
      case Cmd::AUTO:
        cancelTimers();
        enterAuto(now, true);
        return Res::ACCEPTED;
      case Cmd::CLOSE_AT: {
        if (!r.timeOk || r.phoneNowMs < PHONE_EPOCH_MIN_MS || r.targetMs < PHONE_EPOCH_MIN_MS ||
            r.phoneNowMs > 4102444800000LL || r.targetMs > 4102444800000LL ||
            r.utcOffsetMin < -720 || r.utcOffsetMin > 840) return Res::BAD_TIME;
        const int64_t offsetMs = int64_t(r.utcOffsetMin) * 60000;
        if ((r.phoneNowMs + offsetMs) / 86400000 != (r.targetMs + offsetMs) / 86400000)
          return Res::TIME_NOT_TODAY;
        if (r.targetMs % 60000 != 0) return Res::TIME_NOT_MINUTE;
        const int64_t delta = r.targetMs - r.phoneNowMs;  // 只用手機兩個時間的差
        if (delta <= 0) return Res::TIME_PAST;
        const uint32_t used = elapsedMs(now, sessionStart_);
        const int64_t left = used >= SESSION_MS ? 0 : (int64_t)(SESSION_MS - used);
        if (delta >= left) return Res::TIME_BEYOND;
        cancelTimers();
        mode_ = Mode::CLOSE_AT;
        targetPhoneMs_ = r.targetMs;
        utcOffsetMin_ = r.utcOffsetMin;
        cdDur_ = (uint32_t)delta;  // 轉成裝置單調時間倒數；之後手機改時間／離線都不影響
        startCountdown(now);
        return Res::ACCEPTED;
      }
      default:
        return Res::WRONG_PHASE;
    }
  }

  void onClosed() {
    cdActive_ = false;
    cdWaitOpen_ = false;
    cdExpired_ = false;
    if (mode_ == Mode::AUTO) armEpisode_ = episode_;  // 關好後等下一次遮光
    else if (mode_ == Mode::OPEN_FOR || mode_ == Mode::CLOSE || mode_ == Mode::CLOSE_AT) mode_ = Mode::MANUAL_CLOSED;
  }

  Action runStep(uint32_t now) {
    pending_ = Pos::NONE;
    wait_ = Wait::NONE;
    Pos want = Pos::NONE;
    switch (mode_) {
      case Mode::AUTO:
        if (lastCmd_ == Pos::OPEN) want = (cdActive_ && !cdExpired(now)) ? Pos::OPEN : Pos::CLOSE;
        else if (stableIn(Zone::COVERED, now) && episode_ != armEpisode_) want = Pos::OPEN;
        break;
      case Mode::OPEN_FOR:
        want = (cdActive_ && cdExpired(now)) ? Pos::CLOSE : Pos::OPEN;
        break;
      case Mode::CLOSE_AT:
        if (!cdExpired(now)) {
          want = Pos::OPEN;
        } else if (lastCmd_ == Pos::OPEN) {
          want = Pos::CLOSE;
        } else {  // 到時仍未送出 OPEN（命令間隔未滿）：不再開蓋
          cancelTimers();
          mode_ = Mode::MANUAL_CLOSED;
        }
        break;
      case Mode::HOLD_OPEN: want = Pos::OPEN; break;
      case Mode::CLOSE: want = Pos::CLOSE; break;
      default: break;
    }

    if (want == Pos::OPEN) {
      if (lastCmd_ == Pos::OPEN) return Action::NONE;
      pending_ = Pos::OPEN;
      if (elapsedMs(now, lastCmdMs_) < CMD_GAP_MS) {
        wait_ = Wait::GAP;
        return Action::NONE;
      }
      pending_ = Pos::NONE;
      lastCmd_ = Pos::OPEN;
      lastCmdMs_ = now;
      ++cmdCount_;
      if (mode_ == Mode::AUTO) {
        cdDur_ = AUTO_OPEN_MS;
        startCountdown(now);  // 5 s 從 OPEN 實際送出起算
      } else if (cdWaitOpen_) {
        startCountdown(now);
      }
      return Action::OPEN;
    }
    if (want == Pos::CLOSE) {
      if (lastCmd_ == Pos::CLOSE) {
        onClosed();
        return Action::NONE;
      }
      pending_ = Pos::CLOSE;
      if (!sampleFresh(now)) {
        wait_ = Wait::SENSOR;
        return Action::NONE;
      }
      if (!stableClear(now)) {  // 送 CLOSE 前都重查目前的新鮮穩定 CLEAR
        wait_ = Wait::CLEAR;
        return Action::NONE;
      }
      if (elapsedMs(now, lastCmdMs_) < CMD_GAP_MS) {
        wait_ = Wait::GAP;
        return Action::NONE;
      }
      pending_ = Pos::NONE;
      lastCmd_ = Pos::CLOSE;
      lastCmdMs_ = now;
      ++cmdCount_;
      onClosed();
      return Action::CLOSE;
    }
    return Action::NONE;
  }

  Config cfg_{};
  uint32_t boot_ = 0;
  uint32_t run_ = 0;
  Phase phase_ = Phase::PREVIEW;
  Mode mode_ = Mode::NONE;
  bool oledOk_ = false;
  bool attached_ = false;
  bool fault_ = false;
  Fault faultReason_ = Fault::NONE;
  bool needAttachClose_ = false;
  bool needDetach_ = false;
  uint32_t prepareId_ = 0;
  uint32_t sessionStart_ = 0;
  // 感測
  bool hasSample_ = false;
  uint16_t raw_ = 0;
  uint32_t sampleMs_ = 0;
  Zone zone_ = Zone::UNKNOWN;
  uint32_t zoneSince_ = 0;
  bool zoneStable_ = false;
  uint32_t episode_ = 0;
  // 校正
  bool hasCalClear_ = false;
  bool hasCalCovered_ = false;
  uint16_t calClear_ = 0;
  uint16_t calCovered_ = 0;
  // 命令
  Pos lastCmd_ = Pos::NONE;
  uint32_t lastCmdMs_ = 0;
  uint32_t cmdCount_ = 0;
  Pos pending_ = Pos::NONE;
  Wait wait_ = Wait::NONE;
  // 倒數
  bool cdActive_ = false;
  bool cdWaitOpen_ = false;
  bool cdExpired_ = false;
  uint32_t cdStart_ = 0;
  uint32_t cdDur_ = 0;
  uint32_t armEpisode_ = 0;
  int64_t targetPhoneMs_ = 0;
  int32_t utcOffsetMin_ = 0;
  // 要求
  bool hasSeq_ = false;
  uint32_t lastSeq_ = 0;
  uint32_t dupCount_ = 0;
  ResultEntry ring_[RESULT_SLOTS];
  uint8_t ringHead_ = 0;
  uint8_t ringCount_ = 0;
};

// ---------------- 狀態 JSON（欄位與順序固定，見 README） ----------------
class JsonOut {
 public:
  JsonOut(char* b, size_t cap) : b_(b), cap_(cap) {
    if (cap_ > 0) b_[0] = '\0';
  }
#if defined(__GNUC__)
  __attribute__((format(printf, 2, 3)))
#endif
  void put(const char* fmt, ...) {
    if (!ok_) return;
    va_list ap;
    va_start(ap, fmt);
    const int k = vsnprintf(b_ + n_, cap_ - n_, fmt, ap);
    va_end(ap);
    if (k < 0 || (size_t)k >= cap_ - n_) {
      ok_ = false;
      return;
    }
    n_ += (size_t)k;
  }
  int result() const { return ok_ ? (int)n_ : -1; }

 private:
  char* b_;
  size_t cap_;
  size_t n_ = 0;
  bool ok_ = true;
};

inline unsigned long jUL(uint32_t v) { return (unsigned long)v; }
inline long jL(int32_t v) { return (long)v; }
inline const char* jB(bool v) { return v ? "true" : "false"; }

// respNowMs：回應當下的裝置 millis()；App 用它換算要求有效期 exp。
inline int writeStateJson(const Snapshot& s, uint32_t respNowMs, char* buf, size_t cap) {
  JsonOut o(buf, cap);
  o.put("{\"v\":3,\"boot\":%lu,\"run\":%lu,\"now_ms\":%lu,\"snap_age_ms\":%lu,\"last_seq\":%lu,", jUL(s.boot),
        jUL(s.run), jUL(respNowMs), jUL(elapsedMs(respNowMs, s.nowMs)), jUL(s.lastSeq));
  o.put("\"phase\":\"%s\",\"view\":\"%s\",\"mode\":\"%s\",", phaseName(s.phase), viewName(s.view), modeName(s.mode));
  o.put("\"setup_ok\":%s,\"oled_ok\":%s,\"servo_attached\":%s,\"fault\":%s,", jB(s.setupOk), jB(s.oledOk),
        jB(s.attached), jB(s.fault));
  o.put("\"fault_reason\":\"%s\",", faultName(s.faultReason));
  o.put("\"last_cmd\":\"%s\",\"last_cmd_age_ms\":%ld,\"pending_cmd\":\"%s\",\"wait\":\"%s\",\"cmd_count\":%lu,",
        posName(s.lastCmd), jL(s.lastCmdAgeMs), posName(s.pending), waitName(s.wait), jUL(s.cmdCount));
  o.put("\"session_left_ms\":%ld,\"countdown_left_ms\":%ld,\"countdown_started\":%s,", jL(s.sessionLeftMs),
        jL(s.countdownLeftMs), jB(s.countdownStarted));
  o.put("\"target_phone_ms\":%lld,\"utc_offset_min\":%ld,", (long long)s.targetPhoneMs, jL(s.utcOffsetMin));
  o.put("\"raw\":%ld,\"sample_age_ms\":%ld,\"sample_fresh\":%s,\"zone\":\"%s\",\"zone_ms\":%ld,\"stable\":%s,",
        jL(s.raw), jL(s.sampleAgeMs), jB(s.sampleFresh), zoneName(s.zone), jL(s.zoneMs), jB(s.stable));
  o.put("\"cal_clear\":%ld,\"cal_covered\":%ld,\"cal_gap\":%ld,\"cal_ok\":%s,\"covered_high\":%s,", jL(s.calClear),
        jL(s.calCovered), jL(s.calGap), jB(s.calOk), jB(s.coveredHigh));
  o.put("\"dup_count\":%lu,\"queue_drop\":%lu,\"results\":[", jUL(s.dupCount), jUL(s.queueDrop));
  for (int i = 0; i < s.nResults && i < RESULT_SLOTS; ++i) {
    const ResultEntry& e = s.results[i];
    o.put("%s{\"id\":%lu,\"cmd\":\"%s\",\"res\":\"%s\",\"age_ms\":%ld}", i ? "," : "", jUL(e.id), cmdName(e.cmd),
          resName(e.res), jL(clampAge(elapsedMs(s.nowMs, e.atMs))));
  }
  o.put("]}");
  return o.result();
}

// ---------------- OLED 文字（純 ASCII；六行使用相同字體） ----------------
static constexpr int OLED_LINES = 6;
static constexpr int OLED_COLS = 22;
typedef char OledFrame[OLED_LINES][OLED_COLS];

inline long ceilSec(int32_t ms) { return ms <= 0 ? 0L : (long)(((int64_t)ms + 999) / 1000); }

inline void oledFrame(const Snapshot& s, OledFrame out) {
  memset(out, 0, sizeof(OledFrame));
  char left[OLED_COLS];
  snprintf(left, sizeof left, "LEFT %lds", ceilSec(s.sessionLeftMs));
  switch (s.view) {
    case View::PREVIEW:
      snprintf(out[0], OLED_COLS, "%s", "PREVIEW");
      snprintf(out[1], OLED_COLS, "%s", s.setupOk ? "SETUP OK" : "SETUP LOCKED");
      snprintf(out[2], OLED_COLS, "%s", s.calOk ? "CAL OK" : "CAL NEED");
      snprintf(out[3], OLED_COLS, "LIGHT %s", s.sampleFresh ? zoneShort(s.zone) : "--");
      break;
    case View::CONFIRM:
      snprintf(out[0], OLED_COLS, "%s", "POWER ON");
      snprintf(out[1], OLED_COLS, "%s", "CHECK");
      snprintf(out[2], OLED_COLS, "%s", left);
      break;
    case View::AUTO:
      snprintf(out[0], OLED_COLS, "%s", "AUTO");
      if (s.countdownStarted) snprintf(out[1], OLED_COLS, "OPEN %lds", ceilSec(s.countdownLeftMs));
      snprintf(out[2], OLED_COLS, "%s", left);
      break;
    case View::COUNTDOWN:
      if (s.countdownStarted) snprintf(out[0], OLED_COLS, "OPEN %lds", ceilSec(s.countdownLeftMs));
      else snprintf(out[0], OLED_COLS, "%s", "OPENING");
      snprintf(out[1], OLED_COLS, "%s", s.mode == Mode::CLOSE_AT ? "BY CLOCK" : "TIMER");
      snprintf(out[2], OLED_COLS, "%s", left);
      break;
    case View::HOLD:
      snprintf(out[0], OLED_COLS, "%s", "HOLD");
      snprintf(out[2], OLED_COLS, "%s", left);
      break;
    case View::WAIT_CLEAR:
      snprintf(out[0], OLED_COLS, "%s", "WAIT CLEAR");
      if (s.wait == Wait::SENSOR) snprintf(out[1], OLED_COLS, "%s", "SENSOR STALE");
      snprintf(out[2], OLED_COLS, "%s", left);
      break;
    case View::CLOSE_PENDING:
      snprintf(out[0], OLED_COLS, "%s", "CLOSING");
      snprintf(out[2], OLED_COLS, "%s", left);
      break;
    case View::MANUAL_CLOSED:
      snprintf(out[0], OLED_COLS, "%s", "CLOSE SENT");
      snprintf(out[1], OLED_COLS, "%s", "MANUAL");
      snprintf(out[2], OLED_COLS, "%s", left);
      break;
    case View::STOPPED:
      snprintf(out[0], OLED_COLS, "%s", "STOP");
      snprintf(out[1], OLED_COLS, "%s", "POWER OFF");
      if (s.fault) snprintf(out[2], OLED_COLS, "%s", faultShort(s.faultReason));
      break;
    case View::TIMEOUT:
      snprintf(out[0], OLED_COLS, "%s", "TIMEOUT");
      snprintf(out[1], OLED_COLS, "%s", "POWER OFF");
      break;
  }
  snprintf(out[3], OLED_COLS, "LIGHT %s", !s.calOk ? "--" : !s.sampleFresh ? "STALE" : !s.stable ? "WAIT" : zoneShort(s.zone));
  snprintf(out[4], OLED_COLS, "CMD %s", s.lastCmd == Pos::OPEN ? "OPEN" : s.lastCmd == Pos::CLOSE ? "CLOSE" : "--");
  snprintf(out[5], OLED_COLS, "NEXT %s %s", s.pending == Pos::OPEN ? "OPEN" : s.pending == Pos::CLOSE ? "CLOSE" : "--", s.wait == Wait::GAP ? "GAP" : "");
}

}  // namespace binapp

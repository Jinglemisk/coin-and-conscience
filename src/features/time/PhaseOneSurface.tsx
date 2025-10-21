import { useCallback, useMemo, type ChangeEvent, type CSSProperties } from 'react';
import { useConfigStore, useLoggerStore } from '@/app/providers';
import { useGlobalStatsStore } from '@/features/stats/globalStatsStore';
import { useTimeStore } from './timeStore';

const formatMultiplier = (multiplier: number) => {
  if (multiplier === 0) {
    return 'Paused (0x)';
  }
  if (multiplier === 1) {
    return 'Normal (1x)';
  }
  return `${multiplier}x`;
};

const containerStyle: CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  padding: '1.5rem',
  display: 'grid',
  gap: '1.5rem'
};

const cardStyle: CSSProperties = {
  border: '1px solid #d0d0d0',
  borderRadius: '0.5rem',
  padding: '1rem',
  background: '#fafafa'
};

const statListStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '0.75rem'
};

export const PhaseOneSurface = () => {
  const ticksToSeconds = useConfigStore((state) => state.ticksToSeconds);
  const getPhaseDurationSeconds = useConfigStore((state) => state.getPhaseDurationSeconds);
  const logEvent = useLoggerStore((state) => state.log);

  const {
    tick,
    phase,
    phaseTick,
    phaseDurationsTicks,
    day,
    week,
    dayOfWeek,
    dayTick,
    daysPerWeek,
    isPaused,
    allowedSpeedMultipliers,
    speedMultiplier
  } = useTimeStore((state) => ({
    tick: state.tick,
    phase: state.phase,
    phaseTick: state.phaseTick,
    phaseDurationsTicks: state.phaseDurationsTicks,
    day: state.day,
    week: state.week,
    dayOfWeek: state.dayOfWeek,
    dayTick: state.dayTick,
    daysPerWeek: state.daysPerWeek,
    isPaused: state.isPaused,
    allowedSpeedMultipliers: state.allowedSpeedMultipliers,
    speedMultiplier: state.speedMultiplier
  }));

  const setSpeedMultiplier = useTimeStore((state) => state.setSpeedMultiplier);
  const setPaused = useTimeStore((state) => state.setPaused);

  const stats = useGlobalStatsStore((state) => state.stats);
  const snapshots = useGlobalStatsStore((state) => state.snapshots);

  const phaseDurationTicks = phaseDurationsTicks[phase];
  const phaseDurationSeconds = getPhaseDurationSeconds(phase);
  const phaseProgress = phaseDurationTicks > 0 ? phaseTick / phaseDurationTicks : 0;

  const handleMultiplierChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = Number(event.target.value);
      setSpeedMultiplier(value);
    },
    [setSpeedMultiplier]
  );

  const togglePause = useCallback(() => {
    setPaused(!isPaused);
  }, [isPaused, setPaused]);

  const exportSnapshots = useCallback(() => {
    const payload = {
      totalSnapshots: snapshots.length,
      latest: snapshots[snapshots.length - 1] ?? null
    };
    logEvent('info', 'time.snapshot.export', payload, ['loop']);
    console.info('[snapshot-export]', snapshots);
  }, [logEvent, snapshots]);

  const formattedStats = useMemo(
    () => [
      { label: 'Gold', value: stats.gold },
      { label: 'Reputation', value: stats.reputation },
      { label: 'Danger', value: stats.danger },
      { label: 'Heat', value: stats.heat },
      { label: 'Party', value: stats.partySize }
    ],
    [stats]
  );

  return (
    <main style={containerStyle}>
      <header>
        <h1>Coin &amp; Conscience — Phase 1 Loop Monitor</h1>
        <p>Real-time tick controller, day/night phases, and global stat snapshots for QA.</p>
      </header>

      <section style={cardStyle}>
        <h2>Top Bar Stats</h2>
        <div style={statListStyle}>
          {formattedStats.map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: '0.85rem', color: '#555' }}>{stat.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={cardStyle}>
        <h2>Time &amp; Phase State</h2>
        <p>
          Day {day} (Week {week}, Day {dayOfWeek} / {daysPerWeek})
        </p>
        <p>
          Phase: <strong>{phase}</strong> — Tick {phaseTick} / {phaseDurationTicks} ({Math.floor(phaseProgress * 100)}%)
        </p>
        <p>
          Phase duration: {phaseDurationSeconds} seconds ({phaseDurationTicks} ticks)
        </p>
        <p>Total ticks: {tick} (~{ticksToSeconds(tick).toFixed(1)}s)</p>
        <p>Ticks this day: {dayTick}</p>
        <div style={{ background: '#e0e0e0', borderRadius: '999px', overflow: 'hidden', height: '0.75rem' }}>
          <div
            style={{
              width: `${Math.min(100, Math.max(0, phaseProgress * 100))}%`,
              background: '#4a90e2',
              height: '100%'
            }}
          />
        </div>
      </section>

      <section style={cardStyle}>
        <h2>Loop Controls</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <label>
            Speed multiplier
            <select value={speedMultiplier} onChange={handleMultiplierChange} style={{ marginLeft: '0.5rem' }}>
              {allowedSpeedMultipliers.map((multiplier) => (
                <option key={multiplier} value={multiplier}>
                  {formatMultiplier(multiplier)}
                </option>
              ))}
            </select>
          </label>
          <button onClick={togglePause} type="button">
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
        <p style={{ marginTop: '0.75rem', color: '#666', fontSize: '0.9rem' }}>
          Use the speed selector to throttle or accelerate the simulation. Pause toggles requestAnimationFrame updates.
        </p>
      </section>

      <section style={cardStyle}>
        <h2>Phase Snapshots</h2>
        <p>Captured snapshots: {snapshots.length}</p>
        {snapshots.length > 0 && (
          <div style={{ fontSize: '0.9rem', color: '#444', marginTop: '0.5rem' }}>
            <div>
              Last phase completed: <strong>{snapshots[snapshots.length - 1]?.completedPhase}</strong>
            </div>
            <div>
              Recorded at tick {snapshots[snapshots.length - 1]?.tick} (Day {snapshots[snapshots.length - 1]?.day})
            </div>
          </div>
        )}
        <button style={{ marginTop: '0.75rem' }} onClick={exportSnapshots} type="button">
          Export snapshots to log
        </button>
      </section>
    </main>
  );
};

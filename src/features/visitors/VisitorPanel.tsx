import { useCallback, useMemo, type CSSProperties } from 'react';
import { useConfigStore, useLoggerStore, useTelemetry } from '@/app/providers';
import { useVisitorStore } from './visitorStore';

const panelStyle: CSSProperties = {
  border: '1px solid #d0d0d0',
  borderRadius: '0.5rem',
  padding: '1rem',
  background: '#fafafa',
  display: 'grid',
  gap: '0.75rem'
};

const progressTrackStyle: CSSProperties = {
  height: '0.5rem',
  borderRadius: '999px',
  overflow: 'hidden',
  background: '#e0e0e0'
};

const progressFill = (color: string, percent: number): CSSProperties => ({
  width: `${Math.min(100, Math.max(0, percent))}%`,
  height: '100%',
  background: color
});

export const VisitorPanel = () => {
  const ticksToSeconds = useConfigStore((state) => state.ticksToSeconds);

  const {
    activeVisitor,
    queue,
    talk,
    offer,
    refuse,
    talkTimeCostTicks,
    spawnIntervalTicks,
    basePatienceTicks
  } = useVisitorStore((state) => ({
    activeVisitor: state.activeVisitor,
    queue: state.queue,
    talk: state.talk,
    offer: state.offer,
    refuse: state.refuse,
    talkTimeCostTicks: state.talkTimeCostTicks,
    spawnIntervalTicks: state.spawnIntervalTicks,
    basePatienceTicks: state.config.basePatienceTicks
  }));

  const logEvent = useLoggerStore((state) => state.log);
  const telemetry = useTelemetry();

  const queueLength = queue.length;

  const visitorDetails = useMemo(() => {
    if (!activeVisitor) {
      return null;
    }

    const patienceSeconds = ticksToSeconds(activeVisitor.patience);
    const patiencePercent = basePatienceTicks > 0 ? Math.min(100, (activeVisitor.patience / basePatienceTicks) * 100) : 0;

    return {
      patienceSeconds,
      patiencePercent,
      satisfactionPercent: Math.min(100, activeVisitor.satisfaction),
      latestEntries: [...activeVisitor.log].reverse().slice(0, 4)
    };
  }, [activeVisitor, basePatienceTicks, ticksToSeconds]);

  const handleTalk = useCallback(() => {
    const outcome = talk();
    if (!outcome) {
      return;
    }

    const { visitor, satisfaction, satisfactionDelta, remainingPatience, dialogueLine, departureReason } = outcome;

    logEvent(
      'info',
      'visitor.action.talk',
      {
        visitorId: visitor.id,
        templateId: visitor.templateId,
        satisfaction,
        satisfactionDelta,
        remainingPatience,
        dialogueLine,
        departureReason
      },
      ['visitors']
    );

    telemetry.track(
      'visitor.action.talk',
      {
        visitorId: visitor.id,
        templateId: visitor.templateId,
        satisfaction,
        satisfactionDelta,
        remainingPatience,
        dialogueLine,
        departureReason
      },
      ['visitors']
    );
  }, [logEvent, talk, telemetry]);

  const handleOffer = useCallback(() => {
    const outcome = offer();
    if (!outcome) {
      return;
    }

    const { visitor, satisfaction, satisfactionDelta, departureReason } = outcome;

    logEvent(
      'info',
      'visitor.action.offer',
      {
        visitorId: visitor.id,
        templateId: visitor.templateId,
        satisfaction,
        satisfactionDelta,
        departureReason
      },
      ['visitors']
    );

    telemetry.track(
      'visitor.action.offer',
      {
        visitorId: visitor.id,
        templateId: visitor.templateId,
        satisfaction,
        satisfactionDelta,
        departureReason
      },
      ['visitors']
    );
  }, [logEvent, offer, telemetry]);

  const handleRefuse = useCallback(() => {
    const outcome = refuse();
    if (!outcome) {
      return;
    }

    const { visitor, satisfaction, satisfactionDelta } = outcome;

    logEvent(
      'warn',
      'visitor.action.refuse',
      {
        visitorId: visitor.id,
        templateId: visitor.templateId,
        satisfaction,
        satisfactionDelta
      },
      ['visitors']
    );

    telemetry.track(
      'visitor.action.refuse',
      {
        visitorId: visitor.id,
        templateId: visitor.templateId,
        satisfaction,
        satisfactionDelta
      },
      ['visitors']
    );
  }, [logEvent, refuse, telemetry]);

  return (
    <section style={panelStyle}>
      <header>
        <h2 style={{ margin: 0 }}>Visitor Interactions</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#555', fontSize: '0.9rem' }}>
          Manage the Phase 3 visitor slice. Talk time costs ~{ticksToSeconds(talkTimeCostTicks).toFixed(1)}s; arrivals every
          ~{ticksToSeconds(spawnIntervalTicks).toFixed(1)}s while the shop is open.
        </p>
      </header>

      {activeVisitor ? (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div>
            <strong>{activeVisitor.persona.codename}</strong>
            <span style={{ color: '#666' }}> — {activeVisitor.persona.formalName}</span>
            <p style={{ margin: '0.25rem 0 0', color: '#555' }}>{activeVisitor.persona.appearance}</p>
            <p style={{ margin: '0.25rem 0 0', color: '#555' }}>{activeVisitor.persona.greeting}</p>
          </div>

          <div style={{ color: '#444', fontSize: '0.9rem' }}>
            <div>Need: {activeVisitor.need.summary}</div>
            <div>Item hint: {activeVisitor.need.itemHint}</div>
            <div>Honesty flag: {activeVisitor.honesty}</div>
            <div>Queue waiting: {queueLength}</div>
          </div>

          {visitorDetails && (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Satisfaction</div>
                <div style={progressTrackStyle}>
                  <div style={progressFill('#4a90e2', visitorDetails.satisfactionPercent)} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                  {Math.round(activeVisitor.satisfaction)} / 100
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Patience (~seconds)</div>
                <div style={progressTrackStyle}>
                  <div style={progressFill('#f5a623', visitorDetails.patiencePercent)} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                  {visitorDetails.patienceSeconds.toFixed(1)}s remaining
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={handleTalk}>
              Talk
            </button>
            <button type="button" onClick={handleOffer}>
              Buy
            </button>
            <button type="button" onClick={handleRefuse}>
              Refuse
            </button>
          </div>

          {visitorDetails && visitorDetails.latestEntries.length > 0 && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Interaction Log</div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#444', fontSize: '0.85rem' }}>
                {visitorDetails.latestEntries.map((entry) => (
                  <li key={entry.id}>
                    <span style={{ textTransform: 'capitalize' }}>{entry.action}</span>: {entry.summary}{' '}
                    <span style={{ color: '#666' }}>(Satisfaction → {Math.round(entry.satisfactionAfter)})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div style={{ color: '#555' }}>
          <p style={{ margin: 0 }}>No visitor is currently active.</p>
          <p style={{ margin: '0.25rem 0 0' }}>
            The arrival manager queues a new visitor roughly every {ticksToSeconds(spawnIntervalTicks).toFixed(1)} seconds of day phase time.
          </p>
          {queueLength > 0 && <p style={{ margin: '0.25rem 0 0' }}>Queue size: {queueLength}</p>}
        </div>
      )}
    </section>
  );
};

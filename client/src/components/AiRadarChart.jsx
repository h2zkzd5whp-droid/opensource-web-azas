import React, { useState, useEffect } from 'react';
import { animate } from 'framer-motion';
import styles from '../styles/AiRadarChart.module.css';

export default function AiRadarChart({ data, forceShow = false }) {
  const [currR, setCurrR] = useState(0);
  const [currP, setCurrP] = useState(0);
  const [currM, setCurrM] = useState(0);
  const [currS, setCurrS] = useState(0);

  // 부모에게서 받은 forceShow(시퀀스 제어용)가 true가 되면 내부 showChart도 true로
  const [showChart, setShowChart] = useState(false);
  const [animateTrigger, setAnimateTrigger] = useState(0);

  useEffect(() => {
    if (forceShow) Promise.resolve().then(() => setShowChart(true)); //연쇄 렌더링 차단
  }, [forceShow]);

  const rScore = data?.readability ?? 0;
  const pScore = data?.performance ?? 0;
  const mScore = data?.maintainability ?? 0;
  const sScore = data?.safety ?? 0;

  const cx = 100;
  const cy = 105;
  const rMax = 65;

  useEffect(() => {
    if (showChart) {
      const speed = 2.5; 
      const base = 1.2;
      const config = { ease: [0.25, 1, 0.5, 1] };

      const animR = animate(0, rScore, { ...config, duration: (rScore/100)*speed + base, onUpdate: (val) => setCurrR(val) });
      const animP = animate(0, pScore, { ...config, duration: (pScore/100)*speed + base, onUpdate: (val) => setCurrP(val) });
      const animM = animate(0, mScore, { ...config, duration: (mScore/100)*speed + base, onUpdate: (val) => setCurrM(val) });
      const animS = animate(0, sScore, { ...config, duration: (sScore/100)*speed + base, onUpdate: (val) => setCurrS(val) });

      return () => { animR.stop(); animP.stop(); animM.stop(); animS.stop(); };
    }
  }, [showChart, animateTrigger, rScore, pScore, mScore, sScore]);

  const pRead = { x: cx, y: cy - (currR / 100) * rMax };
  const pPerf = { x: cx + (currP / 100) * rMax, y: cy };
  const pMaint = { x: cx, y: cy + (currM / 100) * rMax };
  const pSafe = { x: cx - (currS / 100) * rMax, y: cy };
  const polyPoints = `${pRead.x},${pRead.y} ${pPerf.x},${pPerf.y} ${pMaint.x},${pMaint.y} ${pSafe.x},${pSafe.y}`;

  return (
    <div className={styles.dashboardCard}>
      <div className={styles.headerRow}>
        <h4 className={styles.dashboardTitle}>AI 정밀 코드 품질 진단</h4>
      </div>
      <div className={styles.chartContainer}>
        <svg viewBox="0 0 200 210" className={styles.chartSvg}>
          {[25, 50, 75, 100].map(lvl => {
            const r = (lvl / 100) * rMax;
            return <polygon key={lvl} className={styles.gridLine} points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`} />
          })}
          <line x1={cx} y1={cy - rMax} x2={cx} y2={cy + rMax} className={styles.axisLine} />
          <line x1={cx - rMax} y1={cy} x2={cx + rMax} y2={cy} className={styles.axisLine} />
          <g style={{ opacity: showChart ? 1 : 0, transition: 'opacity 0.5s' }}>
            <polygon className={styles.chartPolygon} points={polyPoints} />
            <circle cx={pRead.x} cy={pRead.y} r="3.5" className={styles.chartPoint} />
            <circle cx={pPerf.x} cy={pPerf.y} r="3.5" className={styles.chartPoint} />
            <circle cx={pMaint.x} cy={pMaint.y} r="3.5" className={styles.chartPoint} />
            <circle cx={pSafe.x} cy={pSafe.y} r="3.5" className={styles.chartPoint} />
            <text x={cx} y={cy - rMax - 14} textAnchor="middle" className={styles.chartLabel}>가독성</text>
            <text x={cx} y={cy - rMax - 4} textAnchor="middle" className={styles.chartValue}>{rScore}</text>
            <text x={cx + rMax + 8} y={cy - 2} textAnchor="start" className={styles.chartLabel}>성능</text>
            <text x={cx + rMax + 8} y={cy + 10} textAnchor="start" className={styles.chartValue}>{pScore}</text>
            <text x={cx} y={cy + rMax + 12} textAnchor="middle" className={styles.chartLabel}>유지보수</text>
            <text x={cx} y={cy + rMax + 22} textAnchor="middle" className={styles.chartValue}>{mScore}</text>
            <text x={cx - rMax - 8} y={cy - 2} textAnchor="end" className={styles.chartLabel}>성능</text>
            <text x={cx - rMax - 8} y={cy + 10} textAnchor="end" className={styles.chartValue}>{sScore}</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
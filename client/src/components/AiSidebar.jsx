import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TAG_THEMES } from '../hooks/useAiAssistant';
import styles from '../styles/AiSidebar.module.css';
import AiRadarChart from './AiRadarChart';

export default function AiSidebar({ 
  activeTab, 
  onTabChange,
  aiData, 
  aiLoading, 
  aiError, 
  setAiError,
  highlightEditorLine,
  highlightedTag,
  selectedErrorIdx,     
  setSelectedErrorIdx,  
  triggerAiExplainer,
  triggerStyleReviewer,
  errorLog
}) {

  const renderParsedExplanation = (text) => {
    if (!text) return [];
    const segments = text.split(/###/);
    const blocks = [];
    
    segments.forEach((seg) => {
      if (!seg.trim()) return;
      const tagMatch = seg.match(/\[TAG:(\d+)\]/);
      if (tagMatch) {
        const tagNum = parseInt(tagMatch[1], 10);
        const lines = seg.split('\n');
        const titleLine = lines[0].trim();
        const bodyText = lines.slice(1).join('\n').trim();
        
        blocks.push({ id: tagNum, isTag: true, title: titleLine, body: bodyText });
      } else {
        blocks.push({ id: `gen-${blocks.length}`, isTag: false, title: '', body: seg.trim() });
      }
    });
    return blocks;
  };

  const renderBlockBody = (body, localErrorObj) => {
    const lines = body.split('\n');
    return lines.map((line, lIdx) => {
      let processedLine = line.trim();
      if (!processedLine) return <div key={lIdx} style={{ height: '6px' }} />;
      
      const isBullet = processedLine.startsWith('-');
      if (isBullet) processedLine = processedLine.substring(1).trim();
      
      const parts = processedLine.split(/(\*\*.*?\*\*)/g);
      const content = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ color: '#e2e2f0', fontWeight: '700' }}>{part.slice(2, -2)}</strong>;
        }
        
        const tagParts = part.split(/(\[TAG:\d+\])/g);
        return tagParts.map((tPart, tIdx) => {
          if (tPart.match(/^\[TAG:(\d+)\]$/)) {
            const num = parseInt(tPart.match(/\d+/)[0], 10);
            const theme = TAG_THEMES[(num - 1) % TAG_THEMES.length] || TAG_THEMES[0];
            return (
              <span key={tIdx} className={`inline-block px-1 py-0.2 mx-0.5 text-[10px] font-bold rounded border ${theme.badge}`}>
                tag {num}
              </span>
            );
          }
          return tPart;
        });
      });
      
      if (isBullet) {
        return (
          <li key={lIdx} style={{ listStyleType: 'disc', marginLeft: '14px', marginBottom: '4px', fontSize: '12px', color: '#aaa', lineHeight: '1.6' }}>
            {content}
          </li>
        );
      }
      return <p key={lIdx} style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#aaa', lineHeight: '1.6' }}>{content}</p>;
    });
  };

  useEffect(() => {
    if (!highlightedTag) return;
    const targetElement = document.querySelector(`[data-tag-element="${highlightedTag}"]`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedTag]);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('초정밀 검사 매뉴얼에 의거하여 코드를 진단하는 중입니다...');

  useEffect(() => {
    if (!aiLoading) {
      //비동기 격리
      const syncTimer = setTimeout(() => {
        setLoadingProgress(0);
        setLoadingMessage('초정밀 검사 매뉴얼에 의거하여 코드를 진단하는 중입니다...');
      }, 0);
      return () => clearTimeout(syncTimer);
    }

    //게이지 증가 (뒤로 갈수록 느려짐)
    const progressTimer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev < 30) return prev + 2;       
        if (prev < 60) return prev + 0.9;     
        if (prev < 85) return prev + 0.4;     
        if (prev < 98.5) return prev + 0.05;  
        return prev;                           
      });
    }, 200);

    //로딩 메시지 순차 변경 (시간 경과에 따라 교체)
    let textStage = 0;
    const messageTimer = setInterval(() => {
      textStage += 1;
      if (textStage === 1) setLoadingMessage('추출된 구문 트리를 기반으로 정적 분석을 진행하고 있습니다...');
      if (textStage === 2) setLoadingMessage('잠재적 예외 케이스 및 가독성 지표를 연산 중입니다...');
      if (textStage >= 3) setLoadingMessage('분석 결과를 보기 쉽게 시각화 대시보드로 정리하고 있습니다...');
    }, 4500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [aiLoading]);

  const actionButtonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#1e1e2e',
    color: '#a78bfa',
    border: '1px solid #4c1d95',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  };

  const styleStep = aiData?.style?.step || (aiData?.style?.annotations ? 3 : 0);
  const errorList = aiData.explain?.errors || [];
  const currentError = errorList[selectedErrorIdx];

  return (
    <div className={styles.page}>
      {/* 상단 탭 패널 */}
      <div className={styles.tab}>
        {['explain', 'style'].map((tab) => {
          const label = tab === 'explain' ? '에러 분석' : '스타일 리뷰';
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab} onClick={() => onTabChange(tab)}
              className={`${styles.tabbtn} ${isSelected ? styles['is-selected'] || 'is-selected' : ''}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {/* 메인 컨텐츠 영역 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px', scrollBehavior: 'smooth' }}>
        {aiLoading ? (
          <div className={styles.progressWrapper} style={{ padding: '20px 8px', marginTop: '20px' }}>
            <div className={styles.progressTrack}>
              <motion.div className={styles.progressBar} animate={{ width: `${loadingProgress}%` }} transition={{ duration: 0.3, ease: "easeOut" }} />
            </div>
            <p style={{ fontSize: '11px', color: '#a78bfa', marginTop: '12px', textAlign: 'center', lineHeight: 1.6 }}>{loadingMessage}</p>
          </div>
        ) : aiError ? (
          <div 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', gap: '8px' }}>
            <div style={{ backgroundColor: '#2e1414', border: '0.5px solid rgba(247, 137, 137, 0.3)', borderRadius: '8px', padding: '14px', textAlign: 'center', width: '100%' }}>
              <p style={{ fontSize: '12px', color: '#f87171', fontWeight: 600, marginBottom: '6px' }}>{aiError}</p>
            </div>
            <button onClick={() => setAiError(null)} style={{ width: '100%', padding: '8px', backgroundColor: '#1e1e2e', color: '#888', border: '0.5px solid #2a2a3e', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>확인</button>
          </div>
        ) : (
          <motion.div key={activeTab} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.15 }} style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px', minWidth: 0 }}>
            
            {activeTab === 'explain' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
                <button style={actionButtonStyle} onClick={() => triggerAiExplainer(errorLog)}>
                  {errorList.length > 0 ? '에러 분석 재요청' : '에러 분석 시작'}
                </button>
                
                {errorList.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: '#09090f', padding: '8px', borderRadius: '8px', border: '0.5px solid #2a2a3e' }}>
                      <span style={{ fontSize: '10px', color: '#6e6e80', paddingLeft: '4px', fontWeight: 'bold' }}>검출된 결함 리스트 ({errorList.length}개)</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {errorList.map((err, idx) => {
                          const isCurrent = idx === selectedErrorIdx;
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedErrorIdx(idx)}
                              style={{
                                width: '100%',
                                padding: '12px',
                                textAlign: 'left', 
                                background: isCurrent ? 'rgba(248, 113, 113, 0.08)' : '#141423',
                                border: isCurrent ? '1px solid #f87171' : '1px solid #2a2a3e',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: isCurrent ? '#f87171' : '#a6adc8',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>Line {err.errorLine}</div>
                              <div>{err.errorCause}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 선택된 현재 순번의 에러 단건 분석 렌더링 */}
                    {currentError && (
                      <>
                        <div style={{ backgroundColor: '#2e1414', border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '12px' }}>
                          <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: 'rgba(248,113,113,0.15)', color: '#f87171', fontSize: '10px', fontWeight: 600, marginBottom: '6px' }}>
                            LINE {currentError.errorLine} 핵심 탐지 리포트
                          </div>
                          <p style={{ fontSize: '12px', color: '#e2e2f0', lineHeight: 1.6, margin: 0 }}>{currentError.errorCause}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                          <h4 style={{ fontSize: '11px', color: '#6e6e80', fontWeight: 500, margin: 0 }}>AI 정밀 추적 분석 가이드</h4>
                          
                          {renderParsedExplanation(currentError.explanation).map((block) => {
                            if (!block.isTag) {
                              return <div key={block.id} style={{ fontSize: '12px', color: '#aaa', padding: '2px' }}>{renderBlockBody(block.body, currentError)}</div>;
                            }

                            const theme = TAG_THEMES[(block.id - 1) % TAG_THEMES.length] || TAG_THEMES[0];
                            const isSelected = highlightedTag === block.id;
                            const mapping = currentError.tagMappings?.find(m => m.tag === `[TAG:${block.id}]`);
                            const cleanTitle = block.title.replace(`[TAG:${block.id}]`, '').trim();

                            return (
                              <motion.div
                                key={block.id}
                                data-tag-element={block.id}
                                onClick={() => {
                                  if (mapping?.line) {
                                    highlightEditorLine(mapping.line, 'bg-purple-500/10 border-l-4 border-purple-500');
                                  }
                                }}
                                style={{
                                  backgroundColor: isSelected ? 'rgba(30, 27, 75, 0.4)' : '#0e0e14',
                                  border: isSelected ? '1px solid rgba(139, 92, 246, 0.5)' : '0.5px solid #2a2a3e',
                                  borderRadius: '8px',
                                  padding: '12px',
                                  cursor: 'pointer',
                                  scrollMargin: '20px',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                  <span className={`px-1.5 py-0.5 text-[10px] font-black rounded border ${theme.badge}`}>tag {block.id}</span>
                                  <span style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '600' }}>{cleanTitle}</span>
                                </div>
                                <div style={{ paddingLeft: '2px' }}>{renderBlockBody(block.body, currentError)}</div>
                              </motion.div>
                            );
                          })}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                          <h4 style={{ fontSize: '11px', color: '#6e6e80', fontWeight: 500, margin: 0 }}>추천 해결 프로세스</h4>
                          <div style={{ backgroundColor: '#11131e', padding: '12px', borderRadius: '8px', border: '0.5px solid #1e293b' }}>
                            <div style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.6 }}>{renderBlockBody(currentError.solution, currentError)}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a5a5b3', fontSize: '12px', textAlign: 'center', gap: '6px', padding: '40px 0' }}>
                    <p>종합 정적 진단 실행 버튼을 누르면 코드 내부의</p>
                    <p>모든 잠재 결함을 전수 파싱하여 검출합니다.</p>
                    <p>Run을 완료한 상태에서 시도해주세요.</p>
                  </div>
                )}
              </div>
            )}

            {/* 스타일 리뷰 패널 */}
            {activeTab === 'style' && (
              <div className={styles.resultSection}>
                <button onClick={() => { if (!aiLoading) triggerStyleReviewer(); }} disabled={aiLoading} style={actionButtonStyle}>
                  {aiData.style ? '코드 스타일 재분석' : '코드 스타일 분석 시작'}
                </button>
                {!aiLoading && aiData.style && (
                  <>
                    <motion.div className={styles.metricBarGroup} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginTop: '12px' }}>
                      <h4 className={styles.dashboardTitle} style={{ fontSize: '12px', color: '#e2e2f0', marginBottom: '4px' }}>실시간 지표 분석 결과</h4>
                      {['readability', 'performance', 'maintainability', 'safety'].map((key, i) => {
                        const titles = { readability: '가독성', performance: '성능효율성', maintainability: '유지보수성', safety: '예외안정성' };
                        return (
                          <div key={key} style={{ marginBottom: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>
                              <span>{titles[key]}</span>
                              <span style={{ fontWeight: 'bold', color: '#a78bfa' }}>{aiData.style[key]}점</span>
                            </div>
                            <div className={styles.progressTrack} style={{ height: '5px', background: '#1a1a2e' }}>
                              <motion.div className={styles.progressBar} initial={{ width: 0 }} animate={{ width: `${aiData.style[key]}%` }} transition={{ duration: 1.4, delay: i * 0.15, ease: [0.25, 1, 0.5, 1] }} />
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                    {styleStep >= 2 && <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}><AiRadarChart data={aiData.style} forceShow={true} /></motion.div>}
                    {styleStep >= 3 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                        <h4 style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600, borderBottom: '0.5px solid #2a2a3e', paddingBottom: '6px', margin: 0 }}>매뉴얼 기반 상세 정밀 피드백</h4>
                        {Object.entries(aiData.style.annotations || {}).map(([category, list]) => {
                          const sectorTitles = { readability: '가독성 분석 피드백', performance: '성능 효율성 분석 피드백', maintainability: '유지보수성 분석 피드백', safety: '예외 안정성 분석 피드백' };
                          const sectorColors = { readability: '#38bdf8', performance: '#34d399', maintainability: '#a78bfa', safety: '#f87171' };
                          return (list.length > 0 && <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><div style={{ fontSize: '11px', fontWeight: 'bold', color: sectorColors[category] || '#aaa', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '4px 10px', borderRadius: '4px', borderLeft: `3px solid ${sectorColors[category] || '#aaa'}`, marginTop: '6px', letterSpacing: '0.02em' }}>{sectorTitles[category] || category.toUpperCase()}</div>{list.map((ann, annIdx) => <motion.div key={`${category}-${annIdx}`} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: annIdx * 0.08 }} style={{ backgroundColor: '#111122', border: ann.severity === 'warning' ? '0.5px solid #d97706' : '0.5px solid #2563eb', borderRadius: '8px', padding: '12px', cursor: 'pointer' }} onClick={() => highlightEditorLine(ann.line)}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}><span style={{ color: ann.severity === 'warning' ? '#fbbf24' : '#60a5fa', fontSize: '11px', fontWeight: 'bold', background: ann.severity === 'warning' ? 'rgba(217,119,6,0.15)' : 'rgba(37,99,235,0.15)', padding: '2px 6px', borderRadius: '4px' }}>Line {ann.line} • {ann.severity === 'warning' ? '경고(Warning)' : '추천(Info)'}</span></div><p style={{ fontSize: '12px', color: '#dddde0', margin: 0, lineHeight: 1.5 }}>{ann.message}</p></motion.div>)}</div>);
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
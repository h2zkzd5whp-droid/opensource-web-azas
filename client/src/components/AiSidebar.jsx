import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence} from 'framer-motion';
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
  triggerAiExplainer,
  triggerStyleReviewer,
  triggerCodeOptimizer,
  errorLog
}) {
  
  const renderParsedExplanation = (text) => {
    if (!text) return null;
    const regex = /(\[TAG:\d+\])/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.match(/^\[TAG:(\d+)\]$/)) {
        const tagNum = parseInt(part.match(/\d+/)[0], 10);
        const theme = TAG_THEMES[(tagNum - 1) % TAG_THEMES.length];
        return (
          <span key={index} className={`inline-block px-1.5 py-0.5 mx-1 text-xs font-bold rounded border ${theme.badge}`}>
            태그 {tagNum}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('초정밀 검사 매뉴얼에 의거하여 코드를 진단하는 중입니다...');

  useEffect(() => {
    if (!aiLoading) {
      setLoadingProgress(0);
      setLoadingMessage('초정밀 검사 매뉴얼에 의거하여 코드를 진단하는 중입니다...');
      return;
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
  return (
  <div className={styles.page}>
    {/* 상단 탭 패널 */}
    <div className={styles.tab}>
      {['explain', 'style', 'optimize'].map((tab) => {
        const label =
          tab === 'explain' ? '에러 분석' : tab === 'style' ? '스타일 리뷰' : '코드 최적화';
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
    <div 
      style={{ flex: 1, overflow: 'auto', padding: '12px' }}
    >
      {aiLoading && activeTab !== 'style' ? (
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#555',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid #2a2a3e',
              borderTopColor: '#a78bfa',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ fontSize: '11px', color: '#555', textAlign: 'center', lineHeight: 1.6 }}>
            AI가 소스코드를 분석 중입니다...
          </p>
        </div>
      ) : aiError ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            gap: '8px',
          }}
        >
          <div
            style={{
              backgroundColor: '#2e1414',
              border: '0.5px solid rgba(247, 137, 137, 0.3)',
              borderRadius: '8px',
              padding: '14px',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: '#f87171',
                fontWeight: 600,
                marginBottom: '6px',
              }}
            >
              {aiError}
            </p>
            <p style={{ fontSize: '11px', color: '#555' }}>
              아래 재요청 버튼을 눌러 다시 분석을 요청하세요.
            </p>
          </div>
          <button
            onClick={() => setAiError(null)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#1e1e2e',
              color: '#888',
              border: '0.5px solid #2a2a3e',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            확인
          </button>
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.15 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: '10px',
            minWidth: 0,
          }}
        >
          {/* ── AI 분석 엔진 라벨 ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '2px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#a78bfa',
                animation: 'pulse 2s infinite',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '11px', color: '#555' }}>AI 분석 엔진</span>
          </div>

          {/*에러 분석 패널 */}
          {activeTab === 'explain' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
              {/*개별 호출 버튼 장착 */}
              <button 
                style={actionButtonStyle} 
                onClick={() => triggerAiExplainer(errorLog || '정상 실행 완료 (잠재적 에러 없음)')}
              >
                {aiData.explain ? '에러 분석 재요청' : '에러 분석 실행'}
              </button>

              {aiData.explain ? (
                <>
                  <div
                    style={{
                      backgroundColor: '#2e1414',
                      border: '0.5px solid rgba(248,113,113,0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(248,113,113,0.15)',
                        color: '#f87171',
                        fontSize: '10px',
                        fontWeight: 600,
                        marginBottom: '6px',
                        letterSpacing: '0.03em',
                      }}
                    >
                      LINE {aiData.explain.line} 예외 검출 확인
                    </div>
                    <p style={{ fontSize: '12px', color: '#e2e2f0', lineHeight: 1.6 }}>
                      {aiData.explain.errorCause}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <h4 style={{ fontSize: '11px', color: '#555', fontWeight: 500 }}>
                      AI 정밀 추적 분석 가이드
                    </h4>
                    <div
                      style={{
                        backgroundColor: '#0e0e14',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '0.5px solid #2a2a3e',
                      }}
                    >
                      <p 
                      style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.6 }}
                      >
                        {renderParsedExplanation(aiData.explain.explanation)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3a3a55',
                    fontSize: '12px',
                    textAlign: 'center',
                    gap: '6px',
                    lineHeight: 1.6,
                    padding: '40px 0'
                  }}
                >
                  <p>위 버튼을 누르면 컴파일 에러 로그를 기반으로</p>
                  <p>원인을 정밀 진단하여 심층 분석합니다.</p>
                </div>
              )}
            </div>
          )}

          {/*스타일 리뷰 패널 */}
          {activeTab === 'style' && (
            <div className={styles.resultSection}>
              {!aiLoading && !aiData.style && (
                <button 
                  onClick={() => {
                    if (aiLoading) return; //이미 로딩 중이면 클릭 함수 강제 종료
                    triggerStyleReviewer();
                  }}
                  disabled={aiLoading} //HTML에서도 비활성화
                  style={{ width: '100%', padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  코드 스타일 분석 시작
                </button>
              )}

              {/* 로딩 상태 진행바 */}
              {aiLoading && (
                <div className={styles.progressWrapper}>
                  <div className={styles.progressTrack}>
                    <motion.div 
                      className={styles.progressBar}
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }} 
                      style={{ position: 'relative' }}
                    >
                      <motion.div 
                        className={styles.pingPongBall}
                        animate={{ y: [0, -14, 0] }}
                        transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.div>
                    {/*로딩 메시지*/}
                    <p style={{ fontSize: '11px', color: '#a78bfa', marginBottom: '10px', textAlign: 'center', minHeight: '16px' }}>
                      {loadingMessage}
                    </p>
                  </div>
                </div>
              )}

              {!aiLoading && aiData.style && (
                <>
                  <motion.div 
                    className={styles.metricBarGroup}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
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
                            <motion.div 
                              className={styles.progressBar}
                              initial={{ width: 0 }}
                              animate={{ width: `${aiData.style[key]}%` }}
                              transition={{ duration: 1.4, delay: i * 0.15, ease: [0.25, 1, 0.5, 1] }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>

                  {styleStep >= 2 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.93 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <AiRadarChart data={aiData.style} forceShow={true} />
                    </motion.div>
                  )}

                  {/*개선 피드백*/}
                  {styleStep >= 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                      <h4 style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600, borderBottom: '0.5px solid #2a2a3e', paddingBottom: '6px', margin: 0 }}>
                        매뉴얼 기반 상세 정밀 피드백
                      </h4>
                      
                      {Object.entries(aiData.style.annotations || {}).map(([category, list]) => {
                        const sectorTitles = {
                          readability: '가독성 분석 피드백',
                          performance: '성능 효율성 분석 피드백',
                          maintainability: '유지보수성 분석 피드백',
                          safety: '예외 안정성 분석 피드백'
                        };
                        const sectorColors = {
                          readability: '#38bdf8',   // 하늘색
                          performance: '#34d399',   // 초록색
                          maintainability: '#a78bfa', // 보라색
                          safety: '#f87171'         // 빨간색
                        };
                        return (
                          list.length > 0 && (
                            <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div 
                                style={{ 
                                  fontSize: '11px', 
                                  fontWeight: 'bold', 
                                  color: sectorColors[category] || '#aaa',
                                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  borderLeft: `3px solid ${sectorColors[category] || '#aaa'}`,
                                  marginTop: '6px',
                                  letterSpacing: '0.02em'
                                }}
                              >
                                {sectorTitles[category] || category.toUpperCase()}
                              </div>
                              {list.map((ann, annIdx) => (
                                <motion.div
                                  key={`${category}-${annIdx}`}
                                  initial={{ opacity: 0, y: -12 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: annIdx * 0.08 }}
                                  className={styles.feedbackCard}
                                  onClick={() => highlightEditorLine(ann.line)}
                                  style={{
                                    backgroundColor: '#111122', 
                                    border: ann.severity === 'warning' ? '0.5px solid #d97706' : '0.5px solid #2563eb', 
                                    borderRadius: '8px', 
                                    padding: '12px', 
                                    cursor: 'pointer'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ color: ann.severity === 'warning' ? '#fbbf24' : '#60a5fa', fontSize: '11px', fontWeight: 'bold', background: ann.severity === 'warning' ? 'rgba(217,119,6,0.15)' : 'rgba(37,99,235,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                                      Line {ann.line} • {ann.severity === 'warning' ? '경고(Warning)' : '추천(Info)'}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: '12px', color: '#dddde0', margin: 0, lineHeight: 1.5 }}>
                                    {ann.message}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          )
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/*코드 최적화 패널 */}
            {activeTab === 'optimize' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
                {/*개별 호출 버튼 장착 */}
                <button style={actionButtonStyle} onClick={triggerCodeOptimizer}>
                  {aiData.optimize ? '알고리즘 최적화 재요청' : '코드 알고리즘 최적화 실행'}
                </button>

                {aiData.optimize ? (
                  <>
                    {/* 복잡도 비교 카드 */}
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <div
                        style={{
                          flex: 1,
                          backgroundColor: '#0e0e14',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '0.5px solid #2a2a3e',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>
                          기존 알고리즘
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#f87171' }}>
                          {aiData.optimize.currentComplexity}
                        </div>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          backgroundColor: '#0e0e14',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '0.5px solid #2a2a3e',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>
                          리팩토링 후
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#34d399' }}>
                          {aiData.optimize.optimizedComplexity}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                      <h4 style={{ fontSize: '11px', color: '#555', fontWeight: 500 }}>
                        구조 설계 변경 사항 내역
                      </h4>
                      <div
                        style={{
                          backgroundColor: '#0e0e14',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '0.5px solid #2a2a3e',
                        }}
                      >
                        <p
                        style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.6 }}
                        >
                          {aiData.optimize.description}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3a3a55',
                      fontSize: '12px',
                      textAlign: 'center',
                      gap: '6px',
                      padding: '40px 0'
                    }}
                  >
                    <p>위 버튼을 누르면 빅오(Big-O) 시간 및 공간 복잡도를</p>
                    <p>연산하여 최적화 및 리팩토링 구조를 추천합니다.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
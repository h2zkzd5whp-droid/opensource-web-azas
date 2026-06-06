import { motion } from 'framer-motion';
import { TAG_THEMES } from '../hooks/useAiAssistant';
import styles from '../styles/AiSidebar.module.css';

export default function AiSidebar({ 
  activeTab, 
  onTabChange,
  aiData, 
  aiLoading, 
  aiError, 
  setAiError,
  applySuggestedCode, 
  highlightEditorLine
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
              className={`${styles.tabbtn} ${isSelected ? 'is-selected': '' }`}>
              {label}
            </button>
          );
        })}
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div
        style={{ flex: 1, overflow: 'auto', padding: '12px' }}
      >
        {aiLoading ? (
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
                border: '0.5px solid rgba(248,113,113,0.3)',
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
                상단 Run 버튼을 눌러 다시 분석을 요청하세요.
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

            {/* [1] 에러 분석 패널 */}
            {activeTab === 'explain' &&
              (aiData.explain ? (
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
                  }}
                >
                  <p>상단 ▶ Run 버튼을 누르면</p>
                  <p>실행 결과와 함께 모든 AI 분석이 시작됩니다.</p>
                </div>
              ))}

            {/* [2] 스타일 리뷰 패널 */}
            {activeTab === 'style' &&
              (aiData.style ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
                  {/* 점수 카드 */}
                  <div
                    style={{
                      background: '#1e1e2e',
                      padding: '14px',
                      borderRadius: '8px',
                      border: '0.5px solid #2a2a3e',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>
                      코드 품질 서식 점수
                    </div>
                    <div
                      style={{
                        fontSize: '28px',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {aiData.style.score}
                      <span style={{ fontSize: '14px', color: '#555', WebkitTextFillColor: '#555' }}>
                        {' '}/ 100
                      </span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '11px', color: '#555', fontWeight: 500 }}>
                    구문 분석 개선점 피드백
                  </h4>

                  {aiData.style.annotations?.map((ann, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        highlightEditorLine(ann.line, 'bg-amber-500/10 border-l-4 border-amber-500')
                      }
                      style={{
                        backgroundColor: '#0e0e14',
                        border: '0.5px solid #2a2a3e',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '5px',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#a78bfa',
                          }}
                        >
                          <span
                            style={{
                              background: '#1e1e3e',
                              color: '#a78bfa',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              fontSize: '10px',
                            }}
                          >
                            L{ann.line}
                          </span>
                        </span>
                        <span
                          style={{
                            padding: '1px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 500,
                            background:
                              ann.severity === 'warning'
                                ? 'rgba(245,158,11,0.15)'
                                : 'rgba(56,189,248,0.15)',
                            color: ann.severity === 'warning' ? '#f59e0b' : '#38bdf8',
                          }}
                        >
                          {ann.severity}
                        </span>
                      </div>
                      <p
                        style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.6 }}
                      >
                        {ann.message}
                      </p>
                    </div>
                  ))}
                </div>
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
                  }}
                >
                  <p>상단 ▶ Run 버튼을 누르면</p>
                  <p>자동으로 코드 스타일 가이드 리뷰를 진행합니다.</p>
                </div>
              ))}

            {/* [3] 코드 최적화 패널 */}
            {activeTab === 'optimize' &&
              (aiData.optimize ? (
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
                  }}
                >
                  <p>상단 ▶ Run 버튼을 누르면</p>
                  <p>빅오(Big-O) 시간 복잡도 연산 효율성을 진단합니다.</p>
                </div>
              ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
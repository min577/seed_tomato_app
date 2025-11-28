import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Dimensions,
} from 'react-native';

// ===== API 함수 import =====
import { getPriceCompare, getPriceHistory } from '../services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;

// 날짜 포맷 헬퍼
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parts[1]}/${parts[2]}`;
};

// ⭐ 한국어 날짜 포맷 (예: 11월 27일 수요일)
const formatKoreanDate = (dateStr) => {
  if (!dateStr) return '날짜 없음';
  try {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}월 ${day}일 (${dayOfWeek})`;
  } catch (e) {
    return dateStr;
  }
};

// ⭐ 상대 날짜 표시 (오늘, 어제, n일 전)
const getRelativeDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const dataDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dataDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((today - dataDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays > 1 && diffDays <= 7) return `${diffDays}일 전`;
    return '';
  } catch (e) {
    return '';
  }
};

// ========== 가격 비교 탭 ==========
const PriceCompareTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // ✅ API 함수 사용 (캐시 방지 내장)
      const json = await getPriceCompare();
      setData(json);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError('데이터를 불러올 수 없습니다');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 상품 상세 링크 열기
  const openProductLink = (link) => {
    if (link) {
      Linking.openURL(link);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>가격 정보 조회 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
          <Text style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ws = data?.wholesale_summary || {};
  const online = data?.online_summary || {};
  const onlineDetail = data?.online_detail || [];
  
  // ⭐ 날짜 정보
  const dataDate = data?.data_date || data?.date;
  const relativeDate = getRelativeDate(dataDate);
  const isToday = data?.is_today;

  return (
    <ScrollView
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
    >
      {/* ⭐ 업데이트 상태 표시 */}
      <View style={styles.updateStatusBar}>
        <View style={styles.updateInfo}>
          <Text style={styles.updateLabel}>📅 도매가 기준일</Text>
          <View style={styles.dateRow}>
            <Text style={styles.updateDate}>{formatKoreanDate(dataDate)}</Text>
            {relativeDate && (
              <View style={[
                styles.relativeBadge,
                isToday ? styles.todayBadge : styles.pastBadge
              ]}>
                <Text style={[
                  styles.relativeText,
                  isToday ? styles.todayText : styles.pastText
                ]}>
                  {relativeDate}
                </Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* ⭐ 휴장일 안내 (오늘 데이터가 아닌 경우) */}
      {!isToday && dataDate && (
        <View style={styles.noticeBar}>
          <Text style={styles.noticeText}>
            ⚠️ 일요일/공휴일은 휴장으로, 가장 최근 영업일 시세입니다
          </Text>
        </View>
      )}

      {/* 도매 시세 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏪 가락시장 도매가 (kg당)</Text>
        
        <View style={styles.priceGrid}>
          <View style={styles.priceCard}>
            <Text style={styles.gradeLabel}>상품</Text>
            <Text style={styles.priceValue}>
              {ws.high?.toLocaleString() || '-'}원
            </Text>
          </View>
          <View style={styles.priceCard}>
            <Text style={styles.gradeLabel}>중품</Text>
            <Text style={styles.priceValue}>
              {ws.mid?.toLocaleString() || '-'}원
            </Text>
          </View>
          <View style={[styles.priceCard, styles.cherryCard]}>
            <Text style={styles.gradeLabel}>방울토마토</Text>
            <Text style={styles.priceValue}>
              {ws.cherry?.toLocaleString() || '-'}원
            </Text>
          </View>
        </View>
      </View>

      {/* 온라인 최저가 - 완숙토마토 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛒 완숙토마토 온라인 최저가</Text>
        <Text style={styles.subText}>실시간 검색 · 1kg 기준</Text>
        
        <View style={styles.lowestCard}>
          <Text style={styles.lowestMall}>{online.lowest_mall || '-'}</Text>
          <Text style={styles.lowestPrice}>
            {online.lowest_price?.toLocaleString() || '-'}원/kg
          </Text>
          <Text style={styles.mallCount}>
            {online.mall_count || 0}개 판매처 비교
          </Text>
          
          {online.lowest_link && (
            <TouchableOpacity 
              style={styles.linkButton} 
              onPress={() => openProductLink(online.lowest_link)}
            >
              <Text style={styles.linkButtonText}>🔗 상품 상세 보기</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 판매처별 상세 - 완숙토마토 */}
      {onlineDetail.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍅 완숙토마토 판매처별 가격</Text>
          <Text style={styles.tapHint}>탭하면 상품 페이지로 이동합니다</Text>
          
          {onlineDetail.slice(0, 10).map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.mallRow}
              onPress={() => openProductLink(item.link)}
              activeOpacity={0.7}
              disabled={!item.link}
            >
              <View style={styles.mallInfo}>
                <Text style={styles.mallRank}>{idx + 1}</Text>
                <View style={styles.mallNameContainer}>
                  <Text style={styles.mallName} numberOfLines={1}>
                    {item.mall}
                  </Text>
                  {item.title && (
                    <Text style={styles.productTitle} numberOfLines={1}>
                      {item.title.replace(/<[^>]*>/g, '')}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.mallPriceRow}>
                <Text style={styles.mallPrice}>
                  {item.min_price_per_kg?.toLocaleString() || item.price_per_kg?.toLocaleString() || item.price?.toLocaleString()}원/kg
                </Text>
                {item.link && <Text style={styles.linkIcon}>🔗</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 마진율 비교 */}
      {data?.comparison?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 등급별 마진율</Text>
          <Text style={styles.subText}>온라인 최저가 ÷ 도매가</Text>
          
          {data.comparison.map((grade, idx) => (
            <View key={idx} style={styles.marginCard}>
              <View style={styles.marginHeader}>
                <Text style={styles.marginGrade}>{grade.grade}</Text>
              </View>
              <View style={styles.marginRow}>
                <Text style={styles.marginLabel}>도매가</Text>
                <Text style={styles.marginValue}>
                  {grade.wholesale_price?.toLocaleString()}원/kg
                </Text>
              </View>
              <View style={styles.marginRow}>
                <Text style={[styles.marginLabel, { color: '#2E7D32' }]}>온라인 최저</Text>
                <View style={styles.marginPriceRow}>
                  <Text style={styles.marginValue}>
                    {grade.online_lowest?.toLocaleString()}원
                  </Text>
                  <Text style={[
                    styles.marginRate,
                    { color: grade.margin_rate > 50 ? '#E53935' : '#2E7D32' }
                  ]}>
                    {grade.margin_rate > 0 ? '+' : ''}{grade.margin_rate}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ⭐ 마지막 업데이트 시간 */}
      <View style={styles.footerInfo}>
        <Text style={styles.footerText}>
          마지막 조회: {lastUpdated?.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </ScrollView>
  );
};

// ========== 툴팁 컴포넌트 ==========
const PriceTooltip = ({ visible, data, position, onClose }) => {
  if (!visible || !data) return null;
  
  return (
    <TouchableOpacity 
      style={styles.tooltipOverlay} 
      activeOpacity={1} 
      onPress={onClose}
    >
      <View style={[
        styles.tooltipBox,
        { 
          left: Math.min(Math.max(position.x - 70, 10), SCREEN_WIDTH - 160),
          top: Math.max(position.y - 100, 10),
        }
      ]}>
        <View style={styles.tooltipArrow} />
        <Text style={styles.tooltipDate}>📅 {formatKoreanDate(data.date)}</Text>
        <View style={styles.tooltipDivider} />
        {data.high !== null && data.high !== undefined && data.high > 0 && (
          <View style={styles.tooltipRow}>
            <View style={[styles.tooltipDot, { backgroundColor: '#E53935' }]} />
            <Text style={styles.tooltipLabel}>상품</Text>
            <Text style={styles.tooltipValue}>{data.high?.toLocaleString()}원/kg</Text>
          </View>
        )}
        {data.mid !== null && data.mid !== undefined && data.mid > 0 && (
          <View style={styles.tooltipRow}>
            <View style={[styles.tooltipDot, { backgroundColor: '#FB8C00' }]} />
            <Text style={styles.tooltipLabel}>중품</Text>
            <Text style={styles.tooltipValue}>{data.mid?.toLocaleString()}원/kg</Text>
          </View>
        )}
        {data.cherry !== null && data.cherry !== undefined && data.cherry > 0 && (
          <View style={styles.tooltipRow}>
            <View style={[styles.tooltipDot, { backgroundColor: '#E91E63' }]} />
            <Text style={styles.tooltipLabel}>방울</Text>
            <Text style={styles.tooltipValue}>{data.cherry?.toLocaleString()}원/kg</Text>
          </View>
        )}
        <Text style={styles.tooltipHint}>다른 곳을 터치하면 닫힘</Text>
      </View>
    </TouchableOpacity>
  );
};

// ========== 점선 그래프 컴포넌트 ==========
const LineChart = ({ data, maxValue, onPointPress }) => {
  if (!data || data.length === 0) return null;
  
  const chartWidth = Math.max(SCREEN_WIDTH - 80, data.length * 50);
  const chartHeight = 200;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  
  const yMax = Math.ceil(maxValue * 1.15 / 100) * 100;
  const yMin = 0;
  
  const getY = (value) => {
    if (!value || value === 0) return null;
    return paddingTop + graphHeight - ((value - yMin) / (yMax - yMin)) * graphHeight;
  };
  
  const getX = (idx) => {
    if (data.length === 1) return paddingLeft + graphWidth / 2;
    return paddingLeft + (idx * graphWidth) / (data.length - 1);
  };

  const highPoints = data.map((item, idx) => ({
    x: getX(idx),
    y: getY(item.high),
    value: item.high,
    date: item.date,
    dataIndex: idx,
  })).filter(p => p.y !== null);

  const midPoints = data.map((item, idx) => ({
    x: getX(idx),
    y: getY(item.mid),
    value: item.mid,
    date: item.date,
    dataIndex: idx,
  })).filter(p => p.y !== null);

  return (
    <View style={[styles.chartWrapper, { width: chartWidth, height: chartHeight }]}>
      {/* Y축 라벨 */}
      <Text style={[styles.yLabel, { top: paddingTop - 8 }]}>{yMax.toLocaleString()}</Text>
      <Text style={[styles.yLabel, { top: paddingTop + graphHeight / 2 - 8 }]}>{Math.round(yMax / 2).toLocaleString()}</Text>
      <Text style={[styles.yLabel, { top: paddingTop + graphHeight - 8 }]}>0</Text>
      
      {/* 가로 점선 */}
      {[0, 0.5, 1].map((ratio, i) => (
        <View 
          key={i}
          style={[
            styles.gridLine, 
            { 
              top: paddingTop + graphHeight * ratio,
              left: paddingLeft,
              width: graphWidth,
            }
          ]} 
        />
      ))}
      
      {/* 상품 라인 (빨강) */}
      {highPoints.map((point, idx) => (
        <React.Fragment key={`high-line-${idx}`}>
          {idx < highPoints.length - 1 && (() => {
            const nextPoint = highPoints[idx + 1];
            const dx = nextPoint.x - point.x;
            const dy = nextPoint.y - point.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            return (
              <View
                style={[
                  styles.chartLine,
                  {
                    left: point.x,
                    top: point.y - 1,
                    width: length,
                    backgroundColor: '#E53935',
                    transform: [{ rotate: `${angle}deg` }],
                  }
                ]}
              />
            );
          })()}
        </React.Fragment>
      ))}
      
      {/* 중품 라인 (주황) */}
      {midPoints.map((point, idx) => (
        <React.Fragment key={`mid-line-${idx}`}>
          {idx < midPoints.length - 1 && (() => {
            const nextPoint = midPoints[idx + 1];
            const dx = nextPoint.x - point.x;
            const dy = nextPoint.y - point.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            return (
              <View
                style={[
                  styles.chartLine,
                  {
                    left: point.x,
                    top: point.y - 1,
                    width: length,
                    backgroundColor: '#FB8C00',
                    transform: [{ rotate: `${angle}deg` }],
                  }
                ]}
              />
            );
          })()}
        </React.Fragment>
      ))}
      
      {/* 상품 점 (빨강) - 터치 가능 */}
      {highPoints.map((point, idx) => (
        <TouchableOpacity
          key={`high-dot-${idx}`}
          style={[
            styles.chartDotTouchable,
            {
              left: point.x - 18,
              top: point.y - 18,
            }
          ]}
          onPress={() => onPointPress && onPointPress(data[point.dataIndex], { x: point.x, y: point.y })}
          activeOpacity={0.7}
        >
          <View style={[styles.chartDot, { backgroundColor: '#E53935' }]} />
        </TouchableOpacity>
      ))}
      
      {/* 중품 점 (주황) - 터치 가능 */}
      {midPoints.map((point, idx) => (
        <TouchableOpacity
          key={`mid-dot-${idx}`}
          style={[
            styles.chartDotTouchable,
            {
              left: point.x - 18,
              top: point.y - 18,
            }
          ]}
          onPress={() => onPointPress && onPointPress(data[point.dataIndex], { x: point.x, y: point.y })}
          activeOpacity={0.7}
        >
          <View style={[styles.chartDot, { backgroundColor: '#FB8C00' }]} />
        </TouchableOpacity>
      ))}
      
      {/* X축 라벨 */}
      {data.map((item, idx) => (
        <Text 
          key={idx} 
          style={[
            styles.xLabel,
            { 
              left: getX(idx) - 20,
              top: paddingTop + graphHeight + 10,
            }
          ]}
        >
          {formatDisplayDate(item.date)}
        </Text>
      ))}
    </View>
  );
};

// ========== 가격 추이 탭 ==========
const PriceHistoryTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  
  // 툴팁 상태
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const quickOptions = [
    { label: '1주일', days: 7 },
    { label: '2주일', days: 14 },
    { label: '1개월', days: 30 },
  ];

  const fetchData = async (days) => {
    setLoading(true);
    setError(null);
    setTooltipVisible(false);
    
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      
      const startStr = formatDate(start);
      const endStr = formatDate(end);
      
      // ✅ API 함수 사용 (캐싱 허용)
      const json = await getPriceHistory(startStr, endStr);
      
      if (json.error) {
        throw new Error(json.error);
      }
      
      setData(json);
    } catch (e) {
      console.error('Price history fetch error:', e);
      setError(`데이터를 불러올 수 없습니다`);
      setData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(selectedPeriod);
  }, []);

  const handlePeriodSelect = (days) => {
    setSelectedPeriod(days);
    fetchData(days);
  };

  // 점 터치 시 툴팁 표시
  const handlePointPress = (pointData, position) => {
    setTooltipData(pointData);
    setTooltipPosition(position);
    setTooltipVisible(true);
  };

  const maxValue = data?.data?.reduce((max, item) => {
    return Math.max(max, item.high || 0, item.mid || 0);
  }, 0) || 0;

  return (
    <ScrollView style={styles.tabContent}>
      {/* 기간 선택 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 조회 기간</Text>
        
        <View style={styles.quickSelect}>
          {quickOptions.map((opt) => (
            <TouchableOpacity
              key={opt.days}
              style={[
                styles.quickBtn,
                selectedPeriod === opt.days && styles.quickBtnActive
              ]}
              onPress={() => handlePeriodSelect(opt.days)}
            >
              <Text style={[
                styles.quickBtnText,
                selectedPeriod === opt.days && styles.quickBtnTextActive
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 로딩 */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>가격 데이터 조회 중...</Text>
        </View>
      )}

      {/* 에러 */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData(selectedPeriod)}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 점선 그래프 */}
      {!loading && !error && data?.data?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 가격 추이</Text>
          <Text style={styles.subText}>{data.count || data.data.length}일간 데이터 (단위: 원/kg)</Text>
          
          {/* 범례 */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E53935' }]} />
              <Text style={styles.legendText}>상품</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FB8C00' }]} />
              <Text style={styles.legendText}>중품</Text>
            </View>
          </View>
          
          {/* 터치 힌트 */}
          <View style={styles.chartHintBox}>
            <Text style={styles.chartHint}>💡 점을 터치하면 정확한 가격을 확인할 수 있어요!</Text>
          </View>
          
          {/* 그래프 + 툴팁 컨테이너 */}
          <View style={styles.chartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart 
                data={data.data} 
                maxValue={maxValue} 
                onPointPress={handlePointPress}
              />
            </ScrollView>
            
            {/* 툴팁 */}
            <PriceTooltip
              visible={tooltipVisible}
              data={tooltipData}
              position={tooltipPosition}
              onClose={() => setTooltipVisible(false)}
            />
          </View>
        </View>
      )}

      {/* 가격 목록 */}
      {!loading && !error && data?.data?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 일별 가격</Text>
          
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableCellDate]}>날짜</Text>
            <Text style={[styles.tableCell, styles.tableCellPrice]}>상품</Text>
            <Text style={[styles.tableCell, styles.tableCellPrice]}>중품</Text>
            <Text style={[styles.tableCell, styles.tableCellPrice]}>방울</Text>
          </View>
          
          {data.data.slice().reverse().map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellDate]}>
                {formatDisplayDate(item.date)}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellPrice, styles.priceHigh]}>
                {item.high?.toLocaleString() || '-'}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellPrice, styles.priceMid]}>
                {item.mid?.toLocaleString() || '-'}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellPrice]}>
                {item.cherry?.toLocaleString() || '-'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* 통계 */}
      {!loading && !error && data?.stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 기간 통계</Text>
          
          {data.stats.high && (
            <View style={styles.statsCard}>
              <Text style={styles.statsGrade}>🔴 상품</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>최저</Text>
                  <Text style={[styles.statValue, { color: '#1E88E5' }]}>{data.stats.high.min?.toLocaleString()}원</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>최고</Text>
                  <Text style={[styles.statValue, { color: '#E53935' }]}>{data.stats.high.max?.toLocaleString()}원</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>평균</Text>
                  <Text style={styles.statValue}>{data.stats.high.avg?.toLocaleString()}원</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>변동</Text>
                  <Text style={[
                    styles.statValue,
                    { color: data.stats.high.change > 0 ? '#E53935' : data.stats.high.change < 0 ? '#1E88E5' : '#666' }
                  ]}>
                    {data.stats.high.change > 0 ? '↑' : data.stats.high.change < 0 ? '↓' : ''}{Math.abs(data.stats.high.change)?.toLocaleString()}원
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          {data.stats.mid && (
            <View style={styles.statsCard}>
              <Text style={styles.statsGrade}>🟠 중품</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>최저</Text>
                  <Text style={[styles.statValue, { color: '#1E88E5' }]}>{data.stats.mid.min?.toLocaleString()}원</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>최고</Text>
                  <Text style={[styles.statValue, { color: '#E53935' }]}>{data.stats.mid.max?.toLocaleString()}원</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>평균</Text>
                  <Text style={styles.statValue}>{data.stats.mid.avg?.toLocaleString()}원</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>변동</Text>
                  <Text style={[
                    styles.statValue,
                    { color: data.stats.mid.change > 0 ? '#E53935' : data.stats.mid.change < 0 ? '#1E88E5' : '#666' }
                  ]}>
                    {data.stats.mid.change > 0 ? '↑' : data.stats.mid.change < 0 ? '↓' : ''}{Math.abs(data.stats.mid.change)?.toLocaleString()}원
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* 데이터 없음 */}
      {!loading && !error && (!data?.data || data.data.length === 0) && (
        <View style={styles.emptyContainer}>
          <Text style={styles.noDataText}>📭 해당 기간에 데이터가 없습니다</Text>
          <Text style={styles.noDataSubText}>일요일/공휴일은 휴장입니다</Text>
        </View>
      )}
    </ScrollView>
  );
};

// ========== 메인 화면 ==========
const MarketPriceScreen = () => {
  const [activeTab, setActiveTab] = useState('compare');

  return (
    <View style={styles.container}>
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'compare' && styles.activeTab]}
          onPress={() => setActiveTab('compare')}
        >
          <Text style={[styles.tabText, activeTab === 'compare' && styles.activeTabText]}>
            💰 가격 비교
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            📈 가격 추이
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'compare' ? <PriceCompareTab /> : <PriceHistoryTab />}
    </View>
  );
};

// ========== 스타일 ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#E53935',
  },
  tabText: {
    fontSize: 15,
    color: '#666',
  },
  activeTabText: {
    color: '#E53935',
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
  },
  
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    margin: 12,
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    color: '#E53935',
    fontSize: 15,
    textAlign: 'center',
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
  },
  noDataSubText: {
    color: '#999',
    fontSize: 13,
    marginTop: 4,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#E53935',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // ⭐ 업데이트 상태 바
  updateStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  updateInfo: {
    flex: 1,
  },
  updateLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  updateDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  relativeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadge: {
    backgroundColor: '#E8F5E9',
  },
  pastBadge: {
    backgroundColor: '#FFF3E0',
  },
  relativeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  todayText: {
    color: '#2E7D32',
  },
  pastText: {
    color: '#F57C00',
  },
  refreshBtn: {
    padding: 10,
  },
  refreshIcon: {
    fontSize: 24,
  },
  
  // ⭐ 휴장일 안내
  noticeBar: {
    backgroundColor: '#FFF8E1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
  },
  noticeText: {
    fontSize: 13,
    color: '#F57C00',
    textAlign: 'center',
  },
  
  // ⭐ 푸터 정보
  footerInfo: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subText: {
    fontSize: 13,
    color: '#666',
    marginTop: -8,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    marginTop: -8,
    marginBottom: 12,
  },
  
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  priceCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cherryCard: {
    backgroundColor: '#FFEBEE',
    minWidth: '100%',
  },
  gradeLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E53935',
  },
  
  lowestCard: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  lowestMall: {
    fontSize: 14,
    color: '#666',
  },
  lowestPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    marginVertical: 8,
  },
  mallCount: {
    fontSize: 13,
    color: '#999',
  },
  linkButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2E7D32',
    borderRadius: 25,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  mallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    marginBottom: 4,
    borderRadius: 8,
  },
  mallInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mallRank: {
    width: 28,
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
  mallNameContainer: {
    flex: 1,
  },
  mallName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  productTitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  mallPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mallPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E53935',
  },
  linkIcon: {
    fontSize: 16,
  },
  linkIconSmall: {
    fontSize: 12,
    marginLeft: 4,
  },
  tapHint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  
  marginCard: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  marginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  marginGrade: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  marginSize: {
    fontSize: 13,
    color: '#999',
  },
  marginRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  marginLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marginLabel: {
    fontSize: 13,
    color: '#666',
  },
  marginValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  marginPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  marginRate: {
    fontSize: 13,
    fontWeight: '600',
  },
  estimated: {
    fontSize: 11,
    color: '#999',
  },
  
  quickSelect: {
    flexDirection: 'row',
    gap: 10,
  },
  quickBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
  },
  quickBtnActive: {
    backgroundColor: '#E53935',
  },
  quickBtnText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  quickBtnTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  
  chartHintBox: {
    backgroundColor: '#FFF8E1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  chartHint: {
    fontSize: 13,
    color: '#F57C00',
    fontWeight: '500',
  },
  
  chartContainer: {
    position: 'relative',
  },
  
  chartWrapper: {
    position: 'relative',
    marginVertical: 10,
  },
  yLabel: {
    position: 'absolute',
    left: 0,
    width: 45,
    fontSize: 11,
    color: '#888',
    textAlign: 'right',
    paddingRight: 5,
  },
  xLabel: {
    position: 'absolute',
    width: 40,
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  chartDotTouchable: {
    position: 'absolute',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  chartDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  
  tooltipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  tooltipBox: {
    position: 'absolute',
    backgroundColor: 'rgba(33, 33, 33, 0.95)',
    borderRadius: 12,
    padding: 14,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(33, 33, 33, 0.95)',
  },
  tooltipDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  tooltipDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tooltipDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  tooltipLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    width: 35,
  },
  tooltipValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'right',
  },
  tooltipHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 6,
  },
  
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    fontSize: 13,
    color: '#333',
  },
  tableCellDate: {
    flex: 1,
    fontWeight: '500',
  },
  tableCellPrice: {
    flex: 1,
    textAlign: 'right',
  },
  priceHigh: {
    color: '#E53935',
    fontWeight: '600',
  },
  priceMid: {
    color: '#FB8C00',
    fontWeight: '600',
  },
  
  statsCard: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  statsGrade: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default MarketPriceScreen;
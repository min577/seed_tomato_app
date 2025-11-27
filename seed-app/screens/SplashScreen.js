import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  // 애니메이션 값들
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const plantHeight = useRef(new Animated.Value(0)).current;
  const leafScale = useRef(new Animated.Value(0)).current;
  const waterDrop1 = useRef(new Animated.Value(-50)).current;
  const waterDrop2 = useRef(new Animated.Value(-50)).current;
  const waterDrop3 = useRef(new Animated.Value(-50)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. 로고 나타나기
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. 식물 자라기 (1초 후)
    setTimeout(() => {
      Animated.timing(plantHeight, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      // 3. 잎 펼치기
      setTimeout(() => {
        Animated.spring(leafScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();
      }, 500);
    }, 1000);

    // 4. 물방울 떨어지기 (반복)
    const waterAnimation = () => {
      Animated.loop(
        Animated.stagger(300, [
          Animated.sequence([
            Animated.timing(waterDrop1, {
              toValue: 200,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(waterDrop1, {
              toValue: -50,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(waterDrop2, {
              toValue: 200,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(waterDrop2, {
              toValue: -50,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(waterDrop3, {
              toValue: 200,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(waterDrop3, {
              toValue: -50,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };
    waterAnimation();

    // 5. 로딩 텍스트
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(loadingOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3초 후 종료
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const plantHeightInterpolate = plantHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  return (
    <View style={styles.container}>
      {/* 로고 */}
      <Animated.View
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Text style={styles.logoText}>SEED</Text>
        <Text style={styles.logoSubtitle}>FARM</Text>
      </Animated.View>

      {/* 식물 컨테이너 */}
      <View style={styles.plantContainer}>
        {/* 물뿌리개 아이콘 */}
        <View style={styles.wateringCan}>
          <Text style={styles.wateringIcon}>💧</Text>
          
          {/* 물방울들 */}
          <Animated.View
            style={[
              styles.waterDrop,
              { transform: [{ translateY: waterDrop1 }] },
            ]}
          />
          <Animated.View
            style={[
              styles.waterDrop,
              { left: 10, transform: [{ translateY: waterDrop2 }] },
            ]}
          />
          <Animated.View
            style={[
              styles.waterDrop,
              { left: 20, transform: [{ translateY: waterDrop3 }] },
            ]}
          />
        </View>

        {/* 식물 줄기 */}
        <Animated.View
          style={[
            styles.stem,
            { height: plantHeightInterpolate },
          ]}
        >
          {/* 왼쪽 잎 */}
          <Animated.View
            style={[
              styles.leaf,
              styles.leafLeft,
              { transform: [{ scale: leafScale }, { rotate: '-45deg' }] },
            ]}
          />
          {/* 오른쪽 잎 */}
          <Animated.View
            style={[
              styles.leaf,
              styles.leafRight,
              { transform: [{ scale: leafScale }, { rotate: '135deg' }] },
            ]}
          />
        </Animated.View>

        {/* 흙 */}
        <View style={styles.soil} />

        {/* 화분 */}
        <View style={styles.pot}>
          <View style={styles.potTop} />
        </View>
      </View>

      {/* 로딩 텍스트 */}
      <Animated.View style={{ opacity: loadingOpacity }}>
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
  },
  logo: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoText: {
    fontSize: 64,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 4,
  },
  logoSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    letterSpacing: 6,
  },
  plantContainer: {
    position: 'relative',
    width: 300,
    height: 300,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  wateringCan: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -30,
    zIndex: 10,
  },
  wateringIcon: {
    fontSize: 60,
    textAlign: 'center',
  },
  waterDrop: {
    position: 'absolute',
    top: 60,
    left: 0,
    width: 10,
    height: 10,
    backgroundColor: '#64B5F6',
    borderRadius: 5,
  },
  stem: {
    position: 'absolute',
    bottom: 140,
    width: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    zIndex: 2,
  },
  leaf: {
    position: 'absolute',
    width: 50,
    height: 60,
    backgroundColor: '#4CAF50',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 50,
  },
  leafLeft: {
    left: -40,
    top: 30,
  },
  leafRight: {
    right: -40,
    top: 50,
  },
  soil: {
    position: 'absolute',
    bottom: 120,
    width: 160,
    height: 30,
    backgroundColor: '#4A2511',
    borderRadius: 80,
    zIndex: 1,
  },
  pot: {
    position: 'relative',
    width: 180,
    height: 120,
    backgroundColor: '#654321',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  potTop: {
    position: 'absolute',
    top: -20,
    left: -10,
    right: -10,
    height: 40,
    backgroundColor: '#8B4513',
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 3,
    fontWeight: '600',
  },
});

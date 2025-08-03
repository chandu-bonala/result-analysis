import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const screen = Dimensions.get('window');
const logoSize = screen.width < 400 ? 120 : 140;

export default function SplashScreen({ navigation }: any) {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(50)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(100)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  
  // Loading dots animation
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Loading dots animation loop
    const animateLoadingDots = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.parallel([
            Animated.timing(dot1Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(dot2Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(dot3Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
        ])
      ).start();
    };

    // Splash screen animation sequence
    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      // Text entrance with delay
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          delay: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textAnim, {
          toValue: 0,
          duration: 600,
          delay: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      // Button entrance
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          delay: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(buttonAnim, {
          toValue: 0,
          friction: 6,
          tension: 100,
          delay: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Start loading dots animation after main animation completes
      animateLoadingDots();
    });
  }, []);

  const handleGetStarted = () => {
    navigation.replace('Notification');
  };

  return (
    <LinearGradient
      colors={["#e0e7ff", "#f1f5f9"]}
      style={styles.container}
    >
      {/* Background Decorative Elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: logoAnim,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoWrapper}>
            <Image
              source={require('../assets/image.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.logoGlow} />
          </View>
        </Animated.View>

        {/* Text Section */}
        <Animated.View
          style={[
            styles.textSection,
            {
              opacity: textOpacity,
              transform: [{ translateY: textAnim }],
            },
          ]}
        >
          <Text style={styles.appTitle}>Sir C R Reddy</Text>
          <Text style={styles.appSubtitle}>College of Engineering</Text>
          <View style={styles.dividerLine} />
          <Text style={styles.appTagline}>Excellence in Education</Text>
          <Text style={styles.appVersion}>Student Portal v1.0</Text>
        </Animated.View>

        {/* Loading Indicator */}
        <Animated.View
          style={[
            styles.loadingSection,
            {
              opacity: textOpacity,
            },
          ]}
        >
          <View style={styles.loadingDots}>
            <Animated.View 
              style={[
                styles.dot, 
                styles.dot1,
                {
                  opacity: dot1Anim,
                  transform: [{ 
                    scale: dot1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  }],
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.dot, 
                styles.dot2,
                {
                  opacity: dot2Anim,
                  transform: [{ 
                    scale: dot2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  }],
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.dot, 
                styles.dot3,
                {
                  opacity: dot3Anim,
                  transform: [{ 
                    scale: dot3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  }],
                }
              ]} 
            />
          </View>
          <Text style={styles.loadingText}>Loading your experience...</Text>
        </Animated.View>

        {/* Bottom Section */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonAnim }],
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.getStartedButton} 
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  circle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
  },
  circle3: {
    position: 'absolute',
    top: '40%',
    right: -100,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: logoSize,
    height: logoSize,
    borderRadius: logoSize / 2,
    borderWidth: 4,
    borderColor: '#2563eb',
    backgroundColor: '#fff',
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 15,
  } as any,
  logoGlow: {
    position: 'absolute',
    width: logoSize + 20,
    height: logoSize + 20,
    borderRadius: (logoSize + 20) / 2,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    top: -10,
    left: -10,
    zIndex: -1,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1e3a8a',
    marginBottom: 8,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  appSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  dividerLine: {
    width: 80,
    height: 3,
    backgroundColor: '#2563eb',
    borderRadius: 1.5,
    marginBottom: 16,
  },
  appTagline: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  appVersion: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  loadingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginHorizontal: 4,
  },
  dot1: {
    // Placeholder for dot animation
  },
  dot2: {
    // Placeholder for dot animation
  },
  dot3: {
    // Placeholder for dot animation
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    minWidth: 160,
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
});

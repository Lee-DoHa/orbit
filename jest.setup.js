// Mock expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('react-native-reanimated', () => {
  return {
    default: {
      call: jest.fn(),
      createAnimatedComponent: (component) => component,
      addWhitelistedNativeProps: jest.fn(),
      addWhitelistedUIProps: jest.fn(),
    },
    useSharedValue: jest.fn((init) => ({ value: init })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((toValue) => toValue),
    withRepeat: jest.fn((animation) => animation),
    withSequence: jest.fn((...animations) => animations[0]),
    Easing: { inOut: jest.fn(), bezier: jest.fn() },
    FadeIn: { duration: jest.fn(() => ({ delay: jest.fn() })) },
    FadeOut: { duration: jest.fn() },
  };
});

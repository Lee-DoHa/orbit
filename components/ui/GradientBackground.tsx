import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function GradientBackground({ children, style }: Props) {
  const { colors, isDark } = useTheme();

  if (!isDark) {
    return (
      <View style={[styles.container, style]}>
        <LinearGradient
          colors={['#F8F7F4', '#FBF9F5', '#FFF5EE']}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    );
  }

  // Dark mode: layered gradients for atmospheric depth
  return (
    <View style={[styles.container, style]}>
      {/* Base layer: deep indigo to near-black */}
      <LinearGradient
        colors={['#0E1225', '#0C0F1A', '#0A0C15']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Warm accent at the top — very subtle */}
      <LinearGradient
        colors={['rgba(232, 185, 81, 0.03)', 'transparent']}
        locations={[0, 0.35]}
        style={StyleSheet.absoluteFill}
      />
      {/* Violet vignette from bottom corners */}
      <LinearGradient
        colors={['transparent', 'rgba(99, 102, 241, 0.04)']}
        locations={[0.6, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

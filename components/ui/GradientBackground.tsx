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
    // Light mode: clean flat background with a very subtle warm gradient
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }, style]}>
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[
        colors.background.primary,
        colors.background.secondary,
        colors.background.tertiary,
      ]}
      locations={[0, 0.5, 1]}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

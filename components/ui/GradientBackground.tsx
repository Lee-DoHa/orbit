import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '@/theme/tokens';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function GradientBackground({ children, style }: Props) {
  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary, colors.background.tertiary]}
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

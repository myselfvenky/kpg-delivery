import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function QuantityStepper(props: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const theme = useTheme();
  const qty = Math.max(0, Math.trunc(props.quantity));

  return (
    <ThemedView type="backgroundSelected" style={styles.container}>
      <Pressable
        disabled={qty === 0}
        onPress={props.onDecrement}
        style={({ pressed }) => [
          styles.btn,
          { opacity: qty === 0 ? 0.4 : pressed ? 0.7 : 1 },
        ]}>
        <Text style={[styles.btnText, { color: theme.text }]}>−</Text>
      </Pressable>

      <View style={styles.qtyWrap}>
        <Text style={[styles.qty, { color: theme.text }]}>{qty}</Text>
      </View>

      <Pressable onPress={props.onIncrement} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
        <Text style={[styles.btnText, { color: theme.text }]}>+</Text>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.five,
    overflow: 'hidden',
  },
  btn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  btnText: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '700',
  },
  qtyWrap: {
    minWidth: 34,
    alignItems: 'center',
  },
  qty: {
    fontSize: 14,
    fontWeight: '700',
  },
});


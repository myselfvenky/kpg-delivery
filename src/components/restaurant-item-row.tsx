import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import type { RestaurantItem } from '@/api/types';
import { QuantityStepper } from '@/components/quantity-stepper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCartStore } from '@/store/use-cart-store';
import { formatCurrencyBaht } from '@/utils/format';

export function RestaurantItemRow(props: { item: RestaurantItem }) {
  const theme = useTheme();
  const qty = useCartStore((s) => s.quantitiesByItemId[props.item.id] ?? 0);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      {props.item.imageUrl ? (
        <Image source={{ uri: props.item.imageUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, { backgroundColor: theme.muted }]} />
      )}

      <View style={styles.content}>
        <View style={styles.textBlock}>
          <ThemedText type="smallBold" numberOfLines={2}>
            {props.item.name}
          </ThemedText>
          {props.item.description ? (
            <ThemedText themeColor="textSecondary" type="small" numberOfLines={2}>
              {props.item.description}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.bottomRow}>
          <ThemedText type="smallBold">{formatCurrencyBaht(props.item.price)}</ThemedText>
          <QuantityStepper
            quantity={qty}
            onIncrement={() => increment(props.item.id)}
            onDecrement={() => decrement(props.item.id)}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.four,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: Spacing.three,
  },
  content: {
    flex: 1,
    gap: Spacing.two,
  },
  textBlock: {
    gap: Spacing.half,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});


import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Restaurant } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useFavoritesStore } from '@/store/use-favorites-store';
import { formatDistanceKm, formatMinutes } from '@/utils/format';

export function RestaurantCard(props: { restaurant: Restaurant; onPress: () => void }) {
  const theme = useTheme();
  const isFav = useFavoritesStore((s) => s.isFavorite(props.restaurant.id));
  const toggle = useFavoritesStore((s) => s.toggleFavorite);

  const subtitleParts = [
    formatMinutes(props.restaurant.deliveryTimeMinutes),
    formatDistanceKm(props.restaurant.distanceKm),
  ].filter(Boolean);

  return (
    <Pressable onPress={props.onPress} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.imageWrap}>
          {props.restaurant.imageUrl ? (
            <Image source={{ uri: props.restaurant.imageUrl }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={[styles.image, { backgroundColor: theme.muted }]} />
          )}
          <Pressable
            onPress={() => toggle(props.restaurant.id)}
            hitSlop={10}
            style={({ pressed }) => [
              styles.favButton,
              { backgroundColor: theme.background },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.favText, { color: isFav ? '#E11D48' : theme.text }]}>
              {isFav ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {props.restaurant.name}
          </ThemedText>
          {props.restaurant.description ? (
            <ThemedText themeColor="textSecondary" type="small" numberOfLines={2}>
              {props.restaurant.description}
            </ThemedText>
          ) : null}

          <View style={styles.metaRow}>
            {props.restaurant.rating !== undefined ? (
              <View style={styles.metaPill}>
                <Text style={[styles.star, { color: theme.text }]}>★</Text>
                <ThemedText type="small" style={styles.metaText}>
                  {props.restaurant.rating.toFixed(1)}
                </ThemedText>
              </View>
            ) : null}

            {subtitleParts.length ? (
              <ThemedText themeColor="textSecondary" type="small">
                {subtitleParts.join(' • ')}
              </ThemedText>
            ) : null}
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  card: {
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
  },
  favButton: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favText: {
    fontSize: 16,
    lineHeight: 18,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  metaRow: {
    marginTop: Spacing.one,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  star: {
    fontSize: 12,
    lineHeight: 14,
  },
  metaText: {
    lineHeight: 18,
  },
});

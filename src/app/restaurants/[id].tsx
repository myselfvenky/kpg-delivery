import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';

import type { Restaurant, RestaurantItem } from '@/api/types';
import { RestaurantItemRow } from '@/components/restaurant-item-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StateView } from '@/components/ui/state-view';
import { Spacing } from '@/constants/theme';
import { useRestaurantItems } from '@/hooks/use-restaurant-items';
import { useTheme } from '@/hooks/use-theme';
import { useFavoritesStore } from '@/store/use-favorites-store';

type Row =
  | { type: 'header'; id: string; title: string }
  | { type: 'item'; id: string; item: RestaurantItem };

function useRestaurantFromCache(id: number): Restaurant | undefined {
  const queryClient = useQueryClient();
  const entries = queryClient.getQueriesData({
    queryKey: ['restaurants'],
    exact: false,
  });

  for (const [, data] of entries) {
    const pages = (data as any)?.pages as { restaurants: Restaurant[] }[] | undefined;
    const found = pages?.flatMap((p) => p.restaurants ?? []).find((r) => r.id === id);
    if (found) return found;
  }
  return undefined;
}

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const restaurantId = Number(params.id);

  const restaurant = useRestaurantFromCache(restaurantId);
  const isFav = useFavoritesStore((s) => (Number.isFinite(restaurantId) ? s.isFavorite(restaurantId) : false));
  const toggleFav = useFavoritesStore((s) => s.toggleFavorite);

  const query = useRestaurantItems(restaurantId);

  const rows = useMemo<Row[]>(() => {
    const data = query.data;
    if (!data) return [];

    const result: Row[] = [];
    if (data.recommended.length) {
      result.push({ type: 'header', id: 'h-recommended', title: 'Popular' });
      for (const item of data.recommended) {
        result.push({ type: 'item', id: `i-${item.id}`, item });
      }
    }

    for (const category of data.categories) {
      result.push({ type: 'header', id: `h-${category.title}`, title: category.title });
      for (const item of category.items) {
        result.push({ type: 'item', id: `i-${item.id}`, item });
      }
    }
    return result;
  }, [query.data]);

  const title = restaurant?.name ?? 'Restaurant';

  if (query.isError) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Header title={title} isFav={isFav} onBack={() => router.back()} onToggleFav={() => toggleFav(restaurantId)} />
          <StateView
            title="Could not load items"
            description="Please check your connection and try again."
            actionLabel="Retry"
            onActionPress={() => query.refetch()}
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (query.isLoading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Header title={title} isFav={isFav} onBack={() => router.back()} onToggleFav={() => toggleFav(restaurantId)} />
          <View style={styles.loadingWrap}>
            {[0, 1, 2, 3].map((k) => (
              <View key={k} style={[styles.skeletonRow, { backgroundColor: theme.backgroundElement }]} />
            ))}
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!rows.length) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Header title={title} isFav={isFav} onBack={() => router.back()} onToggleFav={() => toggleFav(restaurantId)} />
          <StateView title="No items found" description="This restaurant has no available items right now." />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title={title} isFav={isFav} onBack={() => router.back()} onToggleFav={() => toggleFav(restaurantId)} />
        <FlashList
          data={rows}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  {item.title}
                </ThemedText>
              );
            }
            return <RestaurantItemRow item={item.item} />;
          }}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

function Header(props: { title: string; isFav: boolean; onBack: () => void; onToggleFav: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <Pressable onPress={props.onBack} hitSlop={10} style={({ pressed }) => pressed && styles.pressed}>
        <Text style={[styles.back, { color: theme.text }]}>←</Text>
      </Pressable>
      <View style={styles.headerTitle}>
        <ThemedText type="smallBold" numberOfLines={1} style={styles.headerTitleText}>
          {props.title}
        </ThemedText>
      </View>
      <Pressable onPress={props.onToggleFav} hitSlop={10} style={({ pressed }) => pressed && styles.pressed}>
        <Text style={[styles.heart, { color: props.isFav ? '#E11D48' : theme.text }]}>
          {props.isFav ? '♥' : '♡'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  pressed: { opacity: 0.7 },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 16,
  },
  back: {
    fontSize: 22,
    lineHeight: 24,
  },
  heart: {
    fontSize: 18,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  sectionTitle: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    fontSize: 18,
    lineHeight: 22,
  },
  loadingWrap: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  skeletonRow: {
    height: 120,
    borderRadius: Spacing.four,
    opacity: 0.6,
  },
});


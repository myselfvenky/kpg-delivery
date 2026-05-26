import { useMemo } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';

import type { Restaurant } from '@/api/types';
import { RestaurantCard } from '@/components/restaurant-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StateView } from '@/components/ui/state-view';
import { Spacing } from '@/constants/theme';
import { useRestaurants } from '@/hooks/use-restaurants';
import { useTheme } from '@/hooks/use-theme';
import { useLocationStore } from '@/store/use-location-store';

export default function RestaurantsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const selectedAddress = useLocationStore((s) => s.selected.address);

  const query = useRestaurants({ limit: 5 });
  const restaurants = useMemo(() => {
    const all = query.data?.pages.flatMap((p) => p.restaurants) ?? [];
    const seen = new Set<number>();
    const result: Restaurant[] = [];
    for (const r of all) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      result.push(r);
    }
    return result;
  }, [query.data?.pages]);

  if (query.isError) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <StateView
            title="Something went wrong"
            description="Could not load restaurants. Please try again."
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
          <View style={styles.header}>
            <ThemedText type="subtitle">Restaurants</ThemedText>
            <Pressable
              onPress={() => router.push('/explore')}
              style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="primary" style={styles.locationPill}>
                <ThemedText type="smallBold" style={styles.locationText}>
                  Location
                </ThemedText>
              </ThemedView>
            </Pressable>
          </View>
          <View style={styles.skeletonList}>
            {[0, 1, 2].map((k) => (
              <View
                key={k}
                style={[styles.skeletonCard, { backgroundColor: theme.backgroundElement }]}
              />
            ))}
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!restaurants.length) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <StateView
            title="No restaurants"
            description="Try changing your delivery location."
            actionLabel="Pick location"
            onActionPress={() => router.push('/explore')}
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <ThemedText type="subtitle">Restaurants</ThemedText>
            {selectedAddress ? (
              <ThemedText themeColor="textSecondary" type="small" numberOfLines={1}>
                {selectedAddress}
              </ThemedText>
            ) : null}
          </View>
          <Pressable
            onPress={() => router.push('/explore')}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView type="primary" style={styles.locationPill}>
              <ThemedText type="smallBold" style={styles.locationText}>
                Location
              </ThemedText>
            </ThemedView>
          </Pressable>
        </View>

        <FlashList
          data={restaurants}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() =>
                router.push({ pathname: '/restaurants/[id]', params: { id: String(item.id) } })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.6}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              tintColor={theme.text}
              refreshing={query.isRefetching && !query.isFetchingNextPage}
              onRefresh={() => query.refetch()}
            />
          }
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <View style={[styles.footerLoader, { backgroundColor: theme.backgroundElement }]} />
            ) : null
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  pressed: { opacity: 0.8 },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  titleBlock: {
    flex: 1,
    gap: Spacing.half,
  },
  locationPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  locationText: {
    color: '#000000',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  skeletonList: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  skeletonCard: {
    height: 240,
    borderRadius: Spacing.four,
    opacity: 0.6,
  },
  footerLoader: {
    height: 80,
    borderRadius: Spacing.four,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.four,
    opacity: 0.5,
  },
});


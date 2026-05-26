import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StateView } from '@/components/ui/state-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocationStore, type LatLng } from '@/store/use-location-store';
import { debounce } from '@/utils/debounce';
import { haversineDistanceMeters } from '@/utils/geo';

type PermissionState = 'unknown' | 'granted' | 'denied' | 'unavailable';

function buildLeafletHtml(initial: LatLng) {
  const lat = initial.latitude;
  const lon = initial.longitude;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
    <style>
      html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
      .leaflet-control-attribution { display: none; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      crossorigin=""
    ></script>
    <script>
      const map = L.map('map', { zoomControl: false, inertia: true }).setView([${lat}, ${lon}], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      function sendCenter() {
        const c = map.getCenter();
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'center', latitude: c.lat, longitude: c.lng }));
      }

      map.on('move', sendCenter);
      map.on('moveend', sendCenter);
      sendCenter();

      document.addEventListener('message', (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg && msg.type === 'setCenter' && typeof msg.latitude === 'number' && typeof msg.longitude === 'number') {
            const z = typeof msg.zoom === 'number' ? msg.zoom : map.getZoom();
            map.setView([msg.latitude, msg.longitude], z, { animate: true });
          }
        } catch (e) {}
      });
      window.addEventListener('message', (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg && msg.type === 'setCenter' && typeof msg.latitude === 'number' && typeof msg.longitude === 'number') {
            const z = typeof msg.zoom === 'number' ? msg.zoom : map.getZoom();
            map.setView([msg.latitude, msg.longitude], z, { animate: true });
          }
        } catch (e) {}
      });
    </script>
  </body>
</html>`;
}

export default function LocationScreen() {
  const theme = useTheme();
  const webRef = useRef<WebView>(null);
  const selected = useLocationStore((s) => s.selected);
  const setSelected = useLocationStore((s) => s.setSelected);

  const [permission, setPermission] = useState<PermissionState>('unknown');
  const [center, setCenter] = useState<LatLng>(selected.coords);
  const [address, setAddress] = useState<string | undefined>(selected.address);
  const [isResolving, setIsResolving] = useState(false);
  const lastResolvedRef = useRef<LatLng | null>(null);

  const html = useMemo(
    () => buildLeafletHtml(selected.coords),
    [selected.coords.latitude, selected.coords.longitude]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          if (!cancelled) setPermission('unavailable');
          return;
        }
        const status = await Location.getForegroundPermissionsAsync();
        if (!cancelled)
          setPermission(status.granted ? 'granted' : status.canAskAgain ? 'denied' : 'unavailable');
      } catch {
        if (!cancelled) setPermission('unavailable');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reverseGeocode = useMemo(
    () =>
      debounce(async (coords: LatLng) => {
        const last = lastResolvedRef.current;
        if (last && haversineDistanceMeters(last, coords) < 15) return;

        setIsResolving(true);
        try {
          const url = new URL('https://nominatim.openstreetmap.org/reverse');
          url.searchParams.set('format', 'jsonv2');
          url.searchParams.set('lat', String(coords.latitude));
          url.searchParams.set('lon', String(coords.longitude));
          url.searchParams.set('zoom', '18');
          url.searchParams.set('addressdetails', '1');

          const res = await fetch(url.toString(), {
            headers: {
              Accept: 'application/json',
              'Accept-Language': 'en',
              'User-Agent': 'kpg-delivery-expo',
            },
          });
          if (!res.ok) throw new Error('nominatim_error');
          const json = (await res.json()) as { display_name?: string };
          const display = typeof json.display_name === 'string' ? json.display_name.trim() : '';
          setAddress(display || 'Unknown address');
          lastResolvedRef.current = coords;
        } catch {
          setAddress((prev) => prev ?? 'Unknown address');
        } finally {
          setIsResolving(false);
        }
      }, 500),
    []
  );

  const centerOnUser = async () => {
    try {
      const result = await Location.requestForegroundPermissionsAsync();
      if (!result.granted) {
        setPermission(result.canAskAgain ? 'denied' : 'unavailable');
        return;
      }
      setPermission('granted');
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords: LatLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      webRef.current?.postMessage(JSON.stringify({ type: 'setCenter', ...coords, zoom: 16 }));
      setCenter(coords);
      reverseGeocode(coords);
    } catch {
      setPermission('unavailable');
    }
  };

  if (permission === 'unavailable') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <StateView
            title="Location unavailable"
            description="Location services are not available on this device."
            actionLabel="Open settings"
            onActionPress={() => Linking.openSettings()}
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <ThemedText type="subtitle">Delivery location</ThemedText>
          <Pressable onPress={centerOnUser} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView type="primary" style={styles.primaryBtn}>
              <ThemedText type="smallBold" style={styles.primaryText}>
                My location
              </ThemedText>
            </ThemedView>
          </Pressable>
        </View>

        <View style={styles.mapWrap}>
          <WebView
            ref={webRef}
            originWhitelist={['*']}
            source={{ html }}
            onMessage={(event) => {
              try {
                const msg = JSON.parse(event.nativeEvent.data) as any;
                if (msg?.type !== 'center') return;
                if (typeof msg.latitude !== 'number' || typeof msg.longitude !== 'number') return;
                const coords: LatLng = { latitude: msg.latitude, longitude: msg.longitude };
                setCenter(coords);
                reverseGeocode(coords);
              } catch {}
            }}
          />

          <View pointerEvents="none" style={styles.pinWrap}>
            <View style={[styles.pinOuter, { backgroundColor: theme.primary }]} />
            <View style={[styles.pinInner, { backgroundColor: theme.background }]} />
          </View>
        </View>

        {permission === 'denied' ? (
          <ThemedView type="backgroundElement" style={styles.permissionCard}>
            <ThemedText type="smallBold">Location permission denied</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              Enable location permission to quickly center the map to your current position.
            </ThemedText>
            <Pressable
              onPress={() => Linking.openSettings()}
              style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="primary" style={styles.primaryBtn}>
                <ThemedText type="smallBold" style={styles.primaryText}>
                  Open settings
                </ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>
        ) : null}

        <ThemedView type="backgroundElement" style={styles.bottomSheet}>
          <View style={styles.addressRow}>
            <ThemedText type="smallBold">Selected address</ThemedText>
            <Text style={[styles.status, { color: theme.textSecondary }]}>
              {isResolving ? 'Updating…' : ' '}
            </Text>
          </View>
          <ThemedText themeColor="textSecondary" type="small" numberOfLines={2}>
            {address ?? 'Move the map to pick a delivery location.'}
          </ThemedText>

          <Pressable onPress={() => setSelected(center, address)} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView type="primary" style={styles.saveBtn}>
              <ThemedText type="smallBold" style={styles.primaryText}>
                Save address
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  pressed: { opacity: 0.75 },
  topBar: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  mapWrap: {
    flex: 1,
  },
  pinWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 34,
    height: 34,
    marginLeft: -17,
    marginTop: -34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  pinInner: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomSheet: {
    padding: Spacing.four,
    gap: Spacing.two,
    borderTopLeftRadius: Spacing.five,
    borderTopRightRadius: Spacing.five,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    fontSize: 12,
  },
  saveBtn: {
    marginTop: Spacing.one,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
  },
  primaryBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  primaryText: {
    color: '#000000',
  },
  permissionCard: {
    margin: Spacing.four,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
});


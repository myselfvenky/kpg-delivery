import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function StateView(props: {
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.container}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="subtitle" style={styles.title}>
          {props.title}
        </ThemedText>
        {props.description ? (
          <ThemedText themeColor="textSecondary" style={styles.description}>
            {props.description}
          </ThemedText>
        ) : null}

        {props.actionLabel && props.onActionPress ? (
          <Pressable onPress={props.onActionPress} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView style={styles.button} type="primary">
              <ThemedText type="smallBold" style={styles.buttonText}>
                {props.actionLabel}
              </ThemedText>
            </ThemedView>
          </Pressable>
        ) : null}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'center',
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  description: {
    lineHeight: 22,
  },
  button: {
    marginTop: Spacing.three,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  buttonText: {
    color: '#000000',
  },
  pressed: {
    opacity: 0.75,
  },
});


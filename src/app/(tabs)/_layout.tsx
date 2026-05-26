import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Restaurants',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Location',
        }}
      />
    </Tabs>
  );
}


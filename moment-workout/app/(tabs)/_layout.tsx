import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {


  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
        <Tabs.Screen
            name="resources"
            options={{
                title: 'Resources',
                tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
                ),
            }}
        />
    </Tabs>

  );
}

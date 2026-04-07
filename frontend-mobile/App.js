import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import GemDetailScreen from './src/screens/GemDetailScreen';
import AddGemScreen from './src/screens/AddGemScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#6b46c1' }, headerTintColor: '#fff' }}>
        <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
        <Stack.Screen name="GemDetail"   component={GemDetailScreen} />
        <Stack.Screen name="AddGem"      component={AddGemScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
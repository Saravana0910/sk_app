import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CaseListScreen } from '../screens/CaseListScreen';
import { CaseDetailScreen } from '../screens/CaseDetailScreen';
import { CaseFormScreen } from '../screens/CaseFormScreen';
import { SiteWebViewScreen } from '../screens/SiteWebViewScreen';
import type { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="CaseList">
            <Stack.Screen name="CaseList" component={CaseListScreen} options={{ title: 'Cases' }} />
            <Stack.Screen name="CaseDetail" component={CaseDetailScreen} options={{ title: 'Case Detail' }} />
            <Stack.Screen name="CaseForm" component={CaseFormScreen} options={{ title: 'Case' }} />
            <Stack.Screen name="SiteWebView" component={SiteWebViewScreen} options={{ title: 'Site' }} />
        </Stack.Navigator>
    );
}

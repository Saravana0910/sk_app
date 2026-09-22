import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { listCases } from '../salesforce/caseApi';
import { useAuth } from '../auth/AuthContext';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { EmptyView } from '../components/EmptyView';
import { LaunchSiteButton } from '../components/LaunchSiteButton';
import { CustomSiteButton } from '../components/CustomSiteButton';
import { getErrorMessage } from '../utils/errors';
import type { CaseRecord } from '../types/case';
import type { RootStackParamList } from '../types/navigation';

type Navigation = StackNavigationProp<RootStackParamList, 'CaseList'>;

export function CaseListScreen() {
    const navigation = useNavigation<Navigation>();
    const { logout } = useAuth();
    const [data, setData] = useState<CaseRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        listCases()
            .then((records) => setData(records))
            .catch((e) => setError(getErrorMessage(e)))
            .finally(() => setLoading(false));
    }, []);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <NewButton onPress={() => navigation.navigate('CaseForm', undefined)} />,
            headerLeft: () => <LogoutButton onPress={() => logout()} />,
        });
    }, [navigation, logout]);

    if (loading) {
        return <LoadingView message="Loading cases…" />;
    }

    if (error) {
        return <ErrorView message={error} onRetry={load} />;
    }

    return (
        <View style={styles.container}>
            {data.length === 0 ? (
                <EmptyView message="No cases found. Tap New to create one." />
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.Id}
                    renderItem={({ item }) => (
                        <Pressable
                            style={styles.row}
                            onPress={() => navigation.navigate('CaseDetail', { caseId: item.Id })}>
                            <Text style={styles.caseNumber}>{item.CaseNumber}</Text>
                            <Text style={styles.subject} numberOfLines={1}>{item.Subject}</Text>
                            <Text style={styles.status}>{item.Status}</Text>
                        </Pressable>
                    )}
                />
            )}
            <View style={styles.bottomBar}>
                <LaunchSiteButton />
                <CustomSiteButton />
            </View>
        </View>
    );
}

function NewButton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>New</Text>
        </Pressable>
    );
}

function LogoutButton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Logout</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 24,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 12,
    },
    row: {
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ddd',
    },
    caseNumber: {
        fontSize: 12,
        color: '#888',
    },
    subject: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 2,
    },
    status: {
        fontSize: 13,
        color: '#0070D2',
        marginTop: 4,
    },
    headerButton: {
        paddingHorizontal: 12,
    },
    headerButtonText: {
        color: '#0070D2',
        fontWeight: '600',
    },
});

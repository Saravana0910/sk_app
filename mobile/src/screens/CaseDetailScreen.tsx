import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { getCase } from '../salesforce/caseApi';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { getErrorMessage } from '../utils/errors';
import type { CaseRecord } from '../types/case';
import type { RootStackParamList } from '../types/navigation';

type Navigation = StackNavigationProp<RootStackParamList, 'CaseDetail'>;
type Route = RouteProp<RootStackParamList, 'CaseDetail'>;

export function CaseDetailScreen() {
    const navigation = useNavigation<Navigation>();
    const route = useRoute<Route>();
    const { caseId } = route.params;
    const [record, setRecord] = useState<CaseRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        getCase(caseId)
            .then((r) => setRecord(r))
            .catch((e) => setError(getErrorMessage(e)))
            .finally(() => setLoading(false));
    }, [caseId]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <EditButton onPress={() => navigation.navigate('CaseForm', { caseId })} />,
        });
    }, [navigation, caseId]);

    if (loading) {
        return <LoadingView message="Loading case…" />;
    }

    if (error || !record) {
        return <ErrorView message={error ?? 'Case not found.'} onRetry={load} />;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Field label="Case Number" value={record.CaseNumber} />
            <Field label="Subject" value={record.Subject} />
            <Field label="Status" value={record.Status} />
            <Field label="Priority" value={record.Priority} />
            <Field label="Origin" value={record.Origin} />
            <Field label="Description" value={record.Description ?? '—'} />
        </ScrollView>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}

function EditButton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Edit</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    field: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        color: '#888',
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 16,
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

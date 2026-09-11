import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { createCase, getCase, updateCase } from '../salesforce/caseApi';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { getErrorMessage } from '../utils/errors';
import type { CaseInput } from '../types/case';
import type { RootStackParamList } from '../types/navigation';

type Navigation = StackNavigationProp<RootStackParamList, 'CaseForm'>;
type Route = RouteProp<RootStackParamList, 'CaseForm'>;

const emptyForm: CaseInput = {
    Subject: '',
    Status: 'New',
    Priority: 'Medium',
    Origin: 'Mobile App',
    Description: '',
};

export function CaseFormScreen() {
    const navigation = useNavigation<Navigation>();
    const route = useRoute<Route>();
    const caseId = route.params?.caseId;
    const isEdit = !!caseId;

    const [form, setForm] = useState<CaseInput>(emptyForm);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!caseId) {
            return;
        }
        setLoading(true);
        getCase(caseId)
            .then((record) => setForm({
                Subject: record.Subject,
                Status: record.Status,
                Priority: record.Priority,
                Origin: record.Origin,
                Description: record.Description ?? '',
            }))
            .catch((e) => setError(getErrorMessage(e)))
            .finally(() => setLoading(false));
    }, [caseId]);

    const save = useCallback(() => {
        if (!form.Subject) {
            setError('Subject is required.');
            return;
        }
        setSaving(true);
        setError(null);
        const request = isEdit && caseId ? updateCase(caseId, form) : createCase(form);
        request
            .then(() => navigation.goBack())
            .catch((e) => setError(getErrorMessage(e)))
            .finally(() => setSaving(false));
    }, [form, isEdit, caseId, navigation]);

    if (loading) {
        return <LoadingView message="Loading case…" />;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {error && <ErrorView message={error} />}

            <FormField label="Subject" value={form.Subject ?? ''} onChangeText={(v) => setForm({ ...form, Subject: v })} />
            <FormField label="Status" value={form.Status ?? ''} onChangeText={(v) => setForm({ ...form, Status: v })} />
            <FormField label="Priority" value={form.Priority ?? ''} onChangeText={(v) => setForm({ ...form, Priority: v })} />
            <FormField label="Origin" value={form.Origin ?? ''} onChangeText={(v) => setForm({ ...form, Origin: v })} />
            <FormField
                label="Description"
                value={form.Description ?? ''}
                onChangeText={(v) => setForm({ ...form, Description: v })}
                multiline
            />

            <Pressable style={styles.saveButton} onPress={save} disabled={saving}>
                <Text style={styles.saveButtonText}>{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Case'}</Text>
            </Pressable>
        </ScrollView>
    );
}

function FormField({
    label,
    value,
    onChangeText,
    multiline,
}: {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    multiline?: boolean;
}) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && styles.multiline]}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
            />
        </View>
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
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
    },
    multiline: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#0070D2',
        paddingVertical: 14,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
});

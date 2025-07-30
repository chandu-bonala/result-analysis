import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { fetchResult } from '../api/api';

type Result = {
  htno: string;
  subcode: string;
  subname: string;
  internals: number;
  grade: string;
  credits: number;
  year: number;
  semester: number;
  exam_type: string;
};

export default function ResultScreen() {
  const [htno, setHtno] = useState('');
  const [data, setData] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backlogs, setBacklogs] = useState(0);

  const getResult = async () => {
    if (!htno.trim()) {
      setError('Enter Hall Ticket Number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetchResult(htno.trim());
      setData(res);

      const totalBacklogs = res.filter(
        (r: Result) => r.grade === 'F' || r.grade.toLowerCase() === 'absent'
      ).length;
      setBacklogs(totalBacklogs);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setData([]);
      setBacklogs(0);
    } finally {
      setLoading(false);
    }
  };

  const groupBySemester = (results: Result[]) => {
    const grouped: { [key: string]: Result[] } = {};
    results.forEach((r: Result) => {
      const key = `Year ${r.year} - Sem ${r.semester}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });
    return grouped;
  };

  const groupedData = groupBySemester(data);
  const backlogList = data.filter(
    (r: Result) => r.grade === 'F' || r.grade.toLowerCase() === 'absent'
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#f8f9fa' }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>🎓 Check Your Result</Text>

        <TextInput
          placeholder="Enter Hall Ticket Number"
          value={htno}
          onChangeText={setHtno}
          style={styles.input}
          placeholderTextColor="#666"
        />

        <TouchableOpacity onPress={getResult} style={styles.button}>
          <Text style={styles.buttonText}>Get Result</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />}

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        {data.length > 0 && (
          <>
            <Text style={styles.overview}>📌 Total Backlogs: {backlogs}</Text>

            {Object.entries(groupedData).map(([sem, results]) => {
              const semBacklogs = results.filter(
                (r) => r.grade === 'F' || r.grade.toLowerCase() === 'absent'
              ).length;

              return (
                <View key={sem} style={styles.card}>
                  <Text style={styles.semesterTitle}>{sem}</Text>
                  <Text style={styles.semBacklog}>
                    Backlogs in this semester: {semBacklogs}
                  </Text>

                  <View style={styles.tableHeader}>
                    <Text style={[styles.cell, { flex: 1.5 }]}>Code</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>Subject</Text>
                    <Text style={styles.cell}>Int</Text>
                    <Text style={styles.cell}>Grade</Text>
                    <Text style={styles.cell}>Cred</Text>
                  </View>

                  {results.map((r: Result, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.row,
                        { backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f1f3f5' },
                      ]}
                    >
                      <Text style={[styles.cell, { flex: 1.5 }]}>{r.subcode}</Text>
                      <Text style={[styles.cell, { flex: 2 }]}>{r.subname}</Text>
                      <Text style={styles.cell}>{r.internals}</Text>
                      <Text
                        style={[
                          styles.cell,
                          {
                            color:
                              r.grade === 'F' || r.grade.toLowerCase() === 'absent'
                                ? 'red'
                                : 'black',
                          },
                        ]}
                      >
                        {r.grade}
                      </Text>
                      <Text style={styles.cell}>{r.credits}</Text>
                    </View>
                  ))}
                </View>
              );
            })}

            {backlogList.length > 0 && (
              <View style={styles.card}>
                <Text style={[styles.semesterTitle, { color: 'red' }]}>
                  🚫 Final Backlog Subjects
                </Text>

                <View style={styles.tableHeader}>
                  <Text style={[styles.cell, { flex: 1.5 }]}>Code</Text>
                  <Text style={[styles.cell, { flex: 2 }]}>Subject</Text>
                  <Text style={styles.cell}>Grade</Text>
                  <Text style={styles.cell}>Sem</Text>
                </View>

                {backlogList.map((r, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.row,
                      { backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f1f3f5' },
                    ]}
                  >
                    <Text style={[styles.cell, { flex: 1.5 }]}>{r.subcode}</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>{r.subname}</Text>
                    <Text style={[styles.cell, { color: 'red' }]}>{r.grade}</Text>
                    <Text style={styles.cell}>
                      {r.year}-{r.semester}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  semesterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#343a40',
  },
  semBacklog: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: 'darkred',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#adb5bd',
    paddingBottom: 6,
    marginBottom: 6,
    backgroundColor: '#e9ecef',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
  },
  overview: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginVertical: 10,
    alignSelf: 'center',
  },
});

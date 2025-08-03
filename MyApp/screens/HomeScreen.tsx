import React, { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Try to import AnimatedCircularProgress, with fallback
let AnimatedCircularProgress: any;
try {
  AnimatedCircularProgress = require('react-native-circular-progress').AnimatedCircularProgress;
} catch (error) {
  console.log('Circular progress not available, using fallback');
  AnimatedCircularProgress = null;
}

export default function HomeScreen() {
  // Tab state: 'results' | 'cgpa' | 'backlogs'
  const [activeTab, setActiveTab] = useState<'results' | 'cgpa' | 'backlogs'>('results');

  // Backlogs calculation
  const getBacklogs = () => {
    let backlogs: any[] = [];
    results.forEach(result => {
      result.subjectGrades?.forEach((subject: any) => {
        if (subject.grade === 'F') {
          backlogs.push({
            ...subject,
            semester: result.semester,
            sgpa: result.sgpa
          });
        }
      });
    });
    return backlogs;
  };
  const [studentId, setStudentId] = useState('');
  const [fetchedId, setFetchedId] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    if (!studentId.trim()) {
      Alert.alert('Please enter a student ID');
      return;
    }

    setLoading(true);
    try {
      const resultsRef = collection(db, 'student_results');
      const snapshot = await getDocs(resultsRef);

      if (!snapshot.empty) {
        // Find the document that matches the student ID
        const studentDoc = snapshot.docs.find(doc => 
          doc.id.includes(studentId.toUpperCase()) || 
          doc.id === studentId.toUpperCase()
        );

        if (studentDoc) {
          const data = studentDoc.data();
          console.log('Found student data:', data);
          
          // Convert the data format to match your display structure
          const formattedResult = {
            semester: data.semester || "1", // Extract from document or default
            sgpa: data.sgpa || "N/A",
            subjectGrades: [] as any[]
          };

          // Extract subject data from the document (subjects with numeric keys)
          Object.keys(data).forEach(key => {
            if (key.match(/^\d/) && typeof data[key] === 'object' && data[key].subject) {
              formattedResult.subjectGrades.push({
                subject: data[key].subject || 'Unknown Subject',
                grade: data[key].grade || 'N/A',
                internals: data[key].internals || 'N/A',
                code: data[key].code || key,
                credits: parseInt(data[key].credits) || 0
              });
            }
          });

          setResults([formattedResult]);
          setFetchedId(studentId.toUpperCase());
          Alert.alert('Success', `Found results for ${studentId.toUpperCase()}!`);
        } else {
          Alert.alert('No results found!', `No results found for student ID: ${studentId.toUpperCase()}`);
          setResults([]);
          setFetchedId('');
        }
      } else {
        Alert.alert('No results found!', 'The student_results collection is empty');
        setResults([]);
        setFetchedId('');
      }
    } catch (error: any) {
      console.error('Error fetching results:', error);
      Alert.alert('Error fetching results', error.message);
      setResults([]);
      setFetchedId('');
    }
    setLoading(false);
  };

  const gradeToPoint = (grade: string) => {
    switch (grade) {
      case 'S': return 10;
      case 'A': return 9;
      case 'B': return 8;
      case 'C': return 7;
      case 'D': return 6;
      case 'E': return 5;
      case 'F': return 0;
      default: return 0;
    }
  };

  const calculateOverallCGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    results.forEach(result => {
      result.subjectGrades?.forEach((subject: any) => {
        const credit = subject.credits ?? 0;
        const point = gradeToPoint(subject.grade);
        totalCredits += credit;
        totalPoints += point * credit;
      });
    });

    const cgpa = totalCredits === 0 ? 0 : totalPoints / totalCredits;
    const percentage = cgpa * 9.5;

    return {
      cgpa: cgpa.toFixed(2),
      percentage: percentage.toFixed(2),
    };
  };

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'S': return { color: '#22c55e', fontWeight: '700' } as TextStyle;
      case 'A': return { color: '#3b82f6', fontWeight: '700' } as TextStyle;
      case 'B': return { color: '#0ea5e9', fontWeight: '700' } as TextStyle;
      case 'C': return { color: '#6366f1', fontWeight: '700' } as TextStyle;
      case 'D':
      case 'E': return { color: '#f59e0b', fontWeight: '700' } as TextStyle;
      case 'F': return { color: '#ef4444', fontWeight: '700' } as TextStyle;
      default: return { color: '#6b7280' } as TextStyle;
    }
  };

  const { cgpa, percentage } = calculateOverallCGPA();

  return (
    <LinearGradient colors={["#e0e7ff", "#f1f5f9"]} style={styles.gradient}>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100, justifyContent: 'center', minHeight: '100%' }}>
          <View style={styles.card}>
            {/* Tab Content */}
            {results.length > 0 && (
              <View style={styles.header}>
                <Text style={styles.title}>Results for: <Text style={styles.highlight}>{fetchedId}</Text></Text>
                <Image source={require('../assets/image.png')} style={styles.logo} resizeMode="contain" />
              </View>
            )}
            {results.length > 0 && activeTab === 'results' && (
              <>
                {/* Results Table */}
                {results.map((result, index) => (
                  <View key={index} style={styles.semesterCard}>
                    <View style={styles.semHeader}>
                      <Text style={styles.semTitle}>Semester {result.semester}</Text>
                      <Text style={styles.sgpaText}>SGPA: {result.sgpa ?? 'N/A'}</Text>
                    </View>
                    <View style={styles.table}>
                      <View style={styles.tableHeaderRow}>
                        <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Subject</Text>
                        <Text style={[styles.cell, styles.headerCell]}>Grade</Text>
                        <Text style={[styles.cell, styles.headerCell]}>Internals</Text>
                        <Text style={[styles.cell, styles.headerCell]}>Credits</Text>
                      </View>
                      {result.subjectGrades?.map((subject: any, idx: number) => (
                        <View key={idx} style={[styles.row, idx % 2 === 0 ? styles.even : styles.odd]}>
                          <Text style={[styles.cell, { flex: 2 }]}>{subject.subject}</Text>
                          <Text style={[styles.cell, getGradeStyle(subject.grade)]}>{subject.grade}</Text>
                          <Text style={styles.cell}>{subject.internals}</Text>
                          <Text style={styles.cell}>{subject.credits}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </>
            )}
            {results.length > 0 && activeTab === 'cgpa' && (
              <View style={styles.resultsCard}>
                <View style={styles.progressRow}>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressHeading}>CGPA</Text>
                    <AnimatedCircularProgress
                      size={120}
                      width={12}
                      fill={parseFloat(cgpa) * 10}
                      tintColor="#10b981"
                      backgroundColor="#e5e7eb"
                      duration={1200}
                      rotation={0}
                      lineCap="round"
                    >
                      {() => (
                        <Text style={styles.progressLabel}>{cgpa}</Text>
                      )}
                    </AnimatedCircularProgress>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressHeading}>Percentage</Text>
                    <AnimatedCircularProgress
                      size={120}
                      width={12}
                      fill={parseFloat(percentage)}
                      tintColor="#3b82f6"
                      backgroundColor="#e5e7eb"
                      duration={1200}
                      rotation={0}
                      lineCap="round"
                    >
                      {() => (
                        <Text style={styles.progressLabel}>{percentage}%</Text>
                      )}
                    </AnimatedCircularProgress>
                  </View>
                </View>
              </View>
            )}
            {results.length > 0 && activeTab === 'backlogs' && (
              <View style={styles.backlogsCard}>
                <Text style={styles.backlogsLabel}>Total Backlogs</Text>
                <Text style={styles.backlogsValue}>{getBacklogs().length}</Text>
                {getBacklogs().length > 0 && (
                  <View style={styles.backlogsList}>
                    <Text style={styles.backlogsListTitle}>Backlog Details:</Text>
                    
                    {/* Backlog Table */}
                    <View style={styles.backlogTable}>
                      {/* Table Header */}
                      <View style={styles.backlogTableHeaderRow}>
                        <Text style={[styles.backlogTableCell, styles.backlogHeaderCell, { flex: 1.5 }]}>Semester</Text>
                        <Text style={[styles.backlogTableCell, styles.backlogHeaderCell, { flex: 3 }]}>Subject</Text>
                        <Text style={[styles.backlogTableCell, styles.backlogHeaderCell, { flex: 1 }]}>Grade</Text>
                        <Text style={[styles.backlogTableCell, styles.backlogHeaderCell, { flex: 1 }]}>Internals</Text>
                        <Text style={[styles.backlogTableCell, styles.backlogHeaderCell, { flex: 1 }]}>Credits</Text>
                      </View>
                      
                      {/* Table Rows */}
                      {getBacklogs().map((subject, idx) => (
                        <View key={idx} style={[styles.backlogTableRow, idx % 2 === 0 ? styles.backlogEvenRow : styles.backlogOddRow]}>
                          <Text style={[styles.backlogTableCell, { flex: 1.5 }]}>{subject.semester}</Text>
                          <Text style={[styles.backlogTableCell, { flex: 3, textAlign: 'left' }]}>{subject.subject}</Text>
                          <Text style={[styles.backlogTableCell, styles.backlogGradeCell, { flex: 1 }]}>{subject.grade}</Text>
                          <Text style={[styles.backlogTableCell, { flex: 1 }]}>{subject.internals}</Text>
                          <Text style={[styles.backlogTableCell, { flex: 1 }]}>{subject.credits}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Welcome & Input Section */}
            {!fetchedId ? (
              <View style={styles.welcomeCard}>
                <Image source={require('../assets/image.png')} style={styles.welcomeLogo} resizeMode="contain" />
                <Text style={styles.welcomeTitle}>Sir C R Reddy College of Engineering</Text>
                <Text style={styles.welcomeSubtitle}>Enter your Student ID to view your academic results and CGPA progress.</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Student ID (e.g., 17B81A0106)"
                    value={studentId}
                    onChangeText={setStudentId}
                    autoCapitalize="characters"
                    placeholderTextColor="#aaa"
                    accessibilityLabel="Student ID Input"
                  />
                 
                </View>
                <TouchableOpacity style={styles.primaryButton} onPress={fetchResults} accessibilityLabel="Get Result">
                  <Text style={styles.primaryButtonText}>Get Result</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.searchAgainSection}>
                <TouchableOpacity 
                  style={styles.searchAgainButton} 
                  onPress={() => {
                    setFetchedId('');
                    setResults([]);
                    setStudentId('');
                  }}
                >
                  <Text style={styles.searchAgainText}>Search Another Student</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Loading Indicator */}
            {loading && (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Fetching results...</Text>
              </View>
            )}

            {/* No Data Message */}
            {!loading && results.length === 0 && fetchedId && (
              <View style={styles.noDataCard}>
                <Text style={styles.noDataIcon}>❌</Text>
                <Text style={styles.noData}>No result found for <Text style={styles.highlight}>{fetchedId}</Text></Text>
              </View>
            )}
          </View>
        </ScrollView>
        {/* Bottom Tab Bar with Icons */}
        {results.length > 0 && (
          <View style={styles.bottomTabBar}>
            <TouchableOpacity
              style={[styles.bottomTabButton, activeTab === 'results' && styles.bottomTabButtonActive]}
              onPress={() => setActiveTab('results')}
              accessibilityLabel="Show Results"
            >
              <MaterialCommunityIcons name="file-document-outline" size={28} style={[styles.bottomTabIcon, activeTab === 'results' && styles.bottomTabIconActive]} />
              <Text style={[styles.bottomTabLabel, activeTab === 'results' && styles.bottomTabLabelActive]}>Results</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomTabButton, activeTab === 'cgpa' && styles.bottomTabButtonActive]}
              onPress={() => setActiveTab('cgpa')}
              accessibilityLabel="Show CGPA & Percentage"
            >
              <MaterialCommunityIcons name="chart-donut" size={28} style={[styles.bottomTabIcon, activeTab === 'cgpa' && styles.bottomTabIconActive]} />
              <Text style={[styles.bottomTabLabel, activeTab === 'cgpa' && styles.bottomTabLabelActive]}>CGPA</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomTabButton, activeTab === 'backlogs' && styles.bottomTabButtonActive]}
              onPress={() => setActiveTab('backlogs')}
              accessibilityLabel="Show Backlogs"
            >
              <MaterialCommunityIcons name="alert-circle-outline" size={28} style={[styles.bottomTabIcon, activeTab === 'backlogs' && styles.bottomTabIconActive]} />
              <Text style={[styles.bottomTabLabel, activeTab === 'backlogs' && styles.bottomTabLabelActive]}>Backlogs</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  progressHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 8,
    textAlign: 'center',
  },
  bottomTabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    zIndex: 100,
  },
  bottomTabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 6,
    backgroundColor: 'transparent',
  },
  bottomTabButtonActive: {
    backgroundColor: '#2563eb22',
  },
  bottomTabIcon: {
    fontSize: 26,
    color: '#2563eb',
    marginBottom: 2,
  },
  bottomTabIconActive: {
    color: '#2563eb',
    fontWeight: '700',
    textShadowColor: '#2563eb44',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bottomTabLabel: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
  },
  bottomTabLabelActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  tabText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  resultsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
    elevation: 2,
  },
  backlogsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
    elevation: 2,
  },
  backlogsLabel: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 2,
    fontWeight: '600',
  },
  backlogsValue: {
    fontSize: 22,
    color: '#ef4444',
    fontWeight: '700',
    marginBottom: 8,
  },
  backlogsList: {
    width: '100%',
    marginTop: 8,
  },
  backlogsListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  backlogTable: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  backlogTableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  backlogHeaderCell: {
    fontWeight: '700',
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
  },
  backlogTableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backlogEvenRow: {
    backgroundColor: '#fef2f2',
  },
  backlogOddRow: {
    backgroundColor: '#fff',
  },
  backlogTableCell: {
    fontSize: 13,
    textAlign: 'center',
    color: '#1f2937',
    paddingHorizontal: 4,
  },
  backlogGradeCell: {
    color: '#ef4444',
    fontWeight: '700',
  },
  gradient: {
    flex: 1,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 18,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  iconButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  iconButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  highlight: {
    color: '#2563eb',
    fontWeight: '700',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 15,
    textAlign: 'center',
  },
  noDataCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    elevation: 2,
  },
  noDataIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  progressDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 8,
  },
  headerCell: {
    fontWeight: '700',
    fontSize: 13,
    color: '#334155',
    textAlign: 'center',
  },
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 24,
  },
  welcomeCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeLogo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  logo: { width: 50, height: 50 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#111827',
    width: '100%',
  },
  button: {
    backgroundColor: '#1d4ed8',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 24,
  },
  semesterCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  semHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  semTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  sgpaText: {
    fontWeight: 'bold',
    color: '#0f766e',
    fontSize: 14,
  },
  table: { borderRadius: 8, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  even: { backgroundColor: '#e0f2fe' },
  odd: { backgroundColor: '#f1f5f9' },
  cell: {
    flex: 1,
    fontSize: 13,
    textAlign: 'center',
    color: '#1f2937',
  },
  progressContainer: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f766e',
    textAlign: 'center',
  },
  percentLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  searchAgainSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  searchAgainButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  searchAgainText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});

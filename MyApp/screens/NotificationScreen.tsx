import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import moment from 'moment';

type Notification = {
  id: string;
  title: string;
  content: string;
  file_url?: string;
  createdAt: any;
  category: string;
  priority: string;
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function NotificationScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const docRef = doc(db, 'notices', 'Exam_Result_JNTUK');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const attachments = data.attachments || [];

          const formatted = attachments.map((item: any, index: number) => ({
            id: index.toString(),
            title: data.title || 'No Title',
            content: data.content || '',
            file_url: item.fileUrl,
            createdAt: data.createdAt,
            category: data.category || 'General',
            priority: data.priority || 'low',
          })) as Notification[];

          setNotifications(formatted);
        } else {
          Alert.alert('No Data', 'No notification document found.');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const openFile = (fileURL: string) => {
    Linking.openURL(fileURL).catch(() => Alert.alert('Error', 'Unable to open file.'));
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === id ? null : id);
  };

  return (
    <LinearGradient colors={["#e0e7ff", "#f1f5f9"]} style={styles.gradient}>
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.mainCard}>
            {/* Header */}
            <View style={styles.header}>
              <Image source={require('../assets/image.png')} style={styles.logo} />
              <Text style={styles.collegeName}>Sir C R Reddy College of Engineering</Text>
            </View>

            {/* Result Button */}
            <TouchableOpacity style={styles.resultButton} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.resultButtonText}>View Results</Text>
            </TouchableOpacity>

            {/* Section Title */}
            <Text style={styles.sectionTitle}>Latest Notifications</Text>

            {/* Loading */}
            {loading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 10, color: '#64748b' }}>Loading...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <Text style={styles.noNotif}>No notifications found.</Text>
            ) : (
              notifications.map(note => (
                <TouchableOpacity
                  key={note.id}
                  onPress={() => toggleExpand(note.id)}
                  activeOpacity={0.85}
                  style={styles.notificationCard}
                  accessibilityLabel={`Notification: ${note.title}`}
                >
                  <View style={styles.notifRow}>
                    <Text style={styles.notifIcon}>🔔</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notificationTitle}>{note.title}</Text>
                      <Text style={styles.timestamp}>
                        {moment(note.createdAt.toDate()).format('DD MMM YYYY, hh:mm A')} • {note.category} • Priority: {note.priority}
                      </Text>
                    </View>
                  </View>

                  {expanded === note.id && (
                    <View style={styles.notificationDetails}>
                      <Text style={styles.description}>{note.content}</Text>
                      {note.file_url && (
                        <TouchableOpacity onPress={() => openFile(note.file_url!)}>
                          <Text style={styles.fileLink}>📎 Open Attachment</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
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
  resultsLabel: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 2,
    fontWeight: '600',
  },
  resultsValue: {
    fontSize: 22,
    color: '#2563eb',
    fontWeight: '700',
    marginBottom: 8,
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
  backlogItem: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backlogSubject: {
    fontSize: 15,
    color: '#b91c1c',
    fontWeight: '600',
  },
  backlogGrade: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  backlogCredits: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 8,
  },
  gradient: {
    flex: 1,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f1f5f9',
  },

  mainCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: screenWidth < 400 ? 100 : 130,
    height: screenWidth < 400 ? 100 : 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#1d4ed8',
    marginBottom: 10,
  },
  collegeName: {
    fontSize: screenWidth < 400 ? 17 : 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
  },

  resultButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 4,
  },
  resultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 14,
    marginTop: 10,
  },

  loader: {
    alignItems: 'center',
    marginTop: 30,
  },

  noNotif: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 30,
  },

  notificationCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  notificationDetails: {
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  fileLink: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '600',
    marginTop: 10,
  },
});

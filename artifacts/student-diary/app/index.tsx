import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

type ScreenKey =
  | 'home'
  | 'attendance'
  | 'notices'
  | 'registration'
  | 'results'
  | 'information'
  | 'fees'
  | 'schedule'
  | 'password';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Course = {
  id: string;
  code: string;
  title: string;
  faculty: string;
  present: number;
  total: number;
};

const STORAGE_KEY = 'student-diary-attendance-v1';
const DEMO_ATTENDANCE_STORAGE_KEY = 'student-diary-attendance-demo-v2';
const ATTENDANCE_TARGET = 60;

const initialCourses: Course[] = [
  { id: 'networks', code: 'BTE26138', title: 'Computer Networks', faculty: 'M. Velayapelli', present: 19, total: 25 },
  { id: 'web-programming', code: 'BTE25464', title: 'Web Programming', faculty: 'Kanak Lata', present: 21, total: 26 },
  { id: 'graph-theory', code: 'BTE26148', title: 'Professional Elective-I · Graph Theory', faculty: 'Dilip Kumar', present: 18, total: 25 },
  { id: 'networks-lab', code: 'BTE26151', title: 'Computer Networks Laboratory', faculty: 'Megha Srivastava', present: 14, total: 17 },
  { id: 'knowledge', code: 'BTE25122', title: 'Essence of Indian Knowledge Tradition', faculty: 'Monika Singh', present: 16, total: 21 },
  { id: 'signals', code: 'BTE25112', title: 'Signals and Systems', faculty: 'Prem Nath Suman', present: 24, total: 30 },
  { id: 'signals-lab', code: 'BTE25466', title: 'Signal & System Laboratory', faculty: 'R. K. Sharma', present: 15, total: 18 },
  { id: 'software-engineering', code: 'BTE26121', title: 'Software Engineering', faculty: 'Anjali Kumari', present: 20, total: 25 },
];

const initialAttendanceCourses: Course[] = [
  { id: 'networks-mamatha', code: 'BTE26138', title: 'Computer Networks', faculty: 'Mamatha Velayapelli', present: 13, total: 21 },
  { id: 'networks-sayak', code: 'BTE26138', title: 'Computer Networks', faculty: 'Sayak Mandal', present: 32, total: 50 },
  { id: 'web-programming', code: 'BTE25464', title: 'Web Programming', faculty: 'Kanak Lata', present: 31, total: 51 },
  { id: 'graph-theory', code: 'BTE26148', title: 'Professional Elective-I - Graph Theory', faculty: 'Dilip Kumar', present: 35, total: 54 },
  { id: 'networks-lab', code: 'BTE26151', title: 'Computer Networks Laboratory', faculty: 'Megha Srivastava', present: 19, total: 30 },
  { id: 'knowledge', code: 'BTE25122', title: 'Essence of Indian Knowledge Tradition', faculty: 'Monika Singh', present: 19, total: 29 },
  { id: 'signals', code: 'BTE25112', title: 'Signals and Systems', faculty: 'Prem Nath Suman', present: 28, total: 46 },
  { id: 'signals-lab', code: 'BTE25466', title: 'Signal & System Laboratory', faculty: 'Mihir Kumar Mahakud', present: 14, total: 22 },
  { id: 'software-project', code: 'BTE25558', title: 'Professional Elective - II - Software Project Management', faculty: 'Faculty name cropped in screenshot', present: 40, total: 59 },
];

const menuItems: Array<{ key: ScreenKey; label: string; icon: IconName }> = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'attendance', label: 'Attendance', icon: 'clipboard-check-outline' },
  { key: 'notices', label: 'Notice', icon: 'calendar-text-outline' },
  { key: 'registration', label: 'Exam registration', icon: 'file-document-check-outline' },
  { key: 'results', label: 'Result', icon: 'text-box-check-outline' },
  { key: 'information', label: 'My information', icon: 'account-outline' },
  { key: 'fees', label: 'Fees paid', icon: 'receipt-text-outline' },
  { key: 'schedule', label: 'Class schedule', icon: 'calendar-month-outline' },
  { key: 'password', label: 'Change password', icon: 'lock-reset' },
];

const notices = [
  { date: 'OCT 06', tag: 'ACADEMIC', title: 'Mid-semester examination timetable', body: 'The draft timetable for semester V is available. Review your subjects and check the notice board for room updates.' },
  { date: 'OCT 03', tag: 'CAMPUS', title: 'Library hours this week', body: 'The central library will remain open until 8:00 PM from Monday to Friday.' },
  { date: 'SEP 29', tag: 'ACADEMIC', title: 'Project review submissions', body: 'Please submit your project review documents to your faculty mentor before the next scheduled review.' },
];

const scheduleByDay: Record<string, Array<{ time: string; code: string; title: string; room: string; faculty: string }>> = {
  Mon: [
    { time: '09:00 AM', code: 'BTE26138', title: 'Computer Networks', room: 'Block B · 204', faculty: 'M. Velayapelli' },
    { time: '11:00 AM', code: 'BTE25464', title: 'Web Programming', room: 'Lab 03', faculty: 'Kanak Lata' },
    { time: '02:00 PM', code: 'BTE25112', title: 'Signals and Systems', room: 'Block A · 118', faculty: 'Prem Nath Suman' },
  ],
  Tue: [
    { time: '09:00 AM', code: 'BTE25122', title: 'Essence of Indian Knowledge', room: 'Block A · 102', faculty: 'Monika Singh' },
    { time: '12:00 PM', code: 'BTE26151', title: 'Computer Networks Laboratory', room: 'Network Lab', faculty: 'Megha Srivastava' },
  ],
  Wed: [
    { time: '10:00 AM', code: 'BTE26148', title: 'Graph Theory', room: 'Block B · 204', faculty: 'Dilip Kumar' },
    { time: '01:00 PM', code: 'BTE26121', title: 'Software Engineering', room: 'Block A · 118', faculty: 'Anjali Kumari' },
  ],
  Thu: [
    { time: '09:00 AM', code: 'BTE25466', title: 'Signal & System Laboratory', room: 'Electronics Lab', faculty: 'R. K. Sharma' },
    { time: '11:00 AM', code: 'BTE26138', title: 'Computer Networks', room: 'Block B · 204', faculty: 'M. Velayapelli' },
  ],
  Fri: [
    { time: '', code: 'BTE26148', title: 'Professional Elective-I - Graph Theory', room: '', faculty: 'Dilip Kumar' },
    { time: '', code: 'BTE26138', title: 'Computer Networks', room: '', faculty: 'Sayak Mandal' },
    { time: '', code: 'BTE25558', title: 'Professional Elective - II - Software Project Management', room: '', faculty: 'Shuvadip Mandal' },
    { time: '', code: 'BTE25464', title: 'Web Programming', room: '', faculty: 'Kanak Lata' },
  ],
};

const results = [
  { subject: 'Data Structures & Algorithms', code: 'BTE24106', grade: 'A', points: '8.0' },
  { subject: 'Database Management Systems', code: 'BTE24114', grade: 'A+', points: '9.0' },
  { subject: 'Object Oriented Programming', code: 'BTE24122', grade: 'A', points: '8.0' },
  { subject: 'Discrete Mathematics', code: 'BTE24102', grade: 'B+', points: '7.0' },
];

function getPercentage(course: Course) {
  return course.total === 0 ? 0 : Math.round((course.present / course.total) * 100);
}

function ProgressRing({
  percentage,
  size = 76,
  colors,
  progressColor,
  trackColor,
}: {
  percentage: number;
  size?: number;
  colors: ReturnType<typeof useColors>;
  progressColor?: string;
  trackColor?: string;
}) {
  const stroke = progressColor ? 5 : 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(percentage, 100) / 100);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor ?? colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor ?? (percentage >= ATTENDANCE_TARGET ? colors.success : colors.destructive)}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <View style={styles.ringLabel}>
        <Text style={[styles.ringNumber, { color: colors.foreground, fontSize: size >= 90 ? 30 : 21 }]}>{percentage}</Text>
        <Text style={[styles.ringPercent, { color: colors.mutedForeground, fontSize: size >= 90 ? 12 : 10 }]}>%</Text>
      </View>
    </View>
  );
}

function SectionTitle({ title, action, onAction, colors }: { title: string; action?: string; onAction?: () => void; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" style={({ pressed }) => [{ opacity: pressed ? 0.65 : 1 }, styles.inlineAction]}>
          <Text style={[styles.inlineActionText, { color: colors.primary }]}>{action}</Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const personalDetails = [
  ['Enrollment No', 'AJU/241355'],
  ['Student Name', 'PRINCE RAJ'],
  ['Degree', 'Bachelor of Technology'],
  ['Branch', 'Computer Science and Engineering'],
  ['Semester', 'V'],
  ["Father's Name", 'ARUN CHOURASIA'],
  ["Mother's Name", 'MANISHA DEVI'],
  ['Gender', 'Male'],
  ['DOB', '05-02-2005'],
  ['Weight', '-'],
  ['Caste', '-'],
  ['Category', 'OBC'],
  ['Blood Group', 'B+'],
] as const;

const studentInformationTabs = {
  'PERSONAL DETAIL': personalDetails,
  'CONTACT DETAIL': [
    ['Mobile No', '-'],
    ['Email ID', '-'],
    ['Alternate Contact No', '-'],
    ['Emergency Contact', '-'],
  ],
  'POSTAL DETAIL': [
    ['Address', '-'],
    ['City', '-'],
    ['State', '-'],
    ['PIN Code', '-'],
  ],
} as const;

type StudentInformationTab = keyof typeof studentInformationTabs;

export default function StudentDiaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const isTablet = width >= 620;

  const [screen, setScreen] = useState<ScreenKey>('password');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [attendanceCourses, setAttendanceCourses] = useState<Course[]>(initialAttendanceCourses);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState('Fri');
  const [dayMenuOpen, setDayMenuOpen] = useState(false);
  const [informationTab, setInformationTab] = useState<StudentInformationTab>('PERSONAL DETAIL');
  const [informationReturnScreen, setInformationReturnScreen] = useState<ScreenKey>('home');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [feeMessage, setFeeMessage] = useState('');
  const isReferenceScreen = ['information', 'fees', 'schedule', 'password'].includes(screen);
  const [ready, setReady] = useState(false);
  const [attendanceReady, setAttendanceReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!active) return;
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.every((course) =>
            course && typeof course.id === 'string' && Number.isFinite(course.present) &&
            Number.isFinite(course.total) && course.present >= 0 && course.total >= course.present
          )) {
            setCourses(parsed as Course[]);
          }
        }
      })
      .catch(() => {
        if (active) setCourses(initialCourses);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (ready) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(courses)).catch(() => undefined);
    }
  }, [courses, ready]);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(DEMO_ATTENDANCE_STORAGE_KEY)
      .then((stored) => {
        if (!active) return;
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.every((course) =>
            course && typeof course.id === 'string' && Number.isFinite(course.present) &&
            Number.isFinite(course.total) && course.present >= 0 && course.total >= course.present
          )) {
            setAttendanceCourses(parsed as Course[]);
          }
        }
      })
      .catch(() => {
        if (active) setAttendanceCourses(initialAttendanceCourses);
      })
      .finally(() => {
        if (active) setAttendanceReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (attendanceReady) {
      AsyncStorage.setItem(DEMO_ATTENDANCE_STORAGE_KEY, JSON.stringify(attendanceCourses)).catch(() => undefined);
    }
  }, [attendanceCourses, attendanceReady]);

  const pageTitle = screen === 'information'
    ? 'Student Information'
    : screen === 'fees'
      ? 'Fees Paid'
      : screen === 'schedule'
        ? 'Class Schedule'
        : screen === 'password'
          ? 'Change Password'
          : menuItems.find((item) => item.key === screen)?.label ?? 'Student Diary';

  const navigate = (key: ScreenKey) => {
    if (key === 'information') setInformationReturnScreen(screen);
    setScreen(key);
    setDrawerOpen(false);
    setExpandedCourse(null);
  };

  const recordClass = (courseId: string, present: boolean) => {
    void Haptics.selectionAsync();
    setAttendanceCourses((current) =>
      current.map((course) =>
        course.id === courseId
          ? { ...course, total: course.total + 1, present: course.present + (present ? 1 : 0) }
          : course,
      ),
    );
    setExpandedCourse(null);
  };

  if (!ready || !attendanceReady) {
    return (
      <SafeAreaView style={[styles.loadingScreen, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Opening your diary…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen === 'home' || screen === 'registration' || isReferenceScreen ? colors.primary : colors.background }]} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View
        style={[
          styles.appShell,
          { maxWidth: isWide ? 1180 : 760, paddingTop: Platform.OS === 'web' ? (isReferenceScreen ? 55 : 67) : 0, paddingBottom: Platform.OS === 'web' ? 34 : 0, backgroundColor: screen === 'home' || screen === 'registration' || isReferenceScreen ? colors.primary : 'transparent' },
        ]}
      >
        <View style={[styles.header, screen === 'home' && styles.homeHeader, screen === 'registration' && styles.registrationHeader, ['information', 'fees', 'schedule', 'password'].includes(screen) && styles.referenceHeader, { backgroundColor: colors.primary }]}>
          <Pressable
            onPress={() => screen === 'registration' ? navigate('home') : screen === 'information' ? navigate(informationReturnScreen) : setDrawerOpen(true)}
            accessibilityLabel={screen === 'registration' || screen === 'information' ? 'Go back' : 'Open navigation menu'}
            accessibilityRole="button"
            testID={screen === 'registration' ? 'back-from-registration' : screen === 'information' ? 'back-from-information' : 'open-menu'}
            style={({ pressed }) => [styles.headerIconButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <MaterialCommunityIcons name={screen === 'registration' || screen === 'information' ? 'arrow-left' : 'menu'} size={25} color={colors.primaryForeground} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text numberOfLines={1} style={[styles.headerTitle, screen === 'home' && styles.homeHeaderTitle, screen === 'registration' && styles.registrationHeaderTitle, ['information', 'fees', 'schedule', 'password'].includes(screen) && styles.referenceHeaderTitle, { color: colors.primaryForeground }]}>{screen === 'home' ? 'Student Diary' : screen === 'registration' ? 'Show Exam Register Status' : pageTitle}</Text>
            {screen !== 'home' && screen !== 'attendance' && screen !== 'registration' && !['information', 'fees', 'schedule', 'password'].includes(screen) ? <Text numberOfLines={1} style={styles.headerSubtitle}>ARKA JAIN University · Jharkhand</Text> : null}
          </View>
          {screen !== 'home' && screen !== 'attendance' && screen !== 'registration' && !['information', 'fees', 'schedule', 'password'].includes(screen) ? (
            <Pressable onPress={() => navigate('information')} accessibilityLabel="Open student profile" accessibilityRole="button" style={styles.headerAvatar}>
              <Text style={[styles.headerAvatarText, { color: colors.primary }]}>PR</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.body}>
          {isWide && screen !== 'home' ? (
            <View style={[styles.desktopSidebar, { backgroundColor: colors.card, borderRightColor: colors.border }]}>
              <View style={styles.sidebarIdentity}>
                <View style={[styles.avatarLarge, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.avatarInitials, { color: colors.primary }]}>PR</Text>
                </View>
                <Text style={[styles.sidebarName, { color: colors.foreground }]}>Prince Raj</Text>
                <Text style={[styles.sidebarId, { color: colors.mutedForeground }]}>AJU/241355</Text>
              </View>
              {menuItems.map((item) => (
                <NavItem key={item.key} item={item} selected={screen === item.key} onPress={() => navigate(item.key)} colors={colors} compact />
              ))}
            </View>
          ) : null}

          <ScrollView
            style={[
              styles.scrollArea,
              screen === 'home' && { backgroundColor: colors.card },
              (screen === 'registration' || isReferenceScreen) && { backgroundColor: colors.background },
            ]}
            contentContainerStyle={[
              styles.pageContent,
              { maxWidth: screen === 'home' ? 460 : isWide ? 900 : 740, paddingHorizontal: screen === 'home' ? 23 : isTablet ? 28 : 18 },
              screen === 'home' && styles.homePageContent,
              screen === 'registration' && styles.registrationPageContent,
              ['information', 'schedule'].includes(screen) && styles.edgeToEdgePageContent,
              screen === 'fees' && styles.feesPageContent,
              screen === 'password' && styles.passwordPageContent,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {screen === 'home' ? (
              <HomeScreen colors={colors} />
            ) : null}
            {screen === 'attendance' ? (
              <AttendanceScreen
                colors={colors}
                courses={attendanceCourses}
                expandedCourse={expandedCourse}
                setExpandedCourse={setExpandedCourse}
                recordClass={recordClass}
                isTablet={isTablet}
              />
            ) : null}
            {screen === 'notices' ? <NoticesScreen colors={colors} /> : null}
            {screen === 'registration' ? <RegistrationScreen colors={colors} isTablet={isTablet} /> : null}
            {screen === 'results' ? <ResultsScreen colors={colors} /> : null}
            {screen === 'information' ? <InformationScreen colors={colors} activeTab={informationTab} setActiveTab={setInformationTab} /> : null}
            {screen === 'fees' ? <FeesScreen colors={colors} /> : null}
            {screen === 'schedule' ? <ScheduleScreen colors={colors} activeDay={activeDay} setActiveDay={setActiveDay} dayMenuOpen={dayMenuOpen} setDayMenuOpen={setDayMenuOpen} /> : null}
            {screen === 'password' ? <PasswordScreen colors={colors} currentPassword={currentPassword} setCurrentPassword={setCurrentPassword} newPassword={newPassword} setNewPassword={setNewPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} message={passwordMessage} setMessage={setPasswordMessage} /> : null}
            {screen !== 'home' && !['information', 'fees', 'schedule', 'password'].includes(screen) ? <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>Sample diary · not connected to university systems</Text> : null}
          </ScrollView>
          {screen === 'fees' ? (
            <View style={[styles.feesFooter, { backgroundColor: colors.background, bottom: -20 }]}>
              {feeMessage ? <Text style={[styles.feeFeedback, { color: colors.mutedForeground }]}>{feeMessage}</Text> : null}
              <Pressable onPress={() => setFeeMessage('Outstanding fee details are not available in this local sample.')} accessibilityRole="button" testID="view-outstanding-fees" style={({ pressed }) => [styles.outstandingButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}>
                <Text style={styles.outstandingButtonText}>VIEW OUTSTANDING FEES</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>

      {!isWide ? (
        <Modal visible={drawerOpen} animationType="fade" transparent onRequestClose={() => setDrawerOpen(false)}>
          <View style={styles.drawerOverlay}>
            <Pressable style={styles.drawerScrim} onPress={() => setDrawerOpen(false)} accessibilityLabel="Close menu" />
            <View style={[styles.drawer, { backgroundColor: colors.card, width: Math.min(width * 0.84, 350) }]}>
              <View style={[styles.drawerProfile, { backgroundColor: colors.primary }]}>
                <View style={styles.drawerTopLine}>
                  <View style={[styles.avatarLarge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                    <Text style={[styles.avatarInitials, { color: colors.primaryForeground }]}>PR</Text>
                  </View>
                  <Pressable onPress={() => setDrawerOpen(false)} accessibilityLabel="Close navigation menu" style={styles.closeDrawerButton}>
                    <MaterialCommunityIcons name="close" size={23} color={colors.primaryForeground} />
                  </Pressable>
                </View>
                <Text style={[styles.drawerName, { color: colors.primaryForeground }]}>Prince Raj</Text>
                <Text style={styles.drawerId}>AJU/241355 · Semester V</Text>
              </View>
              <ScrollView contentContainerStyle={styles.drawerList}>
                {menuItems.map((item) => (
                  <NavItem key={item.key} item={item} selected={screen === item.key} onPress={() => navigate(item.key)} colors={colors} />
                ))}
              </ScrollView>
              <View style={[styles.drawerFooter, { borderTopColor: colors.border }]}>
                <MaterialCommunityIcons name="shield-check-outline" size={17} color={colors.mutedForeground} />
                <Text style={[styles.drawerFooterText, { color: colors.mutedForeground }]}>Attendance data stays on this device</Text>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
      {screen === 'home' || screen === 'registration' || isReferenceScreen ? (
        <View
          style={[
            styles.homeBottomInset,
            {
              height: Platform.OS === 'web' ? 34 : insets.bottom,
              bottom: Platform.OS === 'web' ? 0 : -insets.bottom,
              backgroundColor: screen === 'home' ? colors.card : colors.background,
            },
          ]}
        />
      ) : null}
    </SafeAreaView>
  );
}

function NavItem({
  item,
  selected,
  onPress,
  colors,
  compact = false,
}: {
  item: (typeof menuItems)[number];
  selected: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      testID={`nav-${item.key}`}
      style={({ pressed }) => [
        styles.navItem,
        compact && styles.navItemCompact,
        { backgroundColor: selected ? colors.secondary : 'transparent', opacity: pressed ? 0.72 : 1 },
      ]}
    >
      <MaterialCommunityIcons name={item.icon} size={21} color={selected ? colors.primary : colors.mutedForeground} />
      <Text style={[styles.navLabel, { color: selected ? colors.primary : colors.foreground, fontWeight: selected ? '700' : '500' }]}>{item.label}</Text>
      {selected ? <View style={[styles.navSelectedMark, { backgroundColor: colors.accent }]} /> : null}
    </Pressable>
  );
}

function HomeScreen({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.homeProfileScreen}>
      <Text style={[styles.homeUniversity, { color: colors.primary }]}>ARKA JAIN University Jharkhand</Text>
      <Image
        source={require('../assets/images/student-profile.png')}
        accessibilityLabel="Student portrait"
        style={styles.homeProfileImage}
      />
      <Text style={[styles.homeProfileName, { color: colors.foreground }]}>PRINCE RAJ</Text>

      <View style={styles.homeInfoList}>
        <View style={styles.homeInfoItem}>
          <Text style={[styles.homeInfoLabel, { color: colors.foreground }]}>USN No.</Text>
          <Text style={[styles.homeInfoValue, { color: colors.mutedForeground }]}>AJU/241355</Text>
        </View>
        <View style={styles.homeInfoItem}>
          <Text style={[styles.homeInfoLabel, { color: colors.foreground }]}>Branch</Text>
          <Text style={[styles.homeInfoValue, { color: colors.mutedForeground }]}>Computer Science and Engineering</Text>
        </View>
        <View style={styles.homeInfoItem}>
          <Text style={[styles.homeInfoLabel, { color: colors.foreground }]}>Semester</Text>
          <Text style={[styles.homeInfoValue, { color: colors.mutedForeground }]}>V</Text>
        </View>
      </View>
    </View>
  );
}

function AttendanceScreen({
  colors,
  courses,
  expandedCourse,
  setExpandedCourse,
  recordClass,
  isTablet,
}: {
  colors: ReturnType<typeof useColors>;
  courses: Course[];
  expandedCourse: string | null;
  setExpandedCourse: (id: string | null) => void;
  recordClass: (courseId: string, present: boolean) => void;
  isTablet: boolean;
}) {
  return (
    <View>
      <View style={styles.attendanceStudentHeading}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.attendanceStudentName, { color: colors.foreground }]}>PRINCE RAJ</Text>
          <Text style={[styles.attendanceStudentProgram, { color: colors.mutedForeground }]}>Computer Science and Engineering - V</Text>
        </View>
      </View>
      <View style={[styles.courseList, isTablet && styles.courseListWide]}>
        {courses.map((course) => {
          const percentage = getPercentage(course);
          const expanded = expandedCourse === course.id;
          return (
            <View key={course.id} style={[styles.courseCard, isTablet && styles.courseCardWide, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Pressable
                onPress={() => setExpandedCourse(expanded ? null : course.id)}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                testID={`course-${course.id}`}
                style={styles.courseCardPress}
              >
                <View style={[styles.courseCardHeader, { backgroundColor: colors.primary }]}>
                  <Text numberOfLines={2} style={styles.courseHeaderTitle}>{course.code}--{course.title}</Text>
                </View>
                <View style={styles.courseCardBody}>
                  <View style={styles.courseRingWrap}>
                    <ProgressRing
                      percentage={percentage}
                      size={98}
                      colors={colors}
                      progressColor={colors.primary}
                      trackColor={colors.ringTrack}
                    />
                  </View>
                  <View style={styles.courseStats}>
                    <StatRow label="Total" value={String(course.total)} colors={colors} />
                    <StatRow label="Present" value={String(course.present)} colors={colors} />
                    <StatRow label="Absent" value={String(course.total - course.present)} colors={colors} />
                  </View>
                  <View style={[styles.attendanceArrow, { borderColor: colors.mutedForeground }]}>
                    <MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-right'} size={18} color={colors.mutedForeground} />
                  </View>
                </View>
                <View style={[styles.facultyRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.facultyLabel, { color: colors.foreground }]}>Faculty Name</Text>
                  <Text numberOfLines={1} style={[styles.facultyName, { color: colors.mutedForeground }]}>{course.faculty}</Text>
                </View>
              </Pressable>
              {expanded ? (
                <View style={[styles.recordActions, { borderTopColor: colors.border }]}>
                  <Text style={[styles.recordPrompt, { color: colors.mutedForeground }]}>Record one class</Text>
                  <View style={styles.recordButtons}>
                    <Pressable
                      onPress={() => recordClass(course.id, true)}
                      accessibilityRole="button"
                      testID={`record-present-${course.id}`}
                      style={({ pressed }) => [styles.recordButton, { backgroundColor: colors.successSoft, opacity: pressed ? 0.7 : 1 }]}
                    >
                      <MaterialCommunityIcons name="check" size={17} color={colors.success} />
                      <Text style={[styles.recordButtonText, { color: colors.success }]}>Present</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => recordClass(course.id, false)}
                      accessibilityRole="button"
                      testID={`record-absent-${course.id}`}
                      style={({ pressed }) => [styles.recordButton, { backgroundColor: colors.dangerSoft, opacity: pressed ? 0.7 : 1 }]}
                    >
                      <MaterialCommunityIcons name="close" size={17} color={colors.destructive} />
                      <Text style={[styles.recordButtonText, { color: colors.destructive }]}>Absent</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StatRow({ label, value, colors, valueColor }: { label: string; value: string; colors: ReturnType<typeof useColors>; valueColor?: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor ?? colors.foreground }]}>{value}</Text>
    </View>
  );
}

function NoticesScreen({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View>
      <View style={styles.pageIntro}>
        <Text style={[styles.pageHeading, { color: colors.foreground }]}>Notices</Text>
        <Text style={[styles.pageSubheading, { color: colors.mutedForeground }]}>Updates for your campus and classes</Text>
      </View>
      <View style={styles.noticeList}>
        {notices.map((notice) => (
          <View key={notice.title} style={[styles.noticeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.noticeCardTop}>
              <View style={[styles.noticeDateBox, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.noticeDateText, { color: colors.primary }]}>{notice.date.split(' ')[1]}</Text>
                <Text style={[styles.noticeMonthText, { color: colors.mutedForeground }]}>{notice.date.split(' ')[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.noticeTag, { color: colors.primary }]}>{notice.tag}</Text>
                <Text style={[styles.noticeCardTitle, { color: colors.foreground }]}>{notice.title}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={19} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.noticeBody, { color: colors.mutedForeground }]}>{notice.body}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function RegistrationScreen({ colors, isTablet }: { colors: ReturnType<typeof useColors>; isTablet: boolean }) {
  const subjects = [
    'BTE26138-Computer Networks',
    'BTE25464-Web Programming',
    'BTE26148-Professional Elective-I - Graph Theory',
    'BTE26151-Computer Networks Laboratory',
    'BTE25122-Essence of Indian Knowledge Tradition',
    'BTE25112-Signals and Systems',
    'BTE25466-Signal & System Laboratory',
    'BTE26312-Summer Internship-I (3-4 week)',
    'BTE25558-Professional Elective - II - Software Project Management',
    'BTE25465-Web Programming Laboratory',
  ];
  const tableBorder = colors.mutedForeground;

  return (
    <View style={styles.registrationScreen}>
      <View style={[styles.registrationSession, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: isTablet ? -18 : -8 }]}>
        <Text style={[styles.registrationSessionText, { color: colors.foreground }]}>ODD 2026-27</Text>
        <MaterialCommunityIcons name="chevron-down" size={21} color={colors.mutedForeground} />
      </View>

      <View style={[styles.registrationSummary, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: isTablet ? -18 : -8 }]}>
        <View style={styles.registrationSummaryRow}>
          <Text style={[styles.registrationSummaryLabel, { color: colors.mutedForeground }]}>Session</Text>
          <Text style={[styles.registrationSummaryValue, { color: colors.mutedForeground }]}>ODD 2026-27</Text>
        </View>
        <View style={styles.registrationSummaryRow}>
          <Text style={[styles.registrationSummaryLabel, { color: colors.mutedForeground }]}>Semester</Text>
          <Text style={[styles.registrationSummaryValue, { color: colors.mutedForeground }]}>V</Text>
        </View>
        <View style={styles.registrationSummaryRow}>
          <Text style={[styles.registrationSummaryLabel, { color: colors.mutedForeground }]}>Exam Register</Text>
          <Text style={[styles.registrationSummaryValue, { color: colors.destructive }]}>Exam Not Registered</Text>
        </View>
      </View>

      <View style={[styles.registrationTable, { marginHorizontal: isTablet ? -28 : -18, borderColor: tableBorder }]}>
        <View style={[styles.registrationTableHeader, { backgroundColor: colors.card }]}>
          <View style={[styles.registrationCell, styles.registrationSerialCell, styles.registrationHeaderCell, { borderColor: tableBorder }]}>
            <Text style={[styles.registrationTableHeaderText, { color: colors.foreground }]}>Sr.N</Text>
          </View>
          <View style={[styles.registrationCell, styles.registrationCourseCell, styles.registrationHeaderCell, { borderColor: tableBorder }]}>
            <Text style={[styles.registrationTableHeaderText, { color: colors.foreground }]}>Course</Text>
          </View>
          <View style={[styles.registrationCell, styles.registrationSemesterCell, styles.registrationHeaderCell, styles.registrationLastCell, { borderColor: tableBorder }]}>
            <Text style={[styles.registrationTableHeaderText, { color: colors.foreground }]}>Sem</Text>
          </View>
        </View>
        {subjects.map((subject, index) => (
          <View key={subject} style={styles.registrationTableRow}>
            <View style={[styles.registrationCell, styles.registrationSerialCell, { borderColor: tableBorder }]}>
              <Text style={[styles.registrationTableText, { color: colors.foreground }]}>{index + 1}</Text>
            </View>
            <View style={[styles.registrationCell, styles.registrationCourseCell, { borderColor: tableBorder }]}>
              <Text style={[styles.registrationTableText, { color: colors.foreground }]}>{subject}</Text>
            </View>
            <View style={[styles.registrationCell, styles.registrationSemesterCell, styles.registrationLastCell, { borderColor: tableBorder }]}>
              <Text style={[styles.registrationTableText, { color: colors.foreground }]}>V</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function ResultsScreen({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View>
      <View style={styles.pageIntro}>
        <Text style={[styles.pageHeading, { color: colors.foreground }]}>Results</Text>
        <Text style={[styles.pageSubheading, { color: colors.mutedForeground }]}>Your academic record at a glance</Text>
      </View>
      <View style={[styles.gpaCard, { backgroundColor: colors.primary }]}>
        <View>
          <Text style={styles.gpaKicker}>PREVIOUS SEMESTER</Text>
          <Text style={styles.gpaValue}>8.1<Text style={styles.gpaScale}> / 10</Text></Text>
          <Text style={styles.gpaCaption}>Semester IV · SGPA</Text>
        </View>
        <View style={[styles.gpaIcon, { backgroundColor: 'rgba(255,255,255,0.14)' }]}>
          <MaterialCommunityIcons name="school-outline" size={29} color={colors.accent} />
        </View>
      </View>
      <View style={styles.resultSection}>
        <SectionTitle title="Semester IV grades" colors={colors} />
        {results.map((result, index) => (
          <View key={result.code} style={[styles.resultRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.resultIndex, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.resultIndexText, { color: colors.primary }]}>{String(index + 1).padStart(2, '0')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.resultSubject, { color: colors.foreground }]}>{result.subject}</Text>
              <Text style={[styles.resultCode, { color: colors.mutedForeground }]}>{result.code} · {result.points} grade points</Text>
            </View>
            <View style={[styles.gradeBadge, { backgroundColor: colors.successSoft }]}>
              <Text style={[styles.gradeText, { color: colors.success }]}>{result.grade}</Text>
            </View>
          </View>
        ))}
      </View>
      <DemoDataCallout colors={colors} text="Grades shown here are sample entries, not official university results." />
    </View>
  );
}

function InformationScreen({
  colors,
  activeTab,
  setActiveTab,
}: {
  colors: ReturnType<typeof useColors>;
  activeTab: StudentInformationTab;
  setActiveTab: (tab: StudentInformationTab) => void;
}) {
  return (
    <View style={styles.studentInfoScreen}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.studentInfoTabs, { borderBottomColor: colors.border }]} contentContainerStyle={styles.studentInfoTabsContent}>
        {(Object.keys(studentInformationTabs) as StudentInformationTab[]).map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} accessibilityRole="tab" accessibilityState={{ selected: activeTab === tab }} style={styles.studentInfoTab}>
            <Text numberOfLines={1} style={[styles.studentInfoTabText, { color: activeTab === tab ? colors.foreground : colors.mutedForeground }]}>{tab}</Text>
            {activeTab === tab ? <View style={[styles.studentInfoTabUnderline, { backgroundColor: colors.primary }]} /> : null}
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.studentInfoRows}>
        {studentInformationTabs[activeTab].map(([label, value]) => (
          <View key={label} style={styles.studentInfoRow}>
            <Text style={[styles.studentInfoLabel, { color: colors.foreground }]}>{label}</Text>
            <Text style={[styles.studentInfoValue, { color: colors.mutedForeground }]}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function FeesScreen({ colors }: { colors: ReturnType<typeof useColors> }) {
  const feeRows = [
    { session: 'EVEN 2023-24', amount: '25000.00', receipt: 'C/TF/21/51254', date: '05-07-24', type: 'Admission Fees', semester: 'I' },
    { session: 'EVEN 2023-24', amount: '22000.00', receipt: 'C/TF/21/56104', date: '22-08-24', type: 'Admission Fees', semester: 'I' },
    { session: 'EVEN 2023-24', amount: '10000.00', receipt: 'C/TF/21/57544', date: '18-09-24', type: 'Admission Fees', semester: 'I' },
  ];
  return (
    <View style={styles.feeList}>
        {feeRows.map((row) => (
          <View key={row.receipt} style={[styles.feeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <FeeRow label="Session" value={row.session} colors={colors} />
            <FeeRow label="Amount" value={row.amount} colors={colors} />
            <FeeRow label="Receipt No" value={row.receipt} colors={colors} />
            <FeeRow label="Date" value={row.date} colors={colors} />
            <FeeRow label="Fees Type" value={row.type} colors={colors} />
            <FeeRow label="Semester Name" value={row.semester} colors={colors} />
          </View>
        ))}
    </View>
  );
}

function FeeRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.feeRow}>
      <Text style={[styles.feeRowLabel, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.feeRowValue, { color: colors.mutedForeground }]}>{value}</Text>
    </View>
  );
}

function ScheduleScreen({
  colors,
  activeDay,
  setActiveDay,
  dayMenuOpen,
  setDayMenuOpen,
}: {
  colors: ReturnType<typeof useColors>;
  activeDay: string;
  setActiveDay: (day: string) => void;
  dayMenuOpen: boolean;
  setDayMenuOpen: (open: boolean) => void;
}) {
  const dayNames: Record<string, string> = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday' };
  return (
    <View style={styles.scheduleScreen}>
      <Pressable onPress={() => setDayMenuOpen(!dayMenuOpen)} accessibilityRole="button" accessibilityState={{ expanded: dayMenuOpen }} accessibilityLabel={`Selected day: ${dayNames[activeDay]}`} testID="schedule-day-picker" style={styles.scheduleDayPicker}>
        <Text style={[styles.scheduleDayText, { color: colors.foreground }]}>{dayNames[activeDay]}</Text>
        <MaterialCommunityIcons name="menu-down" size={23} color={colors.mutedForeground} />
      </Pressable>
      {dayMenuOpen ? (
        <View style={[styles.scheduleDayMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {Object.keys(scheduleByDay).map((day) => (
            <Pressable key={day} onPress={() => { setActiveDay(day); setDayMenuOpen(false); }} accessibilityRole="button" accessibilityState={{ selected: activeDay === day }} style={styles.scheduleDayOption}>
              <Text style={[styles.scheduleDayText, { color: colors.foreground }]}>{dayNames[day]}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.scheduleCards}>
        {(scheduleByDay[activeDay] ?? []).map((item, index) => (
          <View key={`${activeDay}-${item.code}-${index}`} style={[styles.scheduleReferenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.scheduleReferenceHeader, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="timer-outline" size={23} color="#d3e1e8" />
            </View>
            <View style={styles.scheduleReferenceRow}>
              <Text style={[styles.scheduleReferenceLabel, { color: colors.foreground }]}>Subject Name</Text>
              <Text style={[styles.scheduleReferenceValue, { color: colors.mutedForeground }]}>{item.code}-{item.title}</Text>
            </View>
            <View style={styles.scheduleReferenceRow}>
              <Text style={[styles.scheduleReferenceLabel, { color: colors.foreground }]}>Faculty Name</Text>
              <Text style={[styles.scheduleReferenceValue, { color: colors.mutedForeground }]}>{item.faculty}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function PasswordScreen({
  colors,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  message,
  setMessage,
}: {
  colors: ReturnType<typeof useColors>;
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
}) {
  return (
    <View style={styles.passwordScreen}>
      <View style={styles.passwordFields}>
        <TextInput value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current Password" placeholderTextColor={colors.mutedForeground} secureTextEntry autoCapitalize="none" style={[styles.passwordInput, { borderBottomColor: colors.mutedForeground, color: colors.foreground }]} accessibilityLabel="Current Password" testID="current-password" />
        <TextInput value={newPassword} onChangeText={setNewPassword} placeholder="New Password" placeholderTextColor={colors.mutedForeground} secureTextEntry autoCapitalize="none" style={[styles.passwordInput, { borderBottomColor: colors.mutedForeground, color: colors.foreground }]} accessibilityLabel="New Password" testID="new-password" />
        <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm Password" placeholderTextColor={colors.mutedForeground} secureTextEntry autoCapitalize="none" style={[styles.passwordInput, { borderBottomColor: colors.mutedForeground, color: colors.foreground }]} accessibilityLabel="Confirm Password" testID="confirm-password" />
        <Pressable
          onPress={() => {
            if (!currentPassword || !newPassword || !confirmPassword) {
              setMessage('Please complete all three fields.');
            } else if (newPassword.length < 8 || !/[A-Z]/.test(newPassword)) {
              setMessage('Password must contain at least 8 characters and one capital letter.');
            } else if (newPassword !== confirmPassword) {
              setMessage('New Password and Confirm Password do not match.');
            } else {
              setMessage('Password changes are not connected to the university account in this local app.');
            }
          }}
          accessibilityRole="button"
          testID="submit-password-change"
          style={({ pressed }) => [styles.passwordSubmit, { backgroundColor: '#4388af', opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={styles.passwordSubmitText}>Submit</Text>
        </Pressable>
        {message ? <Text style={[styles.passwordFeedback, { color: colors.mutedForeground }]}>{message}</Text> : null}
      </View>
      <Text style={[styles.passwordRequirement, { color: colors.mutedForeground }]}>Password must contain atleast 8 characters, one Capital</Text>
    </View>
  );
}

function DemoDataCallout({ colors, text }: { colors: ReturnType<typeof useColors>; text: string }) {
  return (
    <View style={[styles.demoCallout, { backgroundColor: colors.secondary }]}>
      <MaterialCommunityIcons name="information-outline" size={17} color={colors.primary} />
      <Text style={[styles.demoCalloutText, { color: colors.mutedForeground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  appShell: { flex: 1, width: '100%', alignSelf: 'center', backgroundColor: 'transparent', position: 'relative' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontWeight: '500' },
  header: { minHeight: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 12 },
  referenceHeader: { height: 60, minHeight: 60, paddingHorizontal: 20, gap: 21 },
  headerIconButton: { width: 38, height: 42, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitleWrap: { flex: 1, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: 0.1 },
  referenceHeaderTitle: { fontSize: 21, fontWeight: '400', letterSpacing: 0 },
  homeHeader: { gap: 24 },
  homeHeaderTitle: { fontWeight: '600' },
  registrationHeader: { gap: 24, minHeight: 60 },
  registrationHeaderTitle: { fontWeight: '500' },
  headerSubtitle: { color: 'rgba(255,255,255,0.68)', fontSize: 11, marginTop: 2, letterSpacing: 0.35 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f4f1e9', alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { fontSize: 12, fontWeight: '800' },
  body: { flex: 1, flexDirection: 'row' },
  scrollArea: { flex: 1 },
  pageContent: { width: '100%', alignSelf: 'center', paddingTop: 22, paddingBottom: 24 },
  edgeToEdgePageContent: { paddingTop: 0, paddingHorizontal: 0 },
  feesPageContent: { paddingTop: 18, paddingBottom: 96, paddingHorizontal: 22 },
  passwordPageContent: { flexGrow: 1, paddingTop: 16, paddingHorizontal: 5, paddingBottom: 4 },
  homePageContent: { flexGrow: 1, paddingTop: 0, paddingBottom: 26 },
  registrationPageContent: { paddingTop: 0 },
  homeBottomInset: { position: 'absolute', left: 0, right: 0 },
  homeProfileScreen: { width: '100%', alignItems: 'center' },
  homeUniversity: { fontSize: 17, lineHeight: 23, fontWeight: '700', textAlign: 'center' },
  homeProfileImage: { width: 134, height: 134, borderRadius: 67, marginTop: 24 },
  homeProfileName: { fontSize: 20, lineHeight: 25, fontWeight: '400', marginTop: 15 },
  homeInfoList: { alignSelf: 'stretch', marginTop: 42 },
  homeInfoItem: { marginBottom: 18 },
  homeInfoLabel: { fontSize: 14, lineHeight: 19 },
  homeInfoValue: { fontSize: 16, lineHeight: 22, marginTop: 7 },
  desktopSidebar: { width: 236, borderRightWidth: 1, paddingHorizontal: 14, paddingTop: 20 },
  sidebarIdentity: { alignItems: 'center', paddingBottom: 20, marginBottom: 12 },
  avatarLarge: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 21, fontWeight: '700' },
  sidebarName: { fontSize: 16, fontWeight: '700', marginTop: 11 },
  sidebarId: { fontSize: 12, marginTop: 4 },
  navItem: { minHeight: 48, paddingHorizontal: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4, position: 'relative' },
  navItemCompact: { minHeight: 44, paddingHorizontal: 11, gap: 11 },
  navLabel: { fontSize: 14, flex: 1 },
  navSelectedMark: { position: 'absolute', right: 9, width: 5, height: 5, borderRadius: 3 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 14 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6 },
  welcomeTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.4 },
  welcomeSubtext: { fontSize: 14, marginTop: 4 },
  homeAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  homeAvatarText: { fontSize: 18, fontWeight: '700' },
  attendanceHero: { borderRadius: 20, padding: 20, overflow: 'hidden' },
  heroTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroKicker: { color: 'rgba(255,255,255,0.70)', fontSize: 10, fontWeight: '700', letterSpacing: 1.15 },
  heroValue: { color: '#ffffff', fontSize: 40, lineHeight: 47, fontWeight: '700', marginTop: 5 },
  heroPercent: { fontSize: 21, fontWeight: '500' },
  ringLabel: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  ringNumber: { fontSize: 21, fontWeight: '700' },
  ringPercent: { fontSize: 10, marginTop: 3, marginLeft: 1 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.16)', marginTop: 17, marginBottom: 13 },
  heroBottomLine: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  heroMetric: { flex: 1 },
  heroMetricValue: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  heroMetricSlash: { color: 'rgba(255,255,255,0.70)', fontWeight: '500', fontSize: 13 },
  heroMetricLabel: { color: 'rgba(255,255,255,0.68)', fontSize: 11, marginTop: 3 },
  targetPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  targetPillText: { color: '#ffffff', fontSize: 11, fontWeight: '600' },
  sectionSpacing: { marginTop: 25 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  inlineAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inlineActionText: { fontSize: 12, fontWeight: '700' },
  coursePreviewGrid: { gap: 9 },
  coursePreviewGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  coursePreview: { borderWidth: 1, borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  coursePreviewTitle: { fontSize: 13, fontWeight: '700' },
  coursePreviewCode: { fontSize: 11, marginTop: 3 },
  coursePreviewMeta: { fontSize: 11, marginTop: 5, fontWeight: '600' },
  quickAccessGrid: { gap: 9 },
  quickAccessItem: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 62, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12 },
  quickIcon: { width: 37, height: 37, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
  quickLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  noticeTeaser: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 20, flexDirection: 'row', gap: 11 },
  noticeIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  noticeTeaserLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 5 },
  noticeTeaserTitle: { fontSize: 13, fontWeight: '600', lineHeight: 19 },
  noticeLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 9, alignSelf: 'flex-start' },
  noticeDate: { fontSize: 9, fontWeight: '700', marginTop: 2 },
  pageIntro: { marginBottom: 18 },
  pageHeading: { fontSize: 25, fontWeight: '700', letterSpacing: -0.4 },
  pageSubheading: { fontSize: 13, marginTop: 5, lineHeight: 19 },
  registrationScreen: { width: '100%' },
  registrationSession: { minHeight: 56, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 11 },
  registrationSessionText: { fontSize: 16, fontWeight: '700' },
  registrationSummary: { borderWidth: 1, borderRadius: 4, marginTop: 20, paddingHorizontal: 11, paddingVertical: 8 },
  registrationSummaryRow: { height: 32, flexDirection: 'row', alignItems: 'center' },
  registrationSummaryLabel: { width: '51%', fontSize: 14 },
  registrationSummaryValue: { flex: 1, fontSize: 14 },
  registrationTable: { marginTop: 10, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1 },
  registrationTableHeader: { minHeight: 47, flexDirection: 'row' },
  registrationTableRow: { minHeight: 59, flexDirection: 'row' },
  registrationCell: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3, paddingVertical: 2, borderRightWidth: 1, borderBottomWidth: 1 },
  registrationSerialCell: { width: '12.2%' },
  registrationCourseCell: { flex: 1 },
  registrationSemesterCell: { width: '21%' },
  registrationLastCell: { borderRightWidth: 0 },
  registrationHeaderCell: { minHeight: 47 },
  registrationTableHeaderText: { fontSize: 16, lineHeight: 20, textAlign: 'center' },
  registrationTableText: { fontSize: 16, lineHeight: 19, textAlign: 'center' },
  attendanceStudentHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 13 },
  attendanceStudentName: { fontSize: 15, fontWeight: '800', letterSpacing: 0.1 },
  attendanceStudentProgram: { fontSize: 13, marginTop: 4 },
  attendanceSummary: { borderWidth: 1, borderRadius: 17, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 15 },
  summaryDetails: { flex: 1 },
  summaryTitle: { fontSize: 14, fontWeight: '700' },
  summaryText: { fontSize: 11, marginTop: 4 },
  summaryProgressTrack: { height: 6, borderRadius: 4, backgroundColor: '#e7ecee', marginTop: 12, position: 'relative' },
  summaryProgressFill: { height: 6, borderRadius: 4 },
  targetTick: { position: 'absolute', top: -3, width: 2, height: 12, marginLeft: -1 },
  targetHint: { fontSize: 10, marginTop: 6 },
  attendanceNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 13, marginBottom: 14, paddingHorizontal: 2 },
  attendanceNoteText: { fontSize: 11, lineHeight: 16, flex: 1 },
  courseList: { gap: 13 },
  courseListWide: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
  courseCard: { borderWidth: 1, borderRadius: 4, overflow: 'hidden', width: '100%' },
  courseCardWide: { width: '48.7%' },
  courseCardPress: {},
  courseCardHeader: { minHeight: 36, paddingVertical: 7, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  courseHeaderTitle: { color: '#ffffff', textAlign: 'center', fontSize: 14, lineHeight: 18, fontWeight: '500' },
  courseCardBody: { minHeight: 115, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, gap: 10 },
  courseRingWrap: { width: 102, height: 102, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  courseStats: { flex: 1, gap: 10 },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 14, minWidth: 24, textAlign: 'right' },
  attendanceArrow: { width: 23, height: 23, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  facultyRow: { borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 37, paddingHorizontal: 8 },
  facultyLabel: { fontSize: 14 },
  facultyName: { fontSize: 14, flex: 1 },
  recordActions: { borderTopWidth: 1, padding: 12 },
  recordPrompt: { fontSize: 11, marginBottom: 9 },
  recordButtons: { flexDirection: 'row', gap: 8 },
  recordButton: { flex: 1, borderRadius: 10, minHeight: 38, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  recordButtonText: { fontSize: 12, fontWeight: '700' },
  noticeList: { gap: 11 },
  noticeCard: { borderWidth: 1, borderRadius: 16, padding: 14 },
  noticeCardTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  noticeDateBox: { width: 43, height: 47, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  noticeDateText: { fontSize: 15, fontWeight: '700' },
  noticeMonthText: { fontSize: 8, fontWeight: '700', marginTop: 1 },
  noticeTag: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  noticeCardTitle: { fontSize: 13, lineHeight: 18, fontWeight: '700' },
  noticeBody: { fontSize: 12, lineHeight: 18, marginTop: 12, marginLeft: 54 },
  statusHero: { borderWidth: 1, borderRadius: 17, padding: 18 },
  statusIcon: { width: 49, height: 49, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  statusLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  statusHeadline: { fontSize: 20, fontWeight: '700', marginTop: 6 },
  statusDescription: { fontSize: 12, lineHeight: 18, marginTop: 7, marginBottom: 17 },
  statusMetaRow: { minHeight: 39, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1 },
  statusMetaLabel: { fontSize: 11 },
  statusMetaValue: { fontSize: 11, fontWeight: '600' },
  gpaCard: { borderRadius: 18, padding: 19, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gpaKicker: { color: 'rgba(255,255,255,0.68)', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  gpaValue: { color: '#ffffff', fontSize: 36, fontWeight: '700', marginTop: 5 },
  gpaScale: { color: 'rgba(255,255,255,0.68)', fontSize: 15, fontWeight: '500' },
  gpaCaption: { color: 'rgba(255,255,255,0.72)', fontSize: 11, marginTop: 1 },
  gpaIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  resultSection: { marginTop: 22 },
  resultRow: { borderWidth: 1, borderRadius: 13, padding: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultIndex: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  resultIndexText: { fontSize: 10, fontWeight: '700' },
  resultSubject: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
  resultCode: { fontSize: 9, marginTop: 3 },
  gradeBadge: { minWidth: 36, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  gradeText: { fontSize: 12, fontWeight: '800' },
  profileCard: { borderWidth: 1, borderRadius: 17, alignItems: 'center', padding: 20, marginBottom: 12 },
  profileAvatar: { width: 86, height: 86, borderRadius: 43, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { fontSize: 27, fontWeight: '700' },
  profileName: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  profileProgram: { fontSize: 12, marginTop: 5, textAlign: 'center' },
  profilePill: { borderRadius: 14, paddingHorizontal: 11, paddingVertical: 6, marginTop: 12 },
  profilePillText: { fontSize: 10, fontWeight: '700' },
  infoCard: { borderWidth: 1, borderRadius: 15, paddingHorizontal: 14 },
  infoRow: { minHeight: 48, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  infoLabel: { fontSize: 11 },
  infoValue: { fontSize: 11, fontWeight: '600', textAlign: 'right', flex: 1 },
  feesSummary: { borderRadius: 18, padding: 19, marginBottom: 14 },
  feesKicker: { color: 'rgba(255,255,255,0.68)', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  feesValue: { color: '#ffffff', fontSize: 30, fontWeight: '700', marginTop: 7 },
  feesSummaryBottom: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  feesSummaryText: { color: 'rgba(255,255,255,0.78)', fontSize: 11 },
  feeIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  feeTitle: { fontSize: 11, fontWeight: '600', lineHeight: 16 },
  feeDate: { fontSize: 8, fontWeight: '600', letterSpacing: 0.3, marginTop: 4 },
  feeAmount: { fontSize: 11, fontWeight: '700' },
  studentInfoScreen: { width: '100%' },
  studentInfoTabs: { flexGrow: 0, minHeight: 54, borderBottomWidth: 1 },
  studentInfoTabsContent: { flexDirection: 'row' },
  studentInfoTab: { width: 168, height: 54, paddingHorizontal: 14, alignItems: 'flex-start', justifyContent: 'center' },
  studentInfoTabText: { fontSize: 14, fontWeight: '400' },
  studentInfoTabUnderline: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 2 },
  studentInfoRows: { paddingHorizontal: 10, paddingTop: 8 },
  studentInfoRow: { flexDirection: 'row', alignItems: 'center', minHeight: 39, paddingVertical: 5 },
  studentInfoLabel: { width: '51%', fontSize: 18, lineHeight: 22, fontWeight: '700' },
  studentInfoValue: { flex: 1, fontSize: 16, lineHeight: 21 },
  feeList: { gap: 14 },
  feeCard: {
    borderWidth: 1,
    borderRadius: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  feeRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center' },
  feeRowLabel: { width: '50%', fontSize: 17, lineHeight: 22, fontWeight: '700' },
  feeRowValue: { flex: 1, fontSize: 16, lineHeight: 21 },
  feesFooter: { position: 'absolute', left: 0, right: 0, minHeight: 70, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'flex-end', zIndex: 3 },
  feeFeedback: { width: '100%', textAlign: 'right', fontSize: 10, marginBottom: 4 },
  outstandingButton: { minWidth: 214, minHeight: 43, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  outstandingButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '400' },
  scheduleScreen: { width: '100%' },
  scheduleDayPicker: { width: '100%', minHeight: 46, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  scheduleDayText: { fontSize: 17, fontWeight: '600' },
  scheduleDayMenu: { borderWidth: 1, marginHorizontal: 18, marginBottom: 12, elevation: 3, shadowColor: '#000000', shadowOpacity: 0.14, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
  scheduleDayOption: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 12 },
  scheduleCards: { paddingHorizontal: 18, gap: 14 },
  scheduleReferenceCard: {
    borderWidth: 1,
    borderRadius: 2,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.17,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  scheduleReferenceHeader: { height: 41, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 13 },
  scheduleReferenceRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 5 },
  scheduleReferenceLabel: { width: '51%', fontSize: 17, lineHeight: 22, fontWeight: '700' },
  scheduleReferenceValue: { flex: 1, fontSize: 16, lineHeight: 20 },
  passwordScreen: { flex: 1, justifyContent: 'space-between' },
  passwordFields: { width: '100%' },
  passwordInput: { height: 46, paddingHorizontal: 0, paddingVertical: 7, borderBottomWidth: 1, fontSize: 16, marginBottom: 18 },
  passwordSubmit: { alignSelf: 'center', width: 98, height: 37, alignItems: 'center', justifyContent: 'center', marginTop: 0, elevation: 2, shadowColor: '#000000', shadowOpacity: 0.16, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
  passwordSubmitText: { color: '#ffffff', fontSize: 16, fontWeight: '400' },
  passwordFeedback: { textAlign: 'center', fontSize: 12, lineHeight: 17, marginTop: 10 },
  passwordRequirement: { fontSize: 15, lineHeight: 20, paddingHorizontal: 16, paddingBottom: 4 },
  dayPicker: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  dayButton: { flex: 1, minHeight: 39, borderWidth: 1, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  dayButtonText: { fontSize: 11, fontWeight: '700' },
  timeline: { gap: 2 },
  timelineEntry: { flexDirection: 'row', minHeight: 103 },
  timeColumn: { width: 78, alignItems: 'flex-start', position: 'relative' },
  timeText: { fontSize: 9, fontWeight: '600', marginTop: 5 },
  timelineDot: { position: 'absolute', top: 27, right: 12, width: 9, height: 9, borderRadius: 5, zIndex: 1 },
  timelineLine: { position: 'absolute', top: 36, bottom: -2, right: 15, width: 2 },
  scheduleCard: { flex: 1, borderWidth: 1, borderRadius: 13, padding: 12, marginBottom: 10 },
  scheduleCode: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  scheduleTitle: { fontSize: 13, fontWeight: '700', marginTop: 5 },
  scheduleMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  scheduleMetaText: { fontSize: 9 },
  metaDivider: { width: 1, height: 12, marginHorizontal: 2 },
  passwordInfo: { borderWidth: 1, borderRadius: 17, padding: 18 },
  passwordIcon: { width: 49, height: 49, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  passwordTitle: { fontSize: 17, fontWeight: '700', marginTop: 15 },
  passwordBody: { fontSize: 12, lineHeight: 19, marginTop: 8 },
  passwordNotice: { borderRadius: 12, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  passwordNoticeText: { flex: 1, fontSize: 10, lineHeight: 15, fontWeight: '600' },
  demoCallout: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', padding: 11, borderRadius: 12, marginTop: 14 },
  demoCalloutText: { flex: 1, fontSize: 10, lineHeight: 15 },
  disclaimer: { textAlign: 'center', fontSize: 9, marginTop: 24, paddingBottom: 10 },
  drawerOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(7,25,39,0.48)' },
  drawerScrim: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  drawer: { height: '100%', maxWidth: '88%', elevation: 12 },
  drawerProfile: { paddingHorizontal: 20, paddingTop: 26, paddingBottom: 19 },
  drawerTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  closeDrawerButton: { width: 35, height: 35, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  drawerName: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  drawerId: { color: 'rgba(255,255,255,0.68)', fontSize: 11, marginTop: 4 },
  drawerList: { padding: 12, paddingTop: 14 },
  drawerFooter: { minHeight: 47, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 17 },
  drawerFooterText: { fontSize: 9, flex: 1 },
});
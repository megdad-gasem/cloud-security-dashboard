// =====================================================================
// mockData.js
// كل البيانات الوهمية (mock) المستخدمة في الداشبورد مجمّعة هنا في مكان
// واحد. لما توصل الـ backend الحقيقي بتاعك، بس استبدل القيم دي بنداءات
// API (fetch/axios) داخل useEffect جوه App.jsx أو جوه كل كومبوننت.
// =====================================================================

// بيانات چارت استخدام الـ CPU (خط زمني على مدار 24 ساعة)
export const cpuUtilizationData = [
  { time: '00:00', cpu: 28 },
  { time: '02:00', cpu: 45 },
  { time: '04:00', cpu: 22 },
  { time: '06:00', cpu: 38 },
  { time: '08:00', cpu: 55 },
  { time: '10:00', cpu: 40 },
  { time: '12:00', cpu: 42 },
  { time: '14:00', cpu: 68 },
  { time: '16:00', cpu: 50 },
  { time: '18:00', cpu: 60 },
  { time: '20:00', cpu: 35 },
  { time: '22:00', cpu: 48 },
  { time: '24:00', cpu: 30 },
]

// بيانات الأحداث الأمنية الأخيرة
export const recentSecurityEvents = [
  {
    id: 1,
    title: 'SSH Brute Force detected',
    subtitle: 'GuardDuty Finding',
    severity: 'High',
    time: '10:23AM',
    color: 'red',
  },
  {
    id: 2,
    title: 'IAM policy changed',
    subtitle: 'CloudTrail Event',
    severity: 'Medium',
    time: '09:45AM',
    color: 'red',
  },
  {
    id: 3,
    title: 'S3 public access blocked',
    subtitle: 'AWS Config Rule',
    severity: 'Medium',
    time: '08:15AM',
    color: 'amber',
  },
  {
    id: 4,
    title: 'WAF rule triggered',
    subtitle: 'Web ACL',
    severity: 'Low',
    time: '07:32AM',
    color: 'blue',
  },
  {
    id: 5,
    title: 'Security group modified',
    subtitle: 'CloudTrail Event',
    severity: 'Low',
    time: '06:50AM',
    color: 'green',
  },
]

// بيانات دونات "نظرة عامة على الالتزام" (Compliance Overview)
export const complianceBreakdown = [
  { name: 'Compliant', value: 41, percent: 92, color: '#22C55E' },
  { name: 'Failed', value: 2, percent: 4, color: '#EF4444' },
  { name: 'Warning', value: 2, percent: 4, color: '#F59E0B' },
]

// أهم القواعد الفاشلة (Top Failed Rules)
export const topFailedRules = [
  { id: 1, name: 'S3 Bucket Public Read Prohibited', status: 'Failed' },
  { id: 2, name: 'IAM Root Access Key Check', status: 'Failed' },
  { id: 3, name: 'Security Group - Unrestricted SSH', status: 'Warning' },
]

// جدول EC2 Instances
export const ec2Instances = [
  {
    id: 'i-0a1b2c3d4e5f6g7h8',
    name: 'Web-01',
    status: 'Running',
    cpu: 22,
    memory: 54,
    publicIp: '3.125.45.67',
  },
  {
    id: 'i-0b1c2d3e4f5g6h7i8',
    name: 'Web-02',
    status: 'Running',
    cpu: 18,
    memory: 47,
    publicIp: '3.126.78.90',
  },
  {
    id: 'i-0c1d2e3f4g5h6i7j8',
    name: 'DB-01',
    status: 'Stopped',
    cpu: 0,
    memory: 0,
    publicIp: '-',
  },
]

// إجراءات سريعة (Quick Actions)
export const quickActions = [
  { id: 1, label: 'Isolate Instance', icon: 'ShieldAlert', color: 'red' },
  { id: 2, label: 'Create Snapshot', icon: 'Camera', color: 'purple' },
  { id: 3, label: 'Block IP Address', icon: 'Ban', color: 'amber' },
  { id: 4, label: 'View Logs', icon: 'FileText', color: 'blue' },
  { id: 5, label: 'Restart Instance', icon: 'RotateCw', color: 'green' },
  { id: 6, label: 'Send Notification', icon: 'Send', color: 'blue' },
]

// كروت حالة خدمات الأمان في الأسفل (Service Status Cards)
export const securityServices = [
  {
    id: 1,
    name: 'GuardDuty',
    icon: 'ShieldCheck',
    color: 'green',
    status: 'Enabled',
    detail: 'No issues',
    detailColor: 'green',
  },
  {
    id: 2,
    name: 'CloudTrail',
    icon: 'Cloud',
    color: 'purple',
    status: 'Enabled',
    detail: 'Logging',
    detailColor: 'gray',
  },
  {
    id: 3,
    name: 'AWS Config',
    icon: 'Settings',
    color: 'amber',
    status: 'Enabled',
    detail: 'Recording',
    detailColor: 'gray',
  },
  {
    id: 4,
    name: 'Security Hub',
    icon: 'Shield',
    color: 'teal',
    status: 'Enabled',
    detail: '2 Findings',
    detailColor: 'amber',
  },
  {
    id: 5,
    name: 'WAF',
    icon: 'ShieldCheck',
    color: 'blue',
    status: 'Enabled',
    detail: 'Web ACL: active',
    detailColor: 'gray',
  },
  {
    id: 6,
    name: 'Backup',
    icon: 'Archive',
    color: 'amber',
    status: 'Enabled',
    detail: 'Last backup: 2h ago',
    detailColor: 'gray',
  },
]

// عناصر شريط التنقل الجانبي (Sidebar)
export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'infrastructure', label: 'Infrastructure', icon: 'Server' },
  { id: 'monitoring', label: 'Monitoring', icon: 'Activity' },
  { id: 'security', label: 'Security', icon: 'Shield' },
  { id: 'iam', label: 'IAM', icon: 'Users' },
  { id: 'logs', label: 'Logs', icon: 'FileText' },
  { id: 'incidents', label: 'Incidents', icon: 'AlertCircle' },
  { id: 'compliance', label: 'Compliance', icon: 'ClipboardCheck' },
  { id: 'reports', label: 'Reports', icon: 'BarChart3' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
]

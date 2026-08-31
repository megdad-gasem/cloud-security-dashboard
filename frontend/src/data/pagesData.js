// =====================================================================
// pagesData.js
// بيانات وهمية (mock) معزولة لصفحات Aegis السبع (Security / IAM / Logs /
// Incidents / Compliance / Reports / Settings). كل البيانات هنا في مكان
// واحد — مش hardcoded جوه الكومبوننتس. لما تتوفر الـ API الحقيقي، بدّل
// القيم دي بنداءات fetch داخل الـ store بدل الكومبوننتس.
//
// ملاحظة: بعض الحقول اتضافت عشان طبقة الإجراءات (Actions Layer):
//   - logs[].resource / logs[].status  (عشان View Resource / Block / Respond)
//   - controls[].resource              (عشان View Affected Resource)
// =====================================================================

// ----------------------------- Security ------------------------------
export const securityFindings = [
  { id: 'SEC-201', title: 'SSH open to the world on web SG', severity: 'Critical', status: 'Open', resource: 'aegis-sg-web', resourceType: 'Security Group', source: 'GuardDuty', detected: '12m ago' },
  { id: 'SEC-198', title: 'Public read on backup bucket', severity: 'High', status: 'Open', resource: 'aegis-backups-prod', resourceType: 'S3 Bucket', source: 'Config', detected: '1h ago' },
  { id: 'SEC-195', title: 'Root account used in last 24h', severity: 'Critical', status: 'Investigating', resource: 'root', resourceType: 'IAM User', source: 'CloudTrail', detected: '3h ago' },
  { id: 'SEC-190', title: 'Unapproved inbound 3389 (RDP)', severity: 'High', status: 'Open', resource: 'aegis-sg-app', resourceType: 'Security Group', source: 'Config', detected: '5h ago' },
  { id: 'SEC-184', title: 'IAM policy overly permissive (s3:*)', severity: 'Medium', status: 'Resolved', resource: 'role/deploy', resourceType: 'IAM Role', source: 'IAM Access Analyzer', detected: '1d ago' },
  { id: 'SEC-179', title: 'Disabled CloudTrail in eu-west-1', severity: 'High', status: 'Open', resource: 'trail/primary', resourceType: 'CloudTrail', source: 'Config', detected: '1d ago' },
  { id: 'SEC-172', title: 'Outdated AMI on web tier', severity: 'Low', status: 'Open', resource: 'aegis-web-01', resourceType: 'EC2 Instance', source: 'Inspector', detected: '2d ago' },
  { id: 'SEC-168', title: 'No flow logs on VPC', severity: 'Medium', status: 'Open', resource: 'aegis-vpc', resourceType: 'VPC', source: 'Config', detected: '2d ago' },
]

export const securityActivity = [
  { id: 'a1', action: 'Finding opened', resource: 'aegis-sg-web', severity: 'Critical', time: '12m ago' },
  { id: 'a2', action: 'Severity raised', resource: 'trail/primary', severity: 'High', time: '1h ago' },
  { id: 'a3', action: 'Finding resolved', resource: 'role/deploy', severity: 'Medium', time: '1d ago' },
  { id: 'a4', action: 'Anomaly detected', resource: 'root', severity: 'Critical', time: '3h ago' },
  { id: 'a5', action: 'Scan completed', resource: 'aegis-vpc', severity: 'Low', time: '2d ago' },
]

export function getSecuritySummary() {
  const open = securityFindings.filter((f) => f.status !== 'Resolved').length
  const bySev = (s) => securityFindings.filter((f) => f.severity === s).length
  const affected = new Set(securityFindings.map((f) => f.resource)).size
  return { total: securityFindings.length, open, critical: bySev('Critical'), high: bySev('High'), affected }
}

// ------------------------------- IAM ---------------------------------
export const identities = [
  { id: 'u-admin', name: 'admin@cloudsec.com', type: 'User', mfa: 'Enabled', lastActivity: '2m ago', roles: ['AdministratorAccess'], privileged: true, credential: 'password', activeSession: true },
  { id: 'u-deploy', name: 'svc-deploy', type: 'Service', mfa: 'N/A', lastActivity: '14m ago', roles: ['role/deploy'], privileged: false, credential: 'access-key', activeSession: false },
  { id: 'u-ana', name: 'ana.ops', type: 'User', mfa: 'Enabled', lastActivity: '1h ago', roles: ['ReadOnlyAccess', 'Billing'], privileged: false, credential: 'password', activeSession: false },
  { id: 'u-pipe', name: 'svc-pipeline', type: 'Service', mfa: 'N/A', lastActivity: '22m ago', roles: ['role/build'], privileged: false, credential: 'access-key', activeSession: false },
  { id: 'u-omar', name: 'omar.sec', type: 'User', mfa: 'Disabled', lastActivity: '6h ago', roles: ['SecurityAudit'], privileged: false, credential: 'password', activeSession: false },
  { id: 'u-root', name: 'root', type: 'User', mfa: 'Disabled', lastActivity: '3h ago', roles: ['AdministratorAccess'], privileged: true, credential: 'password', activeSession: true },
]

export const roles = [
  { id: 'r-admin', name: 'AdministratorAccess', permissions: 980, usedBy: 2, risk: 'High', reviewed: false },
  { id: 'r-deploy', name: 'role/deploy', permissions: 42, usedBy: 1, risk: 'Medium', reviewed: false },
  { id: 'r-build', name: 'role/build', permissions: 18, usedBy: 1, risk: 'Low', reviewed: false },
  { id: 'r-read', name: 'ReadOnlyAccess', permissions: 310, usedBy: 1, risk: 'Low', reviewed: false },
  { id: 'r-bill', name: 'Billing', permissions: 11, usedBy: 1, risk: 'Low', reviewed: false },
]

export const accessAnomalies = [
  { id: 'an-1', principal: 'root', type: 'Console login', severity: 'Critical', detail: 'Root used after 90-day dormancy', time: '3h ago' },
  { id: 'an-2', principal: 'omar.sec', type: 'MFA disabled', severity: 'High', detail: 'MFA deactivated on privileged user', time: '6h ago' },
  { id: 'an-3', principal: 'svc-deploy', type: 'New region', severity: 'Medium', detail: 'AssumeRole from eu-central-1 (unexpected)', time: '1d ago' },
  { id: 'an-4', principal: 'u-ana', type: 'Policy change', severity: 'Low', detail: 'Added Billing to ana.ops', time: '2d ago' },
]

export function getIamSummary() {
  return {
    identities: identities.length,
    roles: roles.length,
    privileged: identities.filter((i) => i.privileged).length,
    anomalies: accessAnomalies.length,
    mfaOff: identities.filter((i) => i.mfa === 'Disabled').length,
  }
}

// ------------------------------- Logs --------------------------------
// resource: وجهة العرض في Infrastructure (لو موجود) — status: New | Responded
export const logStream = [
  {
    id: 'L-9001', time: '10:24:11', severity: 'High', source: 'GuardDuty',
    message: 'Unauthorized API call from 203.0.113.7', resource: 'svc-deploy', resourceType: 'IAM principal',
    status: 'New', details: 'Principal svc-deploy called ec2:DescribeInstances from an unrecognized IP. Confidence: High.',
    actor: 'svc-deploy (compromised principal)', sourceIp: '203.0.113.7', region: 'us-east-1',
    operation: 'ec2:DescribeInstances', result: 'Denied', detectionSource: 'GuardDuty',
    blockableSource: true, incidentEligible: true, relatedFinding: 'SEC-204',
  },
  {
    id: 'L-9000', time: '10:23:40', severity: 'Medium', source: 'CloudTrail',
    message: 'IAM policy attached to user', resource: 'ana.ops', resourceType: 'IAM user',
    status: 'New', details: 'ana.ops was granted Billing by u-admin. No approval ticket referenced.',
    actor: 'u-admin', sourceIp: '—', region: 'us-east-1',
    operation: 'iam:AttachUserPolicy', result: 'Allowed (no ticket)', detectionSource: 'CloudTrail',
    blockableSource: false, incidentEligible: true, relatedFinding: 'SEC-202',
  },
  {
    id: 'L-8999', time: '10:21:02', severity: 'Low', source: 'Config',
    message: 'Resource compliance state changed', resource: 'aegis-sg-web', resourceType: 'Security Group',
    status: 'New', details: 'aegis-sg-web transitioned to NON_COMPLIANT for rule sg-open-ssh.',
    actor: 'Config rule sg-open-ssh', sourceIp: '—', region: 'us-east-1',
    operation: 'compliance-state-change', result: 'NON_COMPLIANT', detectionSource: 'Config',
    blockableSource: false, incidentEligible: false,
  },
  {
    id: 'L-8998', time: '10:18:55', severity: 'Critical', source: 'CloudTrail',
    message: 'Root account console login', resource: 'root', resourceType: 'Root account',
    status: 'New', details: 'Root signed in from 198.51.100.22 (Tor exit). MFA not challenged.',
    actor: 'root', sourceIp: '198.51.100.22', region: 'us-east-1',
    operation: 'console:Login', result: 'Success (MFA not challenged)', detectionSource: 'CloudTrail',
    blockableSource: false, incidentEligible: true, relatedIncident: 'INC-1042',
  },
  {
    id: 'L-8997', time: '10:15:30', severity: 'Info', source: 'VPC Flow',
    message: 'Flow logs enabled on subnet', resource: 'subnet-priv-2b', resourceType: 'Subnet',
    status: 'New', details: 'subnet-priv-2b now exporting flow logs to aegis-logs-prod.',
    actor: 'Config (auto)', sourceIp: '—', region: 'us-east-1',
    operation: 'vpc:EnableFlowLogs', result: 'Success', detectionSource: 'VPC Flow',
    blockableSource: false, incidentEligible: false,
  },
  {
    id: 'L-8996', time: '10:12:09', severity: 'Medium', source: 'Inspector',
    message: 'CVE found on instance', resource: 'aegis-web-01', resourceType: 'EC2 instance',
    status: 'New', details: 'aegis-web-01 has CVE-2024-3094 (cvss 9.8). Patch pending.',
    actor: 'Inspector', sourceIp: '—', region: 'us-east-1',
    operation: 'inspector:Finding', result: 'CVE-2024-3094 (cvss 9.8)', detectionSource: 'Inspector',
    blockableSource: false, incidentEligible: true, relatedFinding: 'SEC-208',
  },
  {
    id: 'L-8995', time: '10:09:44', severity: 'Low', source: 'WAF',
    message: 'Rule triggered', resource: 'waf', resourceType: 'Web ACL',
    status: 'New', details: 'Web ACL blocked 12 requests from ASN 9009 (known scanner).',
    actor: 'WAF', sourceIp: 'ASN 9009', region: 'us-east-1',
    operation: 'waf:BlockRequests', result: 'Blocked (12 req)', detectionSource: 'WAF',
    blockableSource: false, incidentEligible: false,
  },
  {
    id: 'L-8994', time: '10:05:01', severity: 'Info', source: 'CloudTrail',
    message: 'Snapshot created', resource: 'ami-0f8a13b1', resourceType: 'AMI',
    status: 'New', details: 'ami-0f8a13b1 snapshot snap-0aa11 copied to dr region.',
    actor: 'u-admin', sourceIp: '—', region: 'us-east-1',
    operation: 'ec2:CreateSnapshot', result: 'Success', detectionSource: 'CloudTrail',
    blockableSource: false, incidentEligible: false,
  },
]

// ----------------------------- Incidents -----------------------------
export const incidents = [
  {
    id: 'INC-1042', title: 'Root account compromise suspected', severity: 'Critical', status: 'Investigating',
    assignee: 'omar.sec', updated: '18m ago',
    resources: ['root', 'aegis-vpc', 'aegis-db'],
    resourcesDetail: [
      { name: 'root', type: 'IAM User', status: 'Compromised', contained: false },
      { name: 'aegis-vpc', type: 'VPC', status: 'Active', contained: false },
      { name: 'aegis-db', type: 'RDS', status: 'Active', contained: false },
    ],
    containable: true, accessRisk: true, publicExposed: false,
    resourcesIsolated: false, accessRevoked: false, publicAccessDisabled: false,
    timeline: [
      { time: '10:02', by: 'GuardDuty', kind: 'detection', text: 'Anomaly: root console login from Tor exit' },
      { time: '10:05', by: 'omar.sec', kind: 'investigation', text: 'Opened incident, disabled root keys' },
      { time: '10:21', by: 'CloudTrail', kind: 'investigation', text: 'Confirmed IAM key usage before disable' },
      { time: '10:38', by: 'omar.sec', kind: 'response', text: 'Rotating delegated admin credentials' },
    ],
  },
  {
    id: 'INC-1041', title: 'Public S3 backup exposure', severity: 'High', status: 'Containment',
    assignee: 'ana.ops', updated: '44m ago',
    resources: ['aegis-backups-prod'],
    resourcesDetail: [
      { name: 'aegis-backups-prod', type: 'S3 Bucket', status: 'Exposed', contained: false },
    ],
    containable: false, accessRisk: false, publicExposed: true,
    resourcesIsolated: false, accessRevoked: false, publicAccessDisabled: true,
    timeline: [
      { time: '09:10', by: 'Config', kind: 'detection', text: 'Bucket policy allows public read' },
      { time: '09:14', by: 'ana.ops', kind: 'response', text: 'Applied BlockPublicAccess' },
      { time: '09:30', by: 'Macie', kind: 'investigation', text: 'Scanning objects for sensitive data' },
    ],
  },
  {
    id: 'INC-1040', title: 'RDP exposed on app SG', severity: 'High', status: 'Open',
    assignee: 'svc-deploy', updated: '2h ago',
    resources: ['aegis-sg-app', 'aegis-app-01'],
    resourcesDetail: [
      { name: 'aegis-sg-app', type: 'Security Group', status: 'Exposed (3389/0.0.0.0)', contained: false },
      { name: 'aegis-app-01', type: 'EC2', status: 'Active', contained: false },
    ],
    containable: true, accessRisk: true, publicExposed: false,
    resourcesIsolated: false, accessRevoked: false, publicAccessDisabled: false,
    timeline: [
      { time: '08:01', by: 'Config', kind: 'detection', text: 'Inbound 3389 from 0.0.0.0/0 detected' },
      { time: '08:20', by: 'svc-deploy', kind: 'investigation', text: 'Awaiting change approval to restrict CIDR' },
    ],
  },
  {
    id: 'INC-1038', title: 'Disabled CloudTrail', severity: 'Medium', status: 'Resolved',
    assignee: 'omar.sec', updated: '1d ago',
    resources: ['trail/primary'],
    resourcesDetail: [
      { name: 'trail/primary', type: 'CloudTrail', status: 'Active', contained: false },
    ],
    containable: false, accessRisk: false, publicExposed: false,
    resourcesIsolated: false, accessRevoked: false, publicAccessDisabled: false,
    timeline: [
      { time: 'Yesterday', by: 'Config', kind: 'detection', text: 'CloudTrail status = Stopped' },
      { time: 'Yesterday', by: 'omar.sec', kind: 'resolution', text: 'Re-enabled trail + added SNS alarm' },
    ],
  },
]

export function getIncidentsSummary() {
  const active = incidents.filter((i) => i.status !== 'Resolved').length
  const byStatus = (s) => incidents.filter((i) => i.status === s).length
  return { active, investigating: byStatus('Investigating'), containment: byStatus('Containment'), resolved: byStatus('Resolved') }
}

// ----------------------------- Compliance -----------------------------
export const frameworks = [
  { id: 'cis', name: 'CIS AWS Foundations', score: 92, status: 'Passed' },
  { id: 'pci', name: 'PCI-DSS', score: 78, status: 'Warning' },
  { id: 'soc2', name: 'SOC 2', score: 88, status: 'Passed' },
  { id: 'hipaa', name: 'HIPAA', score: 64, status: 'Failed' },
]

export const controls = [
  { id: 'C-1.1', framework: 'CIS', title: 'IAM root account MFA', status: 'Failed', finding: 'SEC-195', resource: 'root' },
  { id: 'C-1.2', framework: 'CIS', title: 'No root console login', status: 'Failed', finding: 'SEC-195', resource: 'root' },
  { id: 'C-2.1', framework: 'CIS', title: 'S3 block public access', status: 'Failed', finding: 'SEC-198', resource: 'aegis-backups-prod' },
  { id: 'C-3.4', framework: 'PCI', title: 'Encryption at rest (RDS)', status: 'Passed', finding: '—', resource: null },
  { id: 'C-3.7', framework: 'PCI', title: 'Security group ingress restricted', status: 'Failed', finding: 'SEC-190', resource: 'aegis-sg-app' },
  { id: 'C-4.2', framework: 'HIPAA', title: 'Audit logging enabled', status: 'Failed', finding: 'SEC-179', resource: 'trail/primary' },
  { id: 'C-4.5', framework: 'SOC2', title: 'VPC flow logs', status: 'Warning', finding: 'SEC-168', resource: 'aegis-vpc' },
  { id: 'C-5.1', framework: 'SOC2', title: 'Patch baseline', status: 'Passed', finding: '—', resource: null },
]

export function getComplianceSummary() {
  const passed = controls.filter((c) => c.status === 'Passed').length
  const failed = controls.filter((c) => c.status === 'Failed').length
  return { score: 84, passed, failed, frameworks: frameworks.length }
}

// ------------------------------ Reports -------------------------------
export const reportTypes = [
  { id: 'exec', name: 'Executive Summary', desc: 'Posture overview for leadership', icon: 'FileText' },
  { id: 'compliance', name: 'Compliance Report', desc: 'Control status per framework', icon: 'ClipboardCheck' },
  { id: 'incident', name: 'Incident Report', desc: 'Active + resolved incidents', icon: 'AlertCircle' },
  { id: 'vuln', name: 'Vulnerability Report', desc: 'Inspector / CVE findings', icon: 'Bug' },
]

export const reportHistory = [
  { id: 'R-77', name: 'Executive Summary — Aug', type: 'Executive', generated: 'Aug 25, 09:00', format: 'PDF', size: '1.2 MB', status: 'Ready' },
  { id: 'R-76', name: 'CIS Controls — Aug', type: 'Compliance', generated: 'Aug 24, 14:30', format: 'CSV', size: '84 KB', status: 'Ready' },
  { id: 'R-75', name: 'Incidents — Week 34', type: 'Incident', generated: 'Aug 22, 18:10', format: 'PDF', size: '640 KB', status: 'Ready' },
  { id: 'R-74', name: 'Vuln Scan — eu-west-1', type: 'Vulnerability', generated: 'Aug 20, 07:45', format: 'JSON', size: '210 KB', status: 'Expired' },
]

// ------------------------------ Settings ------------------------------
export const settingsDefaults = {
  environment: 'Production',
  region: 'eu-west-1',
  refreshInterval: '30s',
  monitoring: { autoRefresh: true, metricsPolling: true, anomalyDetection: true },
  security: { guardDuty: true, cloudTrail: true, config: true, securityHub: true, waf: true },
  notifications: { email: true, webhook: false, emailAddress: 'secops@cloudsec.com', webhookUrl: '' },
  api: { baseUrl: 'http://127.0.0.1:8000', version: 'Aegis API v1', cacheTtl: '60s' },
}

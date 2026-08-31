// =====================================================================
// infrastructureData.js
// ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ظˆظ‡ظ…ظٹط© (mock) ظ„طµظپط­ط© ط§ظ„ط¨ظ†ظٹط© ط§ظ„طھط­طھظٹط© (Infrastructure).
//
// ظ…ظ‡ظ…: ط§ظ„ط¨ظ†ظٹط© ط¯ظٹ ظ…طµظ…ظ…ط© ط¨ط­ظٹط« طھط´ط¨ظ‡ ط§ط³طھط¬ط§ط¨ط© ط§ظ„ظ€ backend ط§ظ„ظ…ط³طھظ‚ط¨ظ„ظٹط©:
//   GET /api/infrastructure
// ظƒظ„ ظ…ظˆط±ط¯ ظپظٹظ‡ stable ID + ظ…ط±ط§ط¬ط¹ ط¹ظ„ط§ظ‚ط§طھ (vpcId, subnetId, az, securityGroupIds, ...)
// ظˆط§ظ„ظ€ topology ظ…ظˆظ„ظˆط¯ط© ظ…ظ† ط§ظ„ط¨ظٹط§ظ†ط§طھ ط¯ظٹ (nodes + links) ظ…ط´ ظ…ط±ط³ظˆظ…ط© ظٹط¯ظˆظٹط§ظ‹.
// ظ„ظ…ط§ طھظˆطµظ„ ط¨ط§ظ„ظ€ API ط§ظ„ط­ظ‚ظٹظ‚ظٹطŒ ط¨ط³ ط§ط³طھط¨ط¯ظ„ ظ‡ط°ظ‡ ط§ظ„ظ‚ظٹظ… ط¨ظ†ط¯ط§ط، ط§ظ„ظ€ fetch ط¯ط§ط®ظ„
// src/services/api.js ط¯ظˆظ† ط¥ط¹ط§ط¯ط© طھطµظ…ظٹظ… ط§ظ„طµظپط­ط©.
// =====================================================================

// ---- VPCs ---------------------------------------------------------
export const vpcs = [
  {
    id: 'vpc-0a1b2c3d',
    name: 'aegis-vpc',
    cidr: '10.0.0.0/16',
    region: 'eu-west-1',
    internetGatewayId: 'igw-0e4f5a6b',
    natGatewayIds: ['nat-0c8d9e1f'],
    routeTableIds: ['rtb-public-1', 'rtb-private-2'],
    securityGroupIds: ['sg-web-1', 'sg-app-2', 'sg-db-3'],
    subnetIds: ['subnet-pub-1a', 'subnet-priv-1b', 'subnet-pub-2a', 'subnet-priv-2b'],
    state: 'Available',
    env: 'production',
  },
  {
    id: 'vpc-0f2e3d4c',
    name: 'aegis-vpc-staging',
    cidr: '10.10.0.0/16',
    region: 'eu-west-2',
    internetGatewayId: 'igw-0b2c3d4e',
    natGatewayIds: [],
    routeTableIds: ['rtb-public-2'],
    securityGroupIds: ['sg-staging-1'],
    subnetIds: [],
    state: 'Available',
    env: 'staging',
  },
]

// ---- Internet Gateways -------------------------------------------
export const internetGateways = [
  { id: 'igw-0a9f5a6b', name: 'aegis-igw', vpcId: 'vpc-0a1b2c3d', state: 'attached' },
  { id: 'igw-0b2c3d4e', name: 'staging-igw', vpcId: 'vpc-0f2e3d4c', state: 'attached' },
]

// ---- NAT Gateways -------------------------------------------------
export const natGateways = [
  {
    id: 'nat-0a8d8e1f',
    name: 'aegis-nat-a',
    vpcId: 'vpc-0a1b2c3d',
    publicIp: '52.31.0.10',
    state: 'available',
    subnetId: 'subnet-pub-1a',
  },
]

// ---- Route Tables -------------------------------------------------
export const routeTables = [
  { id: 'rtb-public-1', name: 'aegis-rt-public', vpcId: 'vpc-0a1b2c3d', env: 'production', entries: 4 },
  { id: 'rtb-private-2', name: 'aegis-rt-private', vpcId: 'vpc-0a1b2c3d', env: 'production', entries: 3 },
  { id: 'rtb-public-2', name: 'staging-rt-public', vpcId: 'vpc-0f2e3d4c', env: 'staging', entries: 2 },
]

// ---- Security Groups ------------------------------------------------------
export const securityGroups = [
  { id: 'sg-web-1', name: 'aegis-sg-web', vpcId: 'vpc-0a1b2c3d', description: 'Web tier', openSshToWorld: true, state: 'warning' },
  { id: 'sg-app-2', name: 'aegis-sg-app', vpcId: 'vpc-0a1b2c3d', description: 'App tier', openSshToWorld: false, state: 'safe' },
  { id: 'sg-db-3', name: 'aegis-sg-db', vpcId: 'vpc-0a1b2c3d', description: 'Database', openSshToWorld: false, state: 'safe' },
  { id: 'sg-staging-1', name: 'staging-sg', vpcId: 'vpc-0f2e3d4c', description: 'Staging default', openSshToWorld: true, state: 'warning' },
]

// ---- Subnets -----------------------------------------------------------------
export const subnets = [
  { id: 'subnet-pub-1a', name: 'aegis-public-1a', cidr: '10.0.1.0/24', vpcId: 'vpc-0a1b2c3d', az: 'eu-west-1a', isPublic: true, routeTableId: 'rtb-public-1', env: 'production' },
  { id: 'subnet-pub-2a', name: 'aegis-public-2a', cidr: '10.0.2.0/24', vpcId: 'vpc-0a1b2c3d', az: 'eu-west-1b', isPublic: true, routeTableId: 'rtb-public-1', env: 'production' },
  { id: 'subnet-priv-1b', name: 'aegis-private-1b', cidr: '10.0.10.0/24', vpcId: 'vpc-0a1b2c3d', az: 'eu-west-1a', isPublic: false, routeTableId: 'rtb-private-2', env: 'production' },
  { id: 'subnet-priv-2b', name: 'aegis-private-2b', cidr: '10.0.11.0/24', vpcId: 'vpc-0a1b2c3d', az: 'eu-west-1b', isPublic: false, routeTableId: 'rtb-private-2', env: 'production' },
]
// ---- EC2 Instances ------------------------------------------------------------
export const instances = [
  { id: 'i-0f8a13b1', name: 'aegis-web-01', instanceType: 't3.micro', state: 'Running', privateIp: '10.0.1.12', publicIp: '3.125.45.67', az: 'eu-west-1a', subnetId: 'subnet-pub-1a', vpcId: 'vpc-0a1b2c3d', securityGroupIds: ['sg-web-1'], securityStatus: 'warning', env: 'production', platform: 'linux' },
  { id: 'i-0f9c5a7d2', name: 'aegis-web-02', instanceType: 't3.micro', state: 'Running', privateIp: '10.0.2.14', publicIp: '3.126.78.90', az: 'eu-west-1b', subnetId: 'subnet-pub-2a', vpcId: 'vpc-0a1b2c3d', securityGroupIds: ['sg-web-1'], securityStatus: 'warning', env: 'production', platform: 'linux' },
  { id: 'i-0b7a2d4c3', name: 'aegis-app-01', instanceType: 't3.small', state: 'Running', privateIp: '10.0.11.5', publicIp: '-', az: 'eu-west-1b', subnetId: 'subnet-priv-2b', vpcId: 'vpc-0a1b2c3d', securityGroupIds: ['sg-app-2'], securityStatus: 'safe', env: 'production', platform: 'linux' },
]

// ---- Load Balancers + Target Groups --------------------------------------------
export const loadBalancers = [
  { id: 'alb-0e1d2c3f', name: 'aegis-alb', type: 'application', state: 'active', vpcId: 'vpc-0a1b2c3d', az: 'eu-west-1a ; eu-west-1b', subnetIds: ['subnet-pub-1a', 'subnet-pub-2a'], dnsName: 'aegis-alb.eu-west-1.elb.amazonaws.com', targetGroupIds: ['tg-web-1'] },
]

export const targetGroups = [
  { id: 'tg-web-1', name: 'aegis-tg-web', port: 80, protocol: 'HTTP', targetInstanceIds: ['i-0f8a13b1', 'i-0f9c5a7d2'], healthyCount: 2 },
]

// ---- RDS Databases ----------------------------------------------------------------
export const databases = [
  { id: 'db-0d4c2a6d', identifier: 'aegis-db', engine: 'postgres', engineVersion: '15.4', state: 'available', az: 'eu-west-1a', vpcId: 'vpc-0a1b2c3d', subnetGroupName: 'aegis-db-subnet-group', securityGroupIds: ['sg-db-3'], publiclyAccessible: false, multiAZ: true, storageEncrypted: true, securityStatus: 'safe', env: 'production' },
]

// ---- S3 Buckets -----------------------------------------------------------------
export const s3Buckets = [
  { id: 'aegis-logs', name: 'aegis-logs-prod', region: 'eu-west-1', publicAccess: false, encryption: true, versioning: true },
  { id: 'aegis-backups', name: 'aegis-backups-prod', region: 'eu-west-1', publicAccess: false, encryption: true, versioning: false },
]

// ---- Elastic IPs ----------------------------------------------------------------
export const elasticIps = [
  { id: 'eipalloc-11aa22bb', publicIp: '3.125.45.67', instanceId: 'i-0f8a13b1', vpcId: 'vpc-0a1b2c3d', associationId: 'eipassoc-0aab' },
]

// ---- Network Interfaces ----------------------------------------------------------
export const networkInterfaces = [
  { id: 'eni-0aa11bb22', instanceId: 'i-0f8a13b1', subnetId: 'subnet-pub-1a', vpcId: 'vpc-0a1b2c3d', privateIp: '10.0.1.12', publicIp: '3.125.45.67', mac: '02:1a:2b:3c:4d:5e' },
]

// ---- Document root: shape like /api/infrastructure response ----------------------
export const infrastructure = {
  vpcs, subnets, instances, loadBalancers, targetGroups, databases, securityGroups,
  internetGateways, natGateways, routeTables, s3Buckets, elasticIps, networkInterfaces,
}

// ---- Summary (ط§ظ„ظ€ 6 ظƒط±ظˆطھ ط§ظ„ط¹ظ„ظˆظٹط©) â€” ظ…ط­ط³ظˆط¨ط© ظ…ظ† ط§ظ„ط¨ظٹط§ظ†ط§طھ ظ…ط´ hardcoded --------------
export function getInfrastructureSummary() {
  const running = instances.filter((i) => i.state === 'Running').length
  const stopped = instances.filter((i) => i.state !== 'Running').length
  return {
    vpcCount: vpcs.length,
    subnetCount: subnets.length,
    ec2Count: instances.length,
    ec2Running: running,
    ec2Stopped: stopped,
    loadBalancerCount: loadBalancers.length,
    databaseCount: databases.length,
    securityGroupCount: securityGroups.length,
  }
}

// ---- Network Summary ط®ط§طµ ط¨ط§ظ„ظ€ VPC ط§ظ„ط±ط¦ظٹط³ظٹ ------------------------------------------
export function getNetworkSummary(vpcId = 'vpc-0a1b2c3d') {
  const vp = vpcs.find((v) => v.id === vpcId) || vpcs[0]
  return {
    vpc: vp,
    publicSubnets: subnets.filter((s) => s.vpcId === vp.id && s.isPublic),
    privateSubnets: subnets.filter((s) => s.vpcId === vp.id && !s.isPublic),
    internetGateways: internetGateways.filter((g) => g.vpcId === vp.id),
    natGateways: natGateways.filter((g) => g.vpcId === vp.id),
    routeTables: routeTables.filter((r) => r.vpcId === vp.id),
    securityGroups: securityGroups.filter((g) => g.vpcId === vp.id),
  }
}

// ---- Security Findings (ط¨طھطھط¹ظ„ظ‚ ط¨ط§ظ„ط¨ظ†ظٹط© ط§ظ„طھط­طھظٹط©) --------------------------------------
export const infrastructureFindings = [
  { id: 'f-1001', severity: 'Critical', resourceType: 'Security Group', affectedResource: 'aegis-sg-web', title: 'SG allows 0.0.0.0/0 on SSH (22)', description: 'aegis-sg-web allows unrestricted inbound SSH from the entire internet.', status: 'Active', nodeId: 'r-node-sg-web' },
  { id: 'f-1002', severity: 'High', resourceType: 'EC2 Instance', affectedResource: 'aegis-web-01', title: 'Instance is publicly exposed', description: 'The instance has a public IP and sits in a public subnet with direct internet routing.', status: 'Active', nodeId: 'r-node-web-1' },
  { id: 'f-1003', severity: 'High', resourceType: 'RDS Database', affectedResource: 'aegis-db', title: 'RDS publicly accessible', description: 'The database endpoint could be reachable from outside the VPC if exposed.', status: 'Active', nodeId: 'r-node-db' },
  { id: 'f-1004', severity: 'Medium', resourceType: 'Subnet', affectedResource: 'aegis-public-1a', title: 'Public subnet contains sensitive resource', description: 'A resource with sensitive data is attached inside a public subnet.', status: 'Active', nodeId: 'r-node-subnet-pub-1' },
  { id: 'f-1005', severity: 'Medium', resourceType: 'Security Group', affectedResource: 'aegis-sg-app', title: 'Open administrative port (RDP/3389)', description: 'The app security group exposes an administrative port to a broad CIDR range.', status: 'Active', nodeId: 'r-node-sg-app' },
  { id: 'f-1006', severity: 'Low', resourceType: 'VPC', affectedResource: 'aegis-vpc', title: 'VPC Flow Logs are not enabled', description: 'Network traffic is not logged; enable flow logs for this VPC.', status: 'Open', nodeId: 'r-node-vpc' },
  { id: 'f-1007', severity: 'Low', resourceType: 'S3 Bucket', affectedResource: 'aegis-backups-prod', title: 'Missing encryption on backup objects', description: 'Objects in the backup bucket are not encrypted at rest.', status: 'Open', nodeId: 'r-node-vpc' },
]

// ----------------------------------------------------------------------------
// TOPOLOGY â€” nodes + links (ظ…ظˆظ„ط¯ط© ظ…ظ† ط¹ظ„ط§ظ‚ط§طھ ط§ظ„ظ…ظˆط±ط¯ظٹظ†)
// coords ظپظٹ ظˆظپط± 1280أ—1100. ظƒظ„ node ظ„ظٹظ‡ط§ resourceId ظ„ط±ط¨ط·ظ‡ط§ ط¨ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ظˆط±ط¯ظٹظ† ظپظˆظ‚طŒ
// ظپط§ظ„ط§ط®طھظٹط§ط± ط¬ظˆظ‡ topology / details / inventory ط¨ظٹط¹ظ…ظ„ ظ†ظپط³ ط§ظ„ظ‡ط¯ظپ.
// ----------------------------------------------------------------------------
export const topologyNodes = [
  { id: 'r-node-internet', label: 'Internet', kind: 'internet', resourceId: null, x: 520, y: 20, w: 240, h: 80, status: 'healthy' },
  { id: 'r-node-igw', label: 'aegis-igw', type: 'Internet Gateway', kind: 'igw', resourceId: 'igw-0a9f5a6b', x: 520, y: 150, w: 240, h: 80, status: 'healthy' },
  { id: 'r-node-nat', label: 'aegis-nat-a', type: 'NAT Gateway', kind: 'nat', resourceId: 'nat-0a8d8e1f', x: 520, y: 270, w: 240, h: 80, status: 'healthy' },

  { id: 'r-node-vpc', label: 'aegis-vpc', type: 'VPC', kind: 'vpc', resourceId: 'vpc-0a1b2c3d', x: 120, y: 380, w: 1040, h: 560, status: 'healthy' },

  { id: 'r-node-rt-public', label: 'aegis-rt-public', type: 'Route Table', kind: 'route', resourceId: 'rtb-public-1', x: 150, y: 400, w: 200, h: 80, status: 'healthy' },
  { id: 'r-node-rt-private', label: 'aegis-rt-private', type: 'Route Table', kind: 'route', resourceId: 'rtb-private-2', x: 380, y: 400, w: 200, h: 80, status: 'healthy' },
  { id: 'r-node-sg-web', label: 'aegis-sg-web', type: 'Security Group', kind: 'sg', resourceId: 'sg-web-1', x: 620, y: 400, w: 200, h: 80, status: 'warning' },
  { id: 'r-node-sg-app', label: 'aegis-sg-app', type: 'Security Group', kind: 'sg', resourceId: 'sg-app-2', x: 850, y: 400, w: 200, h: 80, status: 'safe' },

  { id: 'r-node-alb', label: 'aegis-alb', type: 'Application Load Balancer', kind: 'alb', resourceId: 'alb-0e1d2c3f', x: 520, y: 470, w: 240, h: 80, status: 'healthy' },

  { id: 'r-node-az-1', label: 'eu-west-1a', type: 'Availability Zone', kind: 'az', resourceId: null, x: 150, y: 600, w: 440, h: 300, status: 'healthy' },
  { id: 'r-node-az2', label: 'eu-west-1b', type: 'Availability Zone', kind: 'az', resourceId: null, x: 630, y: 600, w: 470, h: 300, status: 'healthy' },

  { id: 'r-node-subnet-pub-1', label: 'aegis-public-1a', type: 'Public Subnet', kind: 'subnet', resourceId: 'subnet-pub-1a', x: 170, y: 630, w: 200, h: 160, status: 'healthy' },
  { id: 'r-node-subnet-priv-1', label: 'aegis-private-1b', type: 'Private Subnet', kind: 'subnet', resourceId: 'subnet-priv-1b', x: 400, y: 630, w: 190, h: 160, status: 'healthy' },
  { id: 'r-node-subnet-pub-2', label: 'aegis-public-2a', type: 'Public Subnet', kind: 'subnet', resourceId: 'subnet-pub-2a', x: 660, y: 630, w: 190, h: 160, status: 'healthy' },
  { id: 'r-node-subnet-priv-2', label: 'aegis-private-2b', type: 'Private Subnet', kind: 'subnet', resourceId: 'subnet-priv-2b', x: 880, y: 630, w: 190, h: 160, status: 'warning' },

  { id: 'r-node-web-1', label: 'aegis-web-01', type: 'EC2 Instance', kind: 'instance', resourceId: 'i-0f8a13b1', x: 185, y: 690, w: 172, h: 86, status: 'healthy', security: 'warning' },
  { id: 'r-node-web-2', label: 'aegis-web-02', type: 'EC2 Instance', kind: 'instance', resourceId: 'i-0f9c5a7d2', x: 670, y: 690, w: 172, h: 86, status: 'healthy', security: 'warning' },
  { id: 'r-node-app-1', label: 'aegis-app-01', type: 'EC2 Instance', kind: 'instance', resourceId: 'i-0b7a2d4c3', x: 890, y: 690, w: 172, h: 86, status: 'healthy' },
  { id: 'r-node-db', label: 'aegis-db', type: 'RDS Database', kind: 'database', resourceId: 'db-0d4c2a6d', x: 415, y: 690, w: 172, h: 86, status: 'healthy' },
]

export const topologyLinks = [
  { id: 'l-01', from: 'r-node-internet', to: 'r-node-igw', kind: 'network' },
  { id: 'l-02', from: 'r-node-igw', to: 'r-node-nat', kind: 'network' },
  { id: 'l-03', from: 'r-node-igw', to: 'r-node-vpc', kind: 'attach' },
  { id: 'l-04', from: 'r-node-nat', to: 'r-node-vpc', kind: 'attach' },
  { id: 'l-05', from: 'r-node-igw', to: 'r-node-alb', kind: 'network' },
  { id: 'l-06', from: 'r-node-internet', to: 'r-node-subnet-pub-1', kind: 'route' },
  { id: 'l-07', from: 'r-node-alb', to: 'r-node-web-1', kind: 'network' },
  { id: 'l-08', from: 'r-node-alb', to: 'r-node-web-2', kind: 'network' },
  { id: 'l-09', from: 'r-node-subnet-pub-1', to: 'r-node-web-1', kind: 'attach' },
  { id: 'l-10', from: 'r-node-subnet-pub-2', to: 'r-node-web-2', kind: 'attach' },
  { id: 'l-11', from: 'r-node-nat', to: 'r-node-subnet-priv-2', kind: 'route' },
  { id: 'l-12', from: 'r-node-subnet-priv-1', to: 'r-node-db', kind: 'attach' },
  { id: 'l-13', from: 'r-node-subnet-priv-2', to: 'r-node-app-1', kind: 'attach' },
  { id: 'l-14', from: 'r-node-app-1', to: 'r-node-db', kind: 'data' },
  { id: 'l-15', from: 'r-node-web-1', to: 'r-node-db', kind: 'data' },
  { id: 'l-16', from: 'r-node-rt-public', to: 'r-node-vpc', kind: 'route' },
  { id: 'l-17', from: 'r-node-rt-private', to: 'r-node-vpc', kind: 'route' },
  { id: 'l-18', from: 'r-node-sg-web', to: 'r-node-web-1', kind: 'attach' },
  { id: 'l-19', from: 'r-node-sg-web', to: 'r-node-web-2', kind: 'attach' },
  { id: 'l-20', from: 'r-node-vpc', to: 'r-node-az-1', kind: 'contain' },
  { id: 'l-21', from: 'r-node-vpc', to: 'r-node-az2', kind: 'contain' },
]


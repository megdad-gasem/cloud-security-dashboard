import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import DashboardHeader from './components/DashboardHeader'
import StatsRow from './components/StatsRow'
import CpuChart from './components/CpuChart'
import SecurityEvents from './components/SecurityEvents'
import ComplianceOverview from './components/ComplianceOverview'
import InstancesTable from './components/InstancesTable'
import QuickActions from './components/QuickActions'
import ServiceStatusRow from './components/ServiceStatusRow'
import InfrastructurePage from './components/infrastructure/InfrastructurePage'
import MonitoringPage from './components/monitoring/MonitoringPage'
import SecurityPage from './components/pages/SecurityPage'
import IamPage from './components/pages/IamPage'
import LogsPage from './components/pages/LogsPage'
import IncidentsPage from './components/pages/IncidentsPage'
import CompliancePage from './components/pages/CompliancePage'
import ReportsPage from './components/pages/ReportsPage'
import SettingsPage from './components/pages/SettingsPage'
import { ToastHost, ConfirmHost } from './components/pages/ui'
import { setupNavigation } from './store/securityCenter'

/**
 * App
 * التخطيط الرئيسي للداشبورد بالكامل.
 *
 * ملاحظة مهمة عن الـ "بدون scroll":
 * - العنصر الجذري h-screen + overflow-hidden، فمفيش scroll على مستوى الصفحة.
 * - المحتوى مقسّم لصفوف بـ flex، الصفوف الثابتة (العنوان، كروت الإحصائيات،
 *   خدمات الأمان) بارتفاع طبيعي (shrink-0)، والصف الأوسط والجدول ياخدوا
 *   المساحة المتبقية (flex-1 min-h-0) عشان يتوزعوا حسب ارتفاع الشاشة.
 * - على شاشات أصغر من ~1280×800 ممكن المحتوى يتضغط أكتر من التصميم الأصلي؛
 *   الأفضل استخدامه على شاشة لابتوب/ديسكتوب عادية (1440×900 فما فوق).
 */
export default function App() {
  const [activeItem, setActiveItem] = useState('dashboard')

  // اربط التنقّل بين الصفحات بطبقة الإجراءات (عشان View Resource / View Finding
  // ينقلوا المستخدم للصفحة الصح بعد تنفيذ الإجراء)
  React.useEffect(() => { setupNavigation(setActiveItem) }, [])

  return (
    <div className="h-screen w-screen flex bg-base-bg overflow-hidden text-slate-200">
      {/* الشريط الجانبي */}
      <Sidebar activeItem={activeItem} onSelect={setActiveItem} />

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <TopBar />

       <main className="flex-1 min-h-0 flex flex-col gap-4 p-5">

  {activeItem === 'dashboard' && (
    <>
      <DashboardHeader />

      <StatsRow />

      {/* الصف الأوسط: چارت الـ CPU + الأحداث الأمنية + نظرة الالتزام */}
      <div className="flex-[1.4] min-h-0 grid grid-cols-[2fr_1.15fr_1.15fr] gap-4">
        <CpuChart />
        <SecurityEvents />
        <ComplianceOverview />
      </div>

      {/* صف الجدول + الإجراءات السريعة */}
      <div className="flex-[1.3] min-h-0 grid grid-cols-[2fr_1fr] gap-4">
        <InstancesTable />
        <QuickActions />
      </div>

      {/* صف خدمات الأمان السفلي */}
      <ServiceStatusRow />
    </>
  )}

  {activeItem === 'infrastructure' && (
    <InfrastructurePage />
  )}

  {activeItem === 'monitoring' && (
    <MonitoringPage />
  )}

  {activeItem === 'security' && (
    <SecurityPage />
  )}

  {activeItem === 'iam' && (
    <IamPage />
  )}

  {activeItem === 'logs' && (
    <LogsPage />
  )}

  {activeItem === 'incidents' && (
    <IncidentsPage />
  )}

  {activeItem === 'compliance' && (
    <CompliancePage />
  )}

  {activeItem === 'reports' && (
    <ReportsPage />
  )}

  {activeItem === 'settings' && (
    <SettingsPage />
  )}

</main>
      </div>
      <ToastHost />
      <ConfirmHost />
    </div>
  )
}

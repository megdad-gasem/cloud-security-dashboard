# Cloud Security Center — Dashboard

نسخة React + Vite + Tailwind CSS من تصميم Figma "Cloud Security Center".

## التشغيل

```bash
npm install
npm run dev
```

بعد كده افتح المتصفح على الرابط اللي هيظهر (عادةً `http://localhost:5173`).

## الهيكلة

```
src/
  App.jsx                     # التخطيط الرئيسي (بدون scroll، h-screen)
  index.css                   # Tailwind + خط Inter + منع الـ scroll
  data/
    mockData.js                # كل البيانات الوهمية في مكان واحد
  components/
    Sidebar.jsx                 # الشريط الجانبي (لوقو + تنقل + يوزر)
    TopBar.jsx                  # الشريط العلوي (بحث + إشعارات + يوزر)
    DashboardHeader.jsx         # عنوان "Dashboard" + فلتر الوقت
    StatCard.jsx                 # كارت إحصائية عام (قابل لإعادة الاستخدام)
    RadialPercent.jsx            # دائرة نسبة مئوية (Compliance Score)
    StatsRow.jsx                 # الصف اللي فيه الـ 4 كروت العلوية
    CpuChart.jsx                 # چارت استخدام الـ CPU
    SecurityEvents.jsx           # قائمة آخر الأحداث الأمنية
    ComplianceOverview.jsx       # دونات + أهم القواعد الفاشلة
    InstancesTable.jsx           # جدول EC2 Instances
    QuickActions.jsx             # شبكة الإجراءات السريعة
    ServiceStatusRow.jsx         # صف كروت خدمات الأمان السفلي
```

## تعديل البيانات

كل البيانات (اللي دلوقتي وهمية/mock) موجودة في `src/data/mockData.js`.
لما توصّل الداشبورد بأي API حقيقي (مثلاً من مشروع Aegis)، غيّر القيم دي
لنداءات `fetch`/`axios` جوه `useEffect` في كل كومبوننت أو في `App.jsx`.

## ملاحظة عن "بدون Scroll"

التصميم مبني بحيث ياخد كامل ارتفاع الشاشة (`h-screen`) بدون أي scroll،
باستخدام `flex` + `min-h-0` عشان الصفوف تتوزع حسب المساحة المتاحة. أفضل
النتائج على شاشة 1440×900 فما فوق (لابتوب/ديسكتوب عادي). على شاشات أصغر
جداً هيتضاغط المحتوى شوية عشان يفضل من غير scroll.

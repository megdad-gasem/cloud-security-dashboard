/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ألوان الخلفية الأساسية — Dark Navy هو الافتراضي (المصدر).
        // Light Mode بيطبَّق عبر CSS variables في index.css (html.light) بدون
        // أي تغيير في الكلاسات أو المكونات. القيم الافتراضية هنا = القيم
        // الداكنة الأصلية بالحرف، فالـ Dark Mode يبقى كما هو تمامًا.
        base: {
          bg: 'rgb(var(--aegis-bg) / <alpha-value>)',
          panel: 'rgb(var(--aegis-panel) / <alpha-value>)',
          panel2: 'rgb(var(--aegis-panel2) / <alpha-value>)',
          border: 'rgb(var(--aegis-border) / <alpha-value>)',
        },
        // ألوان الحالة (Status Colors)
        status: {
          green: '#22C55E',
          red: '#EF4444',
          amber: '#F59E0B',
          purple: '#A855F7',
          blue: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

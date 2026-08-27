/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ألوان الخلفية الأساسية (Dark Navy) مطابقة لتصميم الفيقما
        base: {
          bg: '#09121F',      // خلفية الصفحة الرئيسية
          panel: '#0E1A2B',   // خلفية الكروت/البانلات
          panel2: '#101D30',  // خلفية عناصر داخلية (صفوف الجدول، الأزرار الثانوية)
          border: '#1B2839',  // لون الحدود العام
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

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       'var(--bg)',
        surface:  'var(--surface)',
        surface2: 'var(--surface2)',
        surface3: 'var(--surface3)',
        border:   'var(--border)',
        border2:  'var(--border2)',
        accent:   'var(--accent)',
        danger:   'var(--danger)',
        success:  'var(--success)',
        warning:  'var(--warning)',
      },
    },
  },
  plugins: [],
};

// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    'react-datepicker',
    'react-datepicker-popper',
    'react-datepicker__header',
    'react-datepicker__day-names',
    'react-datepicker__day-name',
    'react-datepicker__current-month',
    'react-datepicker__navigation-icon',
    'react-datepicker__month-container',
    'react-datepicker__day',
    'react-datepicker__day:hover',
    'react-datepicker__triangle',
    'react-datepicker__day--today',
    // add all other react-datepicker classes you style
  ],
  theme: { 
    extend: {
      colors: {
        background: '#d9c7ad',
        shadow: '#c1af94',
        base: '#17341a',
        select: '#225247',
        prompt: '#3c503fb0',
        accent: '#531818',
        highlight: '#415773',
        accentHighlight: '#732b33',
      },
    },
  },
  plugins: [],
  variants: {
    extend: {
      backgroundColor: ['autofill'],
      textColor: ['autofill'],
    },
  },
};

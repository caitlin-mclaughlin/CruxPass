// tailwind.config.cjs
import plugin from 'tailwindcss/plugin'
import scrollbar from 'tailwind-scrollbar'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  	'./src/global.css'
  ],
  darkMode: ["class"],
  safelist: [
    'react-datepicker',
    'react-datepicker-popper',
    'react-datepicker__header',
    'react-datepicker-time__header',
    'react-datepicker__day-names',
    'react-datepicker__day-name',
    'react-datepicker__current-month',
    'react-datepicker__navigation-icon',
    'react-datepicker__month-container',
    'react-datepicker__time-container',
    'react-datepicker__time-box',
    'react-datepicker__time-list',
    'react-datepicker__day',
    'react-datepicker__day:hover',
    'react-datepicker__triangle',
    'react-datepicker__day--today',
    '.react-datepicker__time-list::-webkit-scrollbar',
    '.react-datepicker__time-list::-webkit-scrollbar-thumb',
    '.react-datepicker__time-list::-webkit-scrollbar-track',
    '.react-datepicker__year-dropdown::-webkit-scrollbar',
    '.react-datepicker__year-dropdown::-webkit-scrollbar-thumb',
    '.react-datepicker__year-dropdown::-webkit-scrollbar-track',
    '.react-datepicker__year-option',
    '.react-datepicker__year-option:hover',
    '.react-datepicker__year-dropdown',
    '.react-datepicker__year-dropdown-container',
    '.react-datepicker__year-read-view',
    '.react-datepicker__year-read-view--down-arrow',
  ],
  theme: {
    extend: {
      colors: {
        background: '#d9c7ad',
        shadow: '#c1af94',
        base: '#17341a',
        select: '#225247',
        prompt: '#3c503fb5',
        accent: '#531818',
        highlight: '#3E566F',
        accentHighlight: '#732b33',
	  }
    }
  },
  plugins: [
    scrollbar,
    require('tailwindcss-animate')
  ],
  variants: {
    extend: {
      backgroundColor: ['autofill'],
      textColor: ['autofill'],
    },
  },
}

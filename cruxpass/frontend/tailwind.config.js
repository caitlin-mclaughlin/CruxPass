// tailwind.config.js
export default {
    darkMode: ["class"],
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
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
  variants: {
    extend: {
      backgroundColor: ['autofill'],
      textColor: ['autofill'],
    },
  },
};

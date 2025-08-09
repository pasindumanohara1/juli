
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'poppins': ['Poppins', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// OnlinePanthi custom colors
				ocean: {
					DEFAULT: '#1A4B8C',
					50: '#E8F2FF',
					100: '#D1E5FF',
					200: '#A3CBFF',
					300: '#75B1FF',
					400: '#4797FF',
					500: '#1A4B8C',
					600: '#153C70',
					700: '#102D54',
					800: '#0B1E38',
					900: '#060F1C'
				},
				teal: {
					DEFAULT: '#00C9B1',
					50: '#E6FFFE',
					100: '#CCFFFC',
					200: '#99FFF9',
					300: '#66FFF6',
					400: '#33FFF3',
					500: '#00C9B1',
					600: '#00A08E',
					700: '#00776A',
					800: '#004E47',
					900: '#002523'
				},
				glass: {
					DEFAULT: 'rgba(255, 255, 255, 0.1)',
					light: 'rgba(255, 255, 255, 0.2)',
					dark: 'rgba(26, 75, 140, 0.1)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'liquid-wave': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'ripple': {
					'0%': { transform: 'scale(0)', opacity: '1' },
					'100%': { transform: 'scale(1)', opacity: '0' }
				},
				'bubble-rise': {
					'0%': { 
						transform: 'translateY(100vh) scale(0)',
						opacity: '0'
					},
					'10%': {
						opacity: '1'
					},
					'90%': {
						opacity: '1'
					},
					'100%': { 
						transform: 'translateY(-100px) scale(1)',
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'liquid-wave': 'liquid-wave 8s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'ripple': 'ripple 0.6s linear',
				'bubble-rise': 'bubble-rise 10s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

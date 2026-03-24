import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
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
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
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
      },
      container: {
      center: true,
      padding: {
        DEFAULT: '0.75rem',  // 12px (was 16px) - reduced 50%
        sm: '1rem',          // 16px (was 32px) - reduced 50%
        lg: '2rem',          // 32px (was 64px) - reduced 50%
        xl: '2.5rem',        // 40px (was 80px) - reduced 50%
        '2xl': '3rem',       // 48px (was 96px) - reduced 50%
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      },
      fontSize: {
        // Global font scale reduced by 40% for compact layout
        'xs': '0.6rem',      // 9.6px (was 12px)
        'sm': '0.75rem',     // 12px (was 14px) ✓ WCAG minimum
        'base': '0.875rem',  // 14px (was 16px)
        'lg': '1rem',        // 16px (was 18px)
        'xl': '1.125rem',    // 18px (was 20px)
        '2xl': '1.25rem',    // 20px (was 24px)
        '3xl': '1.625rem',   // 26px (was 30px)
        '4xl': '1.875rem',   // 30px (was 36px)
        '5xl': '2.5rem',     // 40px (was 48px)
        '6xl': '3.25rem',    // 52px (was 60px)
        '7xl': '3.75rem',    // 60px (was 72px)
        '8xl': '6rem',       // 96px (unchanged)
        '9xl': '8rem',       // 128px (unchanged)
      },
      spacing: {
        // Global spacing scale reduced by 35% for compact layout
        '0': '0',
        '0.5': '0.08rem',   // 1.3px (was 2px)
        '1': '0.16rem',     // 2.6px (was 4px)
        '1.5': '0.24rem',   // 3.8px (was 6px)
        '2': '0.325rem',    // 5.2px (was 8px)
        '2.5': '0.41rem',   // 6.5px (was 10px)
        '3': '0.49rem',     // 7.8px (was 12px)
        '3.5': '0.57rem',   // 9.1px (was 14px)
        '4': '0.65rem',     // 10.4px (was 16px)
        '5': '0.81rem',     // 13px (was 20px)
        '6': '0.98rem',     // 15.6px (was 24px)
        '7': '1.14rem',     // 18.2px (was 28px)
        '8': '1.3rem',      // 20.8px (was 32px)
        '9': '1.46rem',     // 23.4px (was 36px)
        '10': '1.63rem',    // 26px (was 40px)
        '11': '1.79rem',    // 28.6px (was 44px)
        '12': '1.95rem',    // 31.2px (was 48px)
        '14': '2.28rem',    // 36.4px (was 56px)
        '16': '2.6rem',     // 41.6px (was 64px)
        '20': '3.25rem',    // 52px (was 80px)
        '24': '3.9rem',     // 62.4px (was 96px)
        '28': '4.55rem',    // 72.8px (was 112px)
        '32': '5.2rem',     // 83.2px (was 128px)
        '36': '5.85rem',    // 93.6px (was 144px)
        '40': '6.5rem',     // 104px (was 160px)
        '44': '7.15rem',    // 114.4px (was 176px)
        '48': '7.8rem',     // 124.8px (was 192px)
        '52': '8.45rem',    // 135.2px (was 208px)
        '56': '9.1rem',     // 145.6px (was 224px)
        '60': '9.75rem',    // 156px (was 240px)
        '64': '10.4rem',    // 166.4px (was 256px)
        '72': '11.7rem',    // 187.2px (was 288px)
        '80': '13rem',      // 208px (was 320px)
        '96': '15.6rem',    // 249.6px (was 384px)
      },
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config;

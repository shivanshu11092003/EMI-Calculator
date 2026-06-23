import {AntdRegistry} from '@ant-design/nextjs-registry';
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Shared Workspace Loan EMI Calculator',
  description:
    'A collaborative real-time Loan EMI Calculator featuring cross-tab synchronization, sensitivity analysis, prepayment planners, and interactive amortization charts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script id="theme-initializer">
          {`
            (function() {
              try {
                var params = new URLSearchParams(window.location.search);
                var id = params.get('id');
                var theme = 'light';
                if (id) {
                  var item = localStorage.getItem('emi_config_' + id);
                  if (item) {
                    var parsed = JSON.parse(item);
                    if (parsed && parsed.theme) {
                      theme = parsed.theme;
                    }
                  }
                } else {
                  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    theme = 'dark';
                  }
                }
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `}
        </script>
      </head>
      <body className="flex min-h-full flex-col">
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}

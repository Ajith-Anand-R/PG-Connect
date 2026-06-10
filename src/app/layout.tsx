import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppContentWrapper } from "@/components/layout/AppContentWrapper";
import { IncomingGateRequestModal } from "@/components/IncomingGateRequestModal";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: "PG Connect - PG Portal",
  description: "Premium Paying Guest & Tenant Management Portal App",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PG Connect",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50/70 text-slate-900 flex flex-col pb-20 md:pb-0 pt-16">
        <AppProvider>
          <AppContentWrapper>
            {children}
          </AppContentWrapper>
          <IncomingGateRequestModal />
        </AppProvider>
        
        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registered:', reg.scope);
                  }).catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}

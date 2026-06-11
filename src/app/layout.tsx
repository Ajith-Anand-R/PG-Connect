import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppContentWrapper } from "@/components/layout/AppContentWrapper";
import dynamic from "next/dynamic";

// Lazy-load gate request modal — only needed when a gate request comes in
const IncomingGateRequestModal = dynamic(
  () => import("@/components/IncomingGateRequestModal").then(mod => ({ default: mod.IncomingGateRequestModal }))
);

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",  // Prevent FOIT (Flash of Invisible Text)
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
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: "/icon-192.png",
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
                  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(function(reg) {
                    console.log('SW registered:', reg.scope);
                    // Check for updates every hour
                    setInterval(function() { reg.update(); }, 60 * 60 * 1000);
                  }).catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                  // Auto-reload when new SW takes over
                  navigator.serviceWorker.addEventListener('controllerchange', function() {
                    window.location.reload();
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

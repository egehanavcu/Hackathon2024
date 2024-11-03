import "../globals.css";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const metadata = {
  title: "TakımYıldız",
  description: "BTK Hackathon projesi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-dm">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex flex-col w-full px-8 py-4">
            <SidebarTrigger className="mb-2" />

            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}

import { Outlet } from "react-router";
import AppSidebar from "./App/AppSidebar";
import { SidebarProvider } from "@justchat/ui/components/sidebar";
import AppHeader from "./App/AppHeader";

export default function AppLayout({
  threads,
}: {
  threads: { _id: string; title?: string }[];
}) {
  return (
    <SidebarProvider>
      <AppSidebar threads={threads} />
      <main className="grid grid-rows-[auto_1fr] w-full h-screen">
        <AppHeader />

        <Outlet />
      </main>
    </SidebarProvider>
  );
}

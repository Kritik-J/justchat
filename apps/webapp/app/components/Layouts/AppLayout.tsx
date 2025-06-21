import { Outlet } from "react-router";
import AppSidebar from "./App/AppSidebar";
import { SidebarProvider } from "@justchat/ui/components/sidebar";
import AppHeader from "./App/AppHeader";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="grid grid-rows-[auto_1fr] w-full h-screen">
        <AppHeader />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

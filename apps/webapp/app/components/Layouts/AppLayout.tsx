import { Outlet, useLoaderData } from "react-router";
import AppSidebar from "./App/AppSidebar";
import { SidebarProvider } from "@justchat/ui/components/sidebar";
import AppHeader from "./App/AppHeader";

export default function AppLayout() {
  const { user } = useLoaderData() as { user?: any };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="grid grid-rows-[auto_1fr] w-full h-screen">
        <AppHeader />
        <div className="relative">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}

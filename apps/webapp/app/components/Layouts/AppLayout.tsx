import { Outlet, useLoaderData } from "react-router";
import AppSidebar from "./App/AppSidebar";
import { SidebarProvider } from "@justchat/ui/components/sidebar";
import AppHeader from "./App/AppHeader";

export default function AppLayout() {
  const { user } = useLoaderData<typeof import("~/routes/_app").loader>();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-screen flex flex-col">
        <AppHeader user={user} />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}

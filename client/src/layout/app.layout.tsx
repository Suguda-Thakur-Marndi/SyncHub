import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/auth-provider";
import Asidebar from "@/components/asidebar/asidebar";
import Header from "@/components/header";
import CreateWorkspaceDialog from "@/components/workspace/create-workspace-dialog";
import CreateProjectDialog from "@/components/workspace/project/create-project-dialog";

const AppLayoutContent = ({
  sidebarWidth,
  isResizing,
  handleResizeStart,
}: {
  sidebarWidth: number;
  isResizing: boolean;
  handleResizeStart: (event: React.MouseEvent<HTMLDivElement>) => void;
}) => {
  const { open, isMobile } = useSidebar();
  const currentLeft = open ? sidebarWidth : 72;

  return (
    <div className={`relative flex min-h-svh w-full ${isResizing ? "select-none cursor-col-resize" : ""}`}>
      <Asidebar />
      {open && !isMobile && (
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={handleResizeStart}
          className={`hidden md:block absolute top-0 bottom-0 z-50 w-1.5 cursor-col-resize transition-colors ${
            isResizing ? "bg-indigo-500/70 dark:bg-indigo-400/70" : "hover:bg-indigo-500/40 dark:hover:bg-indigo-400/40"
          }`}
          style={{ left: `${currentLeft}px` }}
        />
      )}
      <SidebarInset className="relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <div className="flex-1 w-full p-6">
            <Outlet />
          </div>
          <CreateWorkspaceDialog />
          <CreateProjectDialog />
        </div>
      </SidebarInset>
    </div>
  );
};

const AppLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(260);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.min(
        Math.max(startWidthRef.current + (event.clientX - startXRef.current), 220),
        420
      );
      setSidebarWidth(nextWidth);
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    startXRef.current = event.clientX;
    startWidthRef.current = sidebarWidth;
    setIsResizing(true);
  };

  return (
    <AuthProvider>
      <SidebarProvider
        className={isResizing ? "resizing" : ""}
        style={{
          "--sidebar-width": `${sidebarWidth}px`,
          "--sidebar-width-icon": "72px",
        } as React.CSSProperties}
      >
        <AppLayoutContent
          sidebarWidth={sidebarWidth}
          isResizing={isResizing}
          handleResizeStart={handleResizeStart}
        />
      </SidebarProvider>
    </AuthProvider>
  );
};

export default AppLayout;


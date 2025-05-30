
"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  ShieldAlert,
  FileText,
  Settings,
  LogOut,
  Menu,
  HeartHandshake,
  Smile,
  Info,
} from "lucide-react";
import { CodePiLogo } from "@/components/icons/code-pi-logo";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";


interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  tooltip?: string;
  exactMatch?: boolean;
}

const NavItem = ({ href, icon: Icon, label, tooltip, exactMatch = false }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = exactMatch ? pathname === href : pathname.startsWith(href) && (href !== "/" || pathname === "/");
  const { open, isMobile, setOpenMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenuItem>
      <Link href={href} passHref legacyBehavior>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          variant="default"
          tooltip={open ? undefined : tooltip || label}
          className={cn(
            "transition-all duration-200 ease-in-out",
            isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground shadow-md"
          )}
          onClick={handleClick}
        >
          <a>
            <Icon className="shrink-0 h-6 w-6" />
            <span className={cn("truncate", !open && "sr-only")}>{label}</span>
          </a>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
};

const navItems: NavItemProps[] = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard", tooltip: "Global Dashboard", exactMatch: true },
  { href: "/city-tracker", icon: MapPin, label: "City Tracker", tooltip: "Track Your City" },
  { href: "/future-simulator", icon: TrendingUp, label: "Future Simulator", tooltip: "Simulate Future" },
  { href: "/risk-estimator", icon: ShieldAlert, label: "Risk Estimator", tooltip: "Estimate Climate Risk" },
  { href: "/report-generator", icon: FileText, label: "Report Generator", tooltip: "Generate Report" },
];

function AppShellUI({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const pathname = usePathname();
  const { open, isMobile, setOpenMobile, openMobile: sidebarOpenMobile } = useSidebar();
  const [pageTitle, setPageTitle] = React.useState<string | null>(null);
  const [isTitleLoading, setIsTitleLoading] = React.useState(true);


  React.useEffect(() => {
    setIsTitleLoading(true);
    const currentNavItem = navItems.find(item => item.exactMatch ? pathname === item.href : pathname.startsWith(item.href) && (item.href !== "/" || pathname === "/"));
    const title = currentNavItem ? currentNavItem.label : "ClimateScope";

    const timer = setTimeout(() => {
      setPageTitle(title);
      setIsTitleLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleLogout = () => {
    toast({
        title: "Logged Out (Simulated)",
        description: "You have been successfully logged out.",
        variant: "default"
    });
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border shadow-lg">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2.5 text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors group">
            <CodePiLogo className="h-7 w-auto shrink-0 transform group-hover:scale-105 transition-transform duration-300" />
            <div className={cn("flex flex-col", !open && "sr-only group-data-[collapsible=icon]:hidden")}>
              <span className="text-lg font-semibold truncate leading-tight">ClimateScope</span>
              <span className="text-xs text-sidebar-foreground/70 truncate leading-tight">Hackathon Project</span>
            </div>
          </Link>
        </SidebarHeader>
        <Separator className="bg-sidebar-border/70" />
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </SidebarMenu>
        </SidebarContent>
        <Separator className="bg-sidebar-border/70" />
        <SidebarFooter className="p-4 space-y-3">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
             <Avatar className="h-10 w-10 border-2 border-sidebar-primary/50">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User Gajanan Patange" data-ai-hint="user avatar" />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">GP</AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col truncate", !open && "sr-only group-data-[collapsible=icon]:hidden")}>
              <span className="text-sm font-medium text-sidebar-foreground">Gajanan Patange</span>
              <span className="text-xs text-sidebar-foreground/70">test123@gmail.com</span>
            </div>
          </div>

           <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:aspect-square active:scale-[0.97] active:brightness-90"
                    title="Logout"
                >
                    <LogOut className="h-6 w-6 shrink-0" />
                    <span className={cn("ml-2", !open && "sr-only group-data-[collapsible=icon]:sr-only")}>Logout</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to log out of ClimateScope?
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">Logout</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-background/95 backdrop-blur-lg border-b shadow-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setOpenMobile(!sidebarOpenMobile)}>
               <Menu />
            </SidebarTrigger>
            {isTitleLoading ? (
              <Skeleton className="h-7 w-48 rounded-md bg-muted/80" />
            ) : (
              <h1 className="text-xl font-semibold text-foreground animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                {pageTitle}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggleButton />

            {/* About Button & Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="About ClimateScope" className="rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors active:scale-[0.97] active:brightness-90">
                  <Info className="h-6 w-6 transition-transform duration-300 hover:rotate-12" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-2xl">
                    <CodePiLogo className="h-7 w-auto" /> ClimateScope
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-base pt-2">
                    An interactive platform to explore, simulate, and understand climate change impacts. This project was developed as part of a hackathon.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-4 text-sm">
                  <div className="flex justify-center mb-4">
                    <Image
                      src="https://placehold.co/400x500.png"
                      alt="Infographic: How STEM is used in the ClimateScope Application"
                      width={400}
                      height={500}
                      className="rounded-md object-contain shadow-md"
                      data-ai-hint="STEM infographic"
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-primary">STEM in ClimateScope</h3>
                  <p>ClimateScope integrates various STEM (Science, Technology, Engineering, and Mathematics) principles:</p>
                  <ul className="list-disc list-inside space-y-1 pl-4 text-muted-foreground">
                    <li>
                      <strong>Science:</strong> Utilizes climatological concepts, weather data (from OpenWeatherMap), and simulated environmental data (CO₂, sea levels, AQI). It aims to educate users on climate phenomena like the greenhouse effect and ecological impacts.
                    </li>
                    <li>
                      <strong>Technology:</strong> Built with Next.js, React, and Tailwind CSS. It leverages Genkit for AI-driven features like the Risk Estimator, demonstrating practical AI application. The platform uses APIs for real-time data and employs modern web development practices.
                    </li>
                    <li>
                      <strong>Engineering:</strong> Involves designing a user-friendly interface (UI/UX), structuring a scalable application, and ensuring data is presented effectively through visualizations (charts, maps, progress bars).
                    </li>
                    <li>
                      <strong>Mathematics:</strong> Incorporates quantitative data presentation (indices, scores, percentages), relies on statistical concepts for trends and projections (even if simulated in this version), and uses algorithms for simulations and risk estimation.
                    </li>
                  </ul>
                   <p>The project aims to make complex climate data more accessible and understandable through interactive tools and visualizations, fostering STEM literacy.</p>
                </div>
                <AlertDialogFooter>
                  <AlertDialogAction>Got it!</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Settings Button & Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open settings" className="rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors active:scale-[0.97] active:brightness-90">
                  <Settings className="h-6 w-6 transition-transform duration-300 hover:rotate-45" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Application Settings</AlertDialogTitle>
                  <AlertDialogDescription>
                    This is a placeholder for application settings. Customize your experience here in a future update.
                    Current options might include theme selection, notification preferences, or data source configurations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-3">
                  <p className="text-sm text-muted-foreground">Example Setting: Dark Mode (Toggle available in header)</p>
                  <p className="text-sm text-muted-foreground">Example Setting: Email Notifications (Coming Soon)</p>
                  <p className="text-sm text-muted-foreground">Example Setting: Data Refresh Interval (Coming Soon)</p>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                  <AlertDialogAction onClick={() => toast({title: "Settings Saved (Simulated)", description: "Your preferences would be saved here."})}>Save Changes</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-background">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const isMobileInitial = useIsMobile();

  return (
    <TooltipProvider>
      <SidebarProvider
        defaultOpen={!isMobileInitial}
        open={isMobileInitial ? false : undefined}
      >
        <AppShellUI>{children}</AppShellUI>
      </SidebarProvider>
    </TooltipProvider>
  );
}


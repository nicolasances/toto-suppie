"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AuthWrapper } from "./AuthWrapper";
import SideMenu, { SideMenuItem } from "@/app/ui/SideMenu";
import { CarModeContextProvider } from "@/context/CarModeContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();

  const menuItems = useMemo<SideMenuItem[]>(
    () => [
      {
        id: "home",
        label: "Home",
        iconPath: "/images/home.svg",
        closeOnClick: true,
        onClick: () => router.push("/"),
      },
    ],
    [router],
  );

  return (
    <CarModeContextProvider>
      <SideMenu items={menuItems} />
      <AuthWrapper>{children}</AuthWrapper>
    </CarModeContextProvider>
  );
}

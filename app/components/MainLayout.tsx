"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AuthWrapper } from "./AuthWrapper";
import SideMenu, { SideMenuItem, SideMenuToggleableItem } from "@/app/ui/SideMenu";
import { CarModeContextProvider, useCarMode } from "@/context/CarModeContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <CarModeContextProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </CarModeContextProvider>
  );
}

interface MainLayoutContentProps {
  children: React.ReactNode;
}

function MainLayoutContent({ children }: MainLayoutContentProps) {
  const router = useRouter();
  const { carMode, toggleCarMode } = useCarMode();

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

  const toggleableItems = useMemo<SideMenuToggleableItem[]>(
    () => [
      {
        id: "car-mode",
        label: "Car Mode",
        iconPath: "/images/car.svg",
        iconAlt: "Car mode",
        isActive: carMode,
        onClick: toggleCarMode,
      },
    ],
    [carMode, toggleCarMode],
  );

  return (
    <>
      <SideMenu items={menuItems} toggleableItems={toggleableItems} />
      <AuthWrapper>{children}</AuthWrapper>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { TitleBar } from "@/app/components/generic/TitleBar";
import { useHeader } from "@/context/HeaderContext";

export default function AppHeader() {
  const router = useRouter();
  const { config } = useHeader();

  const onBack = () => {
    if (config.backButton?.onClick) {
      config.backButton.onClick();
      return;
    }

    router.back();
  };

  return (
    <TitleBar
      title={config.title ?? "Toto Suppie"}
      back={config.backButton?.enabled}
      onBack={onBack}
      rightButton={config.rightButton}
    />
  );
}

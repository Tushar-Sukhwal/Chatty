"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Check if already hydrated
    const unsubHydrate = useUserStore.persist.onHydrate(() => {
      setHydrated(false);
    });

    const unsubFinishHydration = useUserStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    setHydrated(useUserStore.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};

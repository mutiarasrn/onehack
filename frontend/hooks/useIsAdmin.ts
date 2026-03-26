"use client";

import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { suiClient } from "@/lib/onechain";
import ADDRESSES from "@/lib/contract-addresses.json";

/**
 * Returns true if the connected wallet owns the AdminCap object.
 * Used to gate the Create League UI.
 */
export function useIsAdmin() {
  const account = useCurrentAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account?.address) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const adminCapId: string = (ADDRESSES as any).adminCapId || "";
    if (!adminCapId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    async function check() {
      try {
        const obj = await suiClient.getObject({ id: adminCapId, options: { showOwner: true } });
        const owner = (obj.data?.owner as any)?.AddressOwner;
        setIsAdmin(owner === account!.address);
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    check();
  }, [account?.address]);

  return { isAdmin, loading };
}

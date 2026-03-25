"use client";

import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TxState = "idle" | "signing" | "pending" | "confirmed" | "error";

interface TxButtonProps extends Omit<ButtonProps, "onClick"> {
  /**
   * Build and return a Transaction object.
   * If not deployed yet (no PACKAGE_ID) this can return null — button falls
   * back to a mock confirmation so the UI demo still works.
   */
  buildTx: () => Transaction | null;
  label: string;
  loadingLabel?: string;
  onSuccess?: (digest: string) => void;
}

export function TxButton({
  buildTx,
  label,
  loadingLabel = "Processing...",
  onSuccess,
  className,
  ...props
}: TxButtonProps) {
  const [state, setState] = useState<TxState>("idle");
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleClick = async () => {
    const tx = buildTx();

    // ── Mock mode: contracts not deployed yet ────────────────────────────────
    if (!tx) {
      setState("signing");
      toast.info("Demo mode — simulating transaction...");
      await new Promise((r) => setTimeout(r, 1200));
      setState("confirmed");
      toast.success("Transaction confirmed! (demo)");
      onSuccess?.("demo-digest");
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    // ── Real wallet signing ──────────────────────────────────────────────────
    setState("signing");
    toast.info("Sign the transaction in your wallet...");

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          setState("confirmed");
          toast.success("Transaction confirmed!", {
            action: {
              label: "Explorer",
              onClick: () =>
                window.open(
                  `https://explorer-testnet.onelabs.cc/txblock/${result.digest}`,
                  "_blank"
                ),
            },
          });
          onSuccess?.(result.digest);
          setTimeout(() => setState("idle"), 3000);
        },
        onError: (err) => {
          setState("error");
          toast.error(err?.message || "Transaction failed");
          setTimeout(() => setState("idle"), 3000);
        },
      }
    );
  };

  const isLoading = state === "signing" || state === "pending";

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      className={cn(
        state === "confirmed" && "bg-green-700 hover:bg-green-700",
        state === "error" && "bg-red-700 hover:bg-red-700",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {state === "signing" ? "Sign in wallet..." : loadingLabel}
        </>
      ) : state === "confirmed" ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Confirmed!
        </>
      ) : state === "error" ? (
        <>
          <XCircle className="mr-2 h-4 w-4" />
          Failed — Retry
        </>
      ) : (
        label
      )}
    </Button>
  );
}

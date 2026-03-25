"use client";

import { useParams, useRouter } from "next/navigation";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Navbar } from "@/components/layout/Navbar";
import { TeamBuilder } from "@/components/team/TeamBuilder";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { buildSubmitTeamTx } from "@/lib/contracts";

// League object IDs would normally come from the URL/API — hardcoded for demo
const LEAGUE_OBJECT_IDS: Record<string, string> = {
  "1": (process.env.NEXT_PUBLIC_DEMO_LEAGUE_ID as string) || "",
};

export default function TeamBuilderPage() {
  const { leagueId } = useParams();
  const router = useRouter();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const handleSubmit = async (tokenIds: number[]) => {
    const leagueObjectId = LEAGUE_OBJECT_IDS[String(leagueId)] || "";
    const tx = buildSubmitTeamTx(leagueObjectId, tokenIds);

    if (!tx) {
      // Demo / not deployed — mock
      await new Promise((r) => setTimeout(r, 1200));
      toast.success("Team submitted! (demo mode)");
      router.push(`/leagues/${leagueId}`);
      return;
    }

    try {
      const result = await signAndExecute({ transaction: tx });
      toast.success("Team submitted on-chain!", {
        action: {
          label: "Explorer",
          onClick: () =>
            window.open(
              `https://explorer-testnet.onelabs.cc/txblock/${result.digest}`,
              "_blank"
            ),
        },
      });
      router.push(`/leagues/${leagueId}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit team");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <Link
          href={`/leagues/${leagueId}`}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to League
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Build Your Team</h1>
          <p className="text-muted-foreground mt-1">
            Select athletes from your collection to fill each roster slot.
            Higher rarity cards earn bigger point multipliers.
          </p>
        </div>

        <TeamBuilder
          leagueId={Number(leagueId)}
          sport="NBA"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

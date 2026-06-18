import { trpc } from "@/lib/trpc";

export function useUserMode() {
  const query = trpc.auth.getMode.useQuery();
  return {
    mode: query.data?.mode ?? "pro",
    isLearning: query.data?.mode === "learning",
    isPro: query.data?.mode !== "learning",
    isLoading: query.isLoading,
  };
}

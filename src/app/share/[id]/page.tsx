import type { Metadata } from "next";
import SharePageClient from "./SharePageClient";

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  await props.params;
  return {
    title: `AI Spend Audit Results — SpendPilot`,
    description: `See the AI spend audit results. Find out how much your team could save on AI tools.`,
    openGraph: {
      title: "AI Spend Audit — See How Much You Could Save",
      description:
        "This team found savings on their AI tool subscriptions. Run your own free audit at SpendPilot.",
      type: "website",
      siteName: "SpendPilot by Credex",
    },
    twitter: {
      card: "summary_large_image",
      title: "AI Spend Audit Results — SpendPilot",
      description:
        "See how much this team could save on AI tools. Run your own free audit.",
    },
  };
}

export default async function SharePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  return <SharePageClient id={params.id} />;
}

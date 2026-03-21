import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getRoastCanonicalPath,
  getRoastResultById,
} from "@/app/(with-nav)/result/[id]/resultData";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const roast = await getRoastResultById(id);

  if (!roast) {
    notFound();
  }

  const imagePath = `/result/${id}/opengraph-image`;
  const resultPath = getRoastCanonicalPath(id);

  return (
    <main className="min-h-screen flex flex-col bg-page">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-10">
        {/* Back Link */}
        <div className="w-full max-w-7xl mb-4">
          <Link
            href={resultPath}
            className="inline-flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors font-jb text-sm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>back_to_result</span>
          </Link>
        </div>

        {/* Image Container */}
        <div className="w-full max-w-7xl">
          <div className="relative w-full aspect-1200/630 border border-border-primary">
            <Image
              src={imagePath}
              alt={`devroast score ${roast.score.toFixed(1)} out of 10`}
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Download Info */}
        <div className="w-full max-w-7xl mt-4">
          <p className="text-text-tertiary font-ibm text-xs text-center">
            // right click and save to download this roast card
          </p>
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const roast = await getRoastResultById(id);

  if (!roast) {
    return {
      title: "Share Roast - devroast",
    };
  }

  return {
    title: `Share ${roast.score.toFixed(1)}/10 Roast - devroast`,
    description: roast.headline,
  };
}

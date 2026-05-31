import { notFound } from "next/navigation";
import { fetchPublishedPage } from "@/lib/site-cms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await fetchPublishedPage(slug);
  if (!page) return { title: "Page not found" };
  return { title: page.title };
}

export default async function CmsPageView({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await fetchPublishedPage(slug);
  if (!page) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-16">
      <h1 className="text-3xl font-semibold mb-8">{page.title}</h1>
      <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
        {page.body}
      </div>
    </main>
  );
}

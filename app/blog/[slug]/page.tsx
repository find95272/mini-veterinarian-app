import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/blogPosts';
import { BookOpen, ArrowLeft, Clock, ChevronRight } from 'lucide-react';

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return { title: '文章不存在 — Mini Veterinarian' };
  return {
    title: `${post.title} — Mini Veterinarian`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 2);
  const fallback = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const recommendations = related.length > 0 ? related : fallback;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-card/80 border-b border-border/60">
        <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="leading-tight text-left">
              <div className="font-bold text-sm text-foreground">宠物护理小百科</div>
              <div className="text-[10px] text-muted-foreground">Mini Vet Blog</div>
            </div>
          </Link>
          <Link
            href="/"
            className="text-xs sm:text-sm text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/5 transition-all"
          >
            返回首页
          </Link>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
          <Link href="/blog" className="hover:text-primary transition-colors">小百科</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate">{post.title}</span>
        </nav>

        <article className="animate-fade-up">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-5xl mx-auto mb-4 shadow-sm">
              {post.emoji}
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {post.category}
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
              {post.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {post.excerpt}
            </p>
          </div>

          <div className="bg-card rounded-3xl border border-border/60 shadow-sm p-6 sm:p-8">
            <div className="prose prose-sm max-w-none">
              {post.content.map((section, i) => (
                <section key={i} className="mb-6 last:mb-0">
                  <h2 className="text-base font-bold text-foreground mb-2 flex items-start gap-2">
                    <span className="text-primary flex-shrink-0 mt-0.5">§</span>
                    {section.heading}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-[1.8] pl-6">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/20">
            <p className="text-xs text-muted-foreground leading-relaxed text-center">
              以上内容整理自网络公开资料，仅供参考。每只宠物情况不同，如有健康问题请咨询专业兽医。
            </p>
          </div>
        </article>

        <section className="mt-10">
          <h3 className="text-sm font-bold text-foreground mb-4">继续阅读</h3>
          <div className="grid grid-cols-1 gap-3">
            {recommendations.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex items-center gap-3 bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground truncate">{p.excerpt}</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-0.5 transition-all rotate-180 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-primary border border-primary/30 px-4 py-2 rounded-full hover:bg-primary/5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            返回小百科列表
          </Link>
        </div>
      </div>
    </main>
  );
}

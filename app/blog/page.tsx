import Link from 'next/link';
import { blogPosts } from '@/lib/blogPosts';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';

export const metadata = {
  title: '宠物护理小百科 — Mini Veterinarian',
  description: '猫狗鼠等小动物的日常护理知识、喂养指南与健康常识',
};

export default function BlogPage() {
  const categories = [...new Set(blogPosts.map((p) => p.category))];

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-card/80 border-b border-border/60">
        <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
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
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            宠物护理小百科
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            从网络整理的猫、狗、鼠等小动物日常护理知识，帮助您更好地照顾毛孩。
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <span
              key={cat}
              className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full"
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {blogPosts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-4 p-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {post.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h2 className="font-bold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-primary mt-2 font-medium">
                    阅读全文
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

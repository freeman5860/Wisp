import Link from 'next/link';
import { APP_NAME, APP_DESCRIPTION, MOODS } from '@/lib/constants';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Floating mood cards (decorative) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {MOODS.slice(0, 6).map((mood, i) => (
            <div
              key={mood.type}
              className="absolute animate-float"
              style={{
                left: `${10 + i * 15}%`,
                top: `${15 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${5 + i * 0.5}s`,
                opacity: 0.15,
              }}
            >
              <div
                className="w-16 h-20 rounded-md"
                style={{ backgroundColor: mood.color }}
              />
            </div>
          ))}
        </div>

        <div className="relative z-10 text-center max-w-lg">
          <h1 className="text-hero font-bold tracking-widest leading-none">
            {APP_NAME}
          </h1>
          <p className="mt-4 text-lg text-text-secondary font-light leading-relaxed">
            {APP_DESCRIPTION}
          </p>
          <p className="mt-2 text-sm text-text-tertiary">
            随手拍 · AI 渲染氛围 · 生成情绪文案 · 标记在地图上
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/create"
              className="inline-flex items-center h-12 px-8 bg-accent text-background font-medium rounded-md shadow-glow hover:bg-accent-hover transition-all duration-200"
            >
              开始记录
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center h-12 px-8 border border-border text-text-secondary font-medium rounded-md hover:bg-background-hover hover:border-border-bright transition-all duration-200"
            >
              探索地图
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-light text-center mb-12 tracking-wide">
            三步，把情绪变成画面
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: '随手拍',
                desc: '什么都可以，哪怕像是"废片"。不用在意构图和光线。',
              },
              {
                step: '02',
                title: 'AI 魔法',
                desc: '选择心情，AI 渲染氛围滤镜，再配上一句戳中你的文案。',
              },
              {
                step: '03',
                title: '留在当地',
                desc: '发布到地图上。你也可以看看别人在同一个地方留下的情绪。',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="text-accent text-2xl font-bold">{item.step}</span>
                <h3 className="text-text-primary font-medium mt-3">{item.title}</h3>
                <p className="text-text-secondary text-sm mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="px-4 py-20 border-t border-border">
        <div className="max-w-xl mx-auto text-center">
          <blockquote className="text-lg text-text-secondary font-light leading-loose italic">
            &ldquo;不教你怎么生活，不逼你精致，<br />
            只在你想记录的那一刻，<br />
            轻轻托住你的情绪，<br />
            再用一点 AI 魔法，<br />
            把它变成值得回味的画面。&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3 mt-8">
            {MOODS.map((m) => (
              <span
                key={m.type}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: m.color }}
                title={m.label}
              />
            ))}
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center mt-8 text-sm text-accent hover:underline"
          >
            探索大家的情绪卡片 &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-6 border-t border-border text-center">
        <p className="text-xs text-text-tertiary">
          {APP_NAME} · 诚实记录每一刻
        </p>
      </footer>
    </div>
  );
}

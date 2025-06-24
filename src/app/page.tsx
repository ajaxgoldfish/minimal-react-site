import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, HeartHandshake } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-grow flex flex-col">
      {/* Section 1: Hero & Intro */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          {/* Hero Call to Action */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              为您甄选，连接全球品质生活
            </h1>
            <p className="max-w-[700px] mx-auto text-gray-500 md:text-xl">
              探索我们的精选产品，体验卓越品质与创新设计。
            </p>
            <Link href="/products">
              <Button size="lg">浏览所有商品</Button>
            </Link>
          </div>

          {/* Company Intro */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">关于我们：专业的团队与生产资质</h2>
              <p className="text-gray-500">
                我们拥有一支经验丰富的专业团队，并配备了国际领先的生产设施。从原材料采购到最终产品交付，每一个环节都遵循最高的行业标准，确保为您提供最值得信赖的产品。我们的生产线已通过多项国际质量体系认证。
              </p>
            </div>
            <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">公司/团队/工厂图片占位</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Customer Feedback */}
      <section className="w-full py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">真实客户反馈评价</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-gray-200 rounded-lg p-2 border flex items-center justify-center">
                <p className="text-sm text-gray-400">客户评价截图 #{i + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 & 4: Our Promise (Quality & After-sales) */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-center flex flex-col items-center">
              <ShieldCheck className="h-12 w-12 mb-4 text-blue-600" />
              <h3 className="text-2xl font-bold mb-2">严格的质量保障</h3>
              <p className="text-gray-500 max-w-md">
                我们承诺所有产品均采用优质材料，并通过多达数十项的质量检测流程。从性能到耐用性，我们追求每一个细节的完美，确保您收到的不仅是商品，更是一份品质的保证。
              </p>
            </div>
            <div className="text-center flex flex-col items-center">
              <HeartHandshake className="h-12 w-12 mb-4 text-rose-500" />
              <h3 className="text-2xl font-bold mb-2">完善的售后介绍</h3>
              <p className="text-gray-500 max-w-md">
                您的满意是我们服务的终极目标。我们提供7x24小时的客户支持、快速响应的退换货政策以及专业的技术指导。无论遇到任何问题，我们的售后团队都将随时为您提供帮助。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
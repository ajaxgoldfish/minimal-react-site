import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail, Phone, MessageCircle } from 'lucide-react';

export default function RefundInfoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">退款申请说明</h1>
          </div>
          <p className="text-lg text-gray-600">
            如需申请退款，请通过以下方式联系我们的客服团队
          </p>
        </div>

        {/* 退款政策 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">退款政策</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>商品在收到后7天内可申请退款</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>商品需保持原包装和完好状态</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>退款将在审核通过后3-5个工作日内处理</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>运费由买家承担（商品质量问题除外）</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 联系方式 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">联系我们申请退款</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 邮箱联系 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-6 w-6 text-blue-500" />
                <h3 className="text-lg font-semibold">邮箱联系</h3>
              </div>
              <p className="text-gray-600 mb-4">
                发送邮件至我们的客服邮箱，我们会在24小时内回复
              </p>
              <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
                support@example.com
              </p>
            </div>

            {/* 电话联系 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold">电话联系</h3>
              </div>
              <p className="text-gray-600 mb-4">
                工作时间：周一至周五 9:00-18:00
              </p>
              <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
                +86 400-123-4567
              </p>
            </div>
          </div>
        </div>

        {/* 申请退款需要提供的信息 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">申请时请提供以下信息</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">1.</span>
                <span>订单号</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">2.</span>
                <span>购买商品名称</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">3.</span>
                <span>退款原因详细说明</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">4.</span>
                <span>您的联系方式（邮箱或电话）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">5.</span>
                <span>商品照片（如有质量问题）</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button size="lg" className="w-full sm:w-auto">
              <MessageCircle className="h-5 w-5 mr-2" />
              前往联系我们页面
            </Button>
          </Link>
          <Link href="/user">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              返回我的订单
            </Button>
          </Link>
        </div>

        {/* 温馨提示 */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 text-center">
            <strong>温馨提示：</strong>
            为了更快处理您的退款申请，建议您通过邮箱联系我们，并详细说明退款原因。
            我们的客服团队会尽快为您处理。
          </p>
        </div>
      </div>
    </div>
  );
}

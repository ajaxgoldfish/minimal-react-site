import { Button } from '@/components/ui/button';
import { Mail, MapPin, Clock, MessageCircle, RefreshCw } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">联系我们</h1>
          <p className="text-lg text-gray-600">
            我们随时为您提供专业的客户服务，包括退款申请、产品咨询等
          </p>
        </div>

        {/* 联系方式 */}
        <div className="mb-8">
          <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-gray-600 mb-6 text-center">
              通过以下方式联系我们，我们会尽快回复您的问题
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* 邮箱联系 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="h-6 w-6 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">邮箱联系</h3>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">客服邮箱</p>
                  <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
                    support@example.com
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">退款专用邮箱</p>
                  <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
                    refund@example.com
                  </p>
                </div>
              </div>

              {/* WhatsApp联系 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-6 w-6 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">WhatsApp</h3>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">客服号码</p>
                  <p className="font-mono text-sm bg-white px-3 py-2 rounded border">
                    +86 138-0000-0000
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    点击号码直接跳转WhatsApp聊天
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 退款申请专区 */}
        <div className="mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="h-6 w-6 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">退款申请</h2>
            </div>
            <p className="text-gray-600 mb-4">
              如需申请退款，请通过以下方式联系我们，并提供完整的订单信息：
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">邮箱申请</h3>
              <p className="text-sm text-gray-600 mb-2">
                发送邮件至：<span className="font-mono bg-white px-2 py-1 rounded">refund@example.com</span>
              </p>
              <p className="text-sm text-gray-600">
                邮件中请包含：订单号、商品名称、退款原因
              </p>
            </div>
          </div>
        </div>

        {/* 其他联系信息 */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* 地址信息 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-6 w-6 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">公司地址</h2>
            </div>
            <p className="text-gray-700">
              中国上海市浦东新区<br />
              张江高科技园区<br />
              科苑路123号，邮编：201203
            </p>
          </div>

          {/* 工作时间 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900">服务时间</h2>
            </div>
            <div className="space-y-2 text-gray-700">
              <p><strong>邮件回复：</strong></p>
              <p>24小时内回复（节假日可能延迟）</p>
            </div>
          </div>
        </div>

        {/* 常见问题提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">联系我们前，您可能想了解</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold mb-2">退款相关</h3>
              <ul className="space-y-1">
                <li>• 退款政策和时间</li>
                <li>• 退货流程说明</li>
                <li>• 运费承担规则</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">订单相关</h3>
              <ul className="space-y-1">
                <li>• 订单状态查询</li>
                <li>• 发货时间咨询</li>
                <li>• 物流信息跟踪</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="text-center">
          <Button size="lg" className="mr-4">
            <MessageCircle className="h-5 w-5 mr-2" />
            立即联系客服
          </Button>
          <Button variant="outline" size="lg">
            查看常见问题
          </Button>
        </div>
      </div>
    </div>
  );
}
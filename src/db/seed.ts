import { db } from './index';
import { product, productVariant } from './schema';

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    description: '最新款iPhone，配备A17 Pro芯片，钛金属机身，三摄系统',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop',
    category: '电子产品',
    variants: [
      { name: '128GB 钛原色', price: 999.99, isDefault: true },
      { name: '256GB 钛原色', price: 1099.99 },
      { name: '512GB 钛原色', price: 1299.99 },
      { name: '128GB 钛蓝色', price: 999.99 },
      { name: '256GB 钛蓝色', price: 1099.99 },
    ],
  },
  {
    name: 'MacBook Air M3',
    description: '全新M3芯片，超长续航，轻薄便携',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
    category: '电子产品',
    variants: [
      { name: '8GB+256GB 午夜色', price: 1299.99, isDefault: true },
      { name: '8GB+512GB 午夜色', price: 1499.99 },
      { name: '16GB+512GB 午夜色', price: 1699.99 },
      { name: '8GB+256GB 星光色', price: 1299.99 },
    ],
  },
  {
    name: 'AirPods Pro',
    description: '主动降噪，空间音频，无线充电',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&h=500&fit=crop',
    category: '电子产品',
    variants: [
      { name: '第二代', price: 249.99, isDefault: true },
    ],
  },
  {
    name: '运动鞋',
    description: '舒适透气，适合日常运动和休闲',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    category: '服装',
    variants: [
      { name: '39码 黑色', price: 89.99, isDefault: true },
      { name: '40码 黑色', price: 89.99 },
      { name: '41码 黑色', price: 89.99 },
      { name: '42码 黑色', price: 89.99 },
      { name: '39码 白色', price: 89.99 },
      { name: '40码 白色', price: 89.99 },
      { name: '41码 白色', price: 89.99 },
      { name: '42码 白色', price: 89.99 },
    ],
  },
  {
    name: '咖啡豆',
    description: '精选阿拉比卡咖啡豆，浓郁香醇',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop',
    category: '食品',
    variants: [
      { name: '250g 中度烘焙', price: 24.99, isDefault: true },
      { name: '500g 中度烘焙', price: 45.99 },
      { name: '250g 深度烘焙', price: 26.99 },
      { name: '500g 深度烘焙', price: 49.99 },
    ],
  },
  {
    name: '护肤套装',
    description: '温和保湿，适合各种肌肤类型',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop',
    category: '美妆',
    variants: [
      { name: '基础套装', price: 79.99, isDefault: true },
      { name: '豪华套装', price: 129.99 },
    ],
  },
  {
    name: '瑜伽垫',
    description: '防滑环保，厚度适中，适合各种瑜伽练习',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop',
    category: '运动',
    variants: [
      { name: '6mm 紫色', price: 39.99, isDefault: true },
      { name: '8mm 紫色', price: 49.99 },
      { name: '6mm 蓝色', price: 39.99 },
      { name: '8mm 蓝色', price: 49.99 },
    ],
  },
];

async function seed() {
  console.log('开始播种数据...');

  try {
    // 检查是否已有数据
    const existingProducts = await db.query.product.findMany();

    if (existingProducts.length === 0) {
      console.log('插入示例商品和规格...');

      for (const productData of sampleProducts) {
        // 插入商品基本信息
        const { variants, ...productInfo } = productData;
        const [insertedProduct] = await db.insert(product).values(productInfo).returning();

        // 插入商品规格
        if (variants && variants.length > 0) {
          const variantData = variants.map(variant => ({
            productId: insertedProduct.id,
            name: variant.name,
            price: variant.price,
            isDefault: variant.isDefault ? 1 : 0,
          }));

          await db.insert(productVariant).values(variantData);
        }
      }

      console.log(`成功插入 ${sampleProducts.length} 个商品及其规格`);
    } else {
      console.log(`数据库中已有 ${existingProducts.length} 个商品，跳过播种`);
    }

    // 显示最终统计
    const finalProducts = await db.query.product.findMany();
    console.log(`数据库中共有 ${finalProducts.length} 个商品`);

  } catch (error) {
    console.error('播种数据时出错:', error);
  }
}

// 如果直接运行此文件，则执行播种
if (require.main === module) {
  seed().then(() => {
    console.log('播种完成');
    process.exit(0);
  }).catch((error) => {
    console.error('播种失败:', error);
    process.exit(1);
  });
}

export { seed }; 
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Product } from "./entity/Product";

const productsData = [
    {
      id: 1,
      name: "高性能笔记本电脑",
      description: "搭载最新一代处理器，适用于专业工作和游戏。",
      image: "/file.svg",
      category: "一类",
      price: 999.99,
    },
    {
      id: 2,
      name: "无线降噪耳机",
      description: "沉浸式音效体验，长达30小时电池续航。",
      image: "/globe.svg",
      category: "一类",
      price: 249.99,
    },
    {
      id: 3,
      name: "智能运动手表",
      description: "全天候健康监测，多种运动模式可选。",
      image: "/window.svg",
      category: "二类",
      price: 199.99,
    },
    {
      id: 4,
      name: "4K超高清显示器",
      description: "色彩精准，细节丰富，为创作者和设计师打造。",
      image: "/file.svg",
      category: "三类",
      price: 499.99,
    },
    {
      id: 5,
      name: "人体工学办公椅",
      description: "舒适支撑，缓解久坐疲劳，提升工作效率。",
      image: "/globe.svg",
      category: "三类",
      price: 399.99,
    },
    {
      id: 6,
      name: "便携咖啡机",
      description: "随时随地享用香醇咖啡，简单易用。",
      image: "/window.svg",
      category: "四类",
      price: 89.99,
    },
    {
      id: 7,
      name: "多功能登山包",
      description: "轻便耐磨，大容量设计，满足户外探险需求。",
      image: "/file.svg",
      category: "五类",
      price: 129.99,
    },
  ];
  
async function seed() {
  await AppDataSource.initialize();
  console.log("Database connection initialized.");

  const productRepository = AppDataSource.getRepository(Product);

  // 清空表以避免重复插入
  await productRepository.clear();
  console.log("Product table cleared.");

  await productRepository.save(productsData);
  console.log("Products have been seeded.");

  await AppDataSource.destroy();
  console.log("Database connection closed.");
}

seed().catch((error) => console.log("Seeding error: ", error)); 
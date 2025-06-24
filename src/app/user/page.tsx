import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function UserPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const welcomeMessage = user.firstName ? `欢迎, ${user.firstName}` : `欢迎, ${user.username}`;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">{welcomeMessage}</h1>
      <p className="mt-4 text-gray-600">这里是您的订单中心。您可以在这里查看您的历史订单和物流信息。</p>
      {/* 订单列表将在这里展示 */}
    </div>
  );
} 
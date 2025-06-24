import Link from "next/link";
import { Package2 } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { MobileMenu } from "./MobileMenu";
import { AuthButtons } from "./AuthButtons";

export default function Navbar() {
  const menuItems = [
    { name: "首页", href: "/" },
    { name: "商品展示", href: "/products" },
    { name: "联系我们", href: "/contact" },
    { name: "订单中心", href: "/user" },
  ];

  return (
    <header className="sticky top-0 flex h-16 items-center px-4 md:px-6 border-b bg-background">
      <nav className="flex items-center gap-6 w-full">
        {/* Mobile Menu Trigger */}
        <MobileMenu />

        {/* PC Logo and Navigation */}
        <Link
          href="#"
          className="items-center gap-2 font-semibold hidden md:flex"
        >
          <Package2 className="h-6 w-6" />
          <span>外贸网站</span>
        </Link>
        <NavigationMenu className="hidden md:block ml-auto">
          <NavigationMenuList>
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.name}>
                <NavigationMenuLink asChild>
                  <Link href={item.href} className={navigationMenuTriggerStyle()}>
                    {item.name}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        
        {/* Mobile Title - Centered */}
        <div className="flex-1 text-center md:hidden">
            <Link href="#" className="inline-flex items-center text-lg font-semibold">
                <Package2 className="h-6 w-6" />
            </Link>
        </div>

        {/* Clerk Auth Buttons */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <AuthButtons />
        </div>
      </nav>
    </header>
  );
} 
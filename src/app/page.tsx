import { HomeModules } from "@/components/home/home-modules";
import { HomeView } from "@/components/home/home-view";

export default function HomePage() {
  return <HomeView modules={<HomeModules />} />;
}

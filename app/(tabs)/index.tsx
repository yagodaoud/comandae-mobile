import Home from "@/components/Home";
import ScreenWrapper from "@/components/ScreenWrapper";
import { StatusBar } from "react-native";
export default function Index() {
  return (
    <ScreenWrapper>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Home />
    </ScreenWrapper>

  );
}



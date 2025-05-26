import Dishes from "@/components/Dishes";
import ScreenWrapper from "@/components/ScreenWrapper";
import { StatusBar } from "react-native";

export default function DishesTabScreen() {
    return (
        <ScreenWrapper>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <Dishes />
        </ScreenWrapper>
    );
}
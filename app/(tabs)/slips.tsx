import Slips from "@/components/Slips";
import ScreenWrapper from "@/components/ScreenWrapper";
import { StatusBar } from "react-native";
export default function Index() {
    return (
        <ScreenWrapper>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <Slips />
        </ScreenWrapper>

    );
}



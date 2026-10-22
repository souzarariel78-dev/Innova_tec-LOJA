import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/components/marketplace";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = { index: "home", orders: "receipt-outline", sell: "add-circle", favorites: "heart-outline", profile: "person-outline" };

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.blue, tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginBottom: 2 }, tabBarStyle: { height: 62 + bottom, paddingTop: 7, paddingBottom: bottom, backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1 }, tabBarIcon: ({ color, focused }) => <Ionicons name={route.name === "sell" && focused ? "add-circle" : icons[route.name] ?? "ellipse-outline"} size={route.name === "sell" ? 29 : 21} color={color} /> })}>
    <Tabs.Screen name="index" options={{ title: "Início" }} />
    <Tabs.Screen name="orders" options={{ title: "Pedidos" }} />
    <Tabs.Screen name="sell" options={{ title: "Vender" }} />
    <Tabs.Screen name="favorites" options={{ title: "Favoritos" }} />
    <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
  </Tabs>;
}

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Banner, ProductCard, SearchHeader, SectionTitle, colors } from "@/components/marketplace";
import { ScreenContainer } from "@/components/screen-container";
import { useSyncedProducts } from "@/hooks/use-synced-products";

export default function HomeScreen() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  useFocusEffect(useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []));
  const products = useSyncedProducts(refreshKey);
  return <ScreenContainer edges={["top"]} style={{ backgroundColor: colors.canvas }}><SearchHeader onSubmit={() => router.push("/search")} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <Banner />
    <View style={styles.quickRow}><View><Text style={styles.eyebrow}>SELEÇÃO MERCADOSPOT</Text><Text style={styles.heroTitle}>Achados para deixar seu dia melhor.</Text></View><Ionicons name="sparkles" size={27} color={colors.yellow} /></View>
    <SectionTitle title="Mais vendidos" action="Ver tudo" onPress={() => router.push("/search")} /><View style={styles.grid}>{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</View>
    <SectionTitle title="Para você" action="Ver tudo" /><View style={styles.grid}>{products.slice(4).map((product) => <ProductCard key={product.id} product={product} />)}</View>
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 18, paddingBottom: 32 }, quickRow: { marginTop: 28, marginBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, eyebrow: { color: colors.blue, fontSize: 10, fontWeight: "800", letterSpacing: 1 }, heroTitle: { color: colors.ink, fontSize: 24, fontWeight: "900", letterSpacing: -0.8, maxWidth: 300, marginTop: 5 }, grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" } });

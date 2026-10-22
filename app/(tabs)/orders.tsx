import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BrandMark, colors, SectionTitle } from "@/components/marketplace";
import { orders } from "@/constants/mock-data";

export default function OrdersScreen() {
  return (
    <ScreenContainer edges={["top"]} style={{ backgroundColor: colors.canvas }}>
      <View style={styles.header}>
        <BrandMark />
        <Ionicons name="help-circle-outline" size={22} color={colors.ink} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Minhas compras</Text>
        <Text style={styles.sub}>Acompanhe seus pedidos em um só lugar.</Text>

        <View style={styles.filters}>
          {["Todos", "Em andamento", "Entregues"].map((filter, index) => (
            <View key={filter} style={[styles.filter, index === 0 && styles.filterActive]}>
              <Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{filter}</Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Pedidos recentes" action="" />
        {orders.map((order) => (
          <View key={order.id} style={styles.order}>
            <Image source={order.image} style={styles.orderImage} />
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text numberOfLines={2} style={styles.orderTitle}>{order.title}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: order.color }]} />
                <Text style={[styles.status, { color: order.color }]}>{order.status}</Text>
                <Text style={styles.date}>{order.date}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
        ))}

        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={28} color={colors.blue} />
          <Text style={styles.emptyTitle}>Ainda esperando o próximo achado?</Text>
          <Text style={styles.emptyText}>Explore ofertas e encontre algo que combina com você.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.card },
  content: { padding: 18 },
  title: { fontSize: 27, fontWeight: "900", color: colors.ink, letterSpacing: -0.8 },
  sub: { color: colors.muted, fontSize: 13, marginTop: 5 },
  filters: { flexDirection: "row", gap: 8, marginVertical: 22 },
  filter: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  filterText: { fontSize: 11, fontWeight: "700", color: colors.muted },
  filterTextActive: { color: colors.ink },
  order: { backgroundColor: colors.card, borderRadius: 17, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  orderImage: { width: 64, height: 64, borderRadius: 12 },
  orderInfo: { flex: 1, paddingHorizontal: 12 },
  orderId: { fontSize: 10, color: colors.muted, fontWeight: "700" },
  orderTitle: { fontSize: 13, color: colors.ink, fontWeight: "700", marginTop: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 9 },
  statusDot: { width: 7, height: 7, borderRadius: 7 },
  status: { fontSize: 11, fontWeight: "800" },
  date: { fontSize: 10, color: colors.muted },
  empty: { marginTop: 20, backgroundColor: "#0D3448", padding: 22, borderRadius: 18, alignItems: "center" },
  emptyTitle: { fontSize: 14, fontWeight: "800", color: colors.ink, marginTop: 10 },
  emptyText: { fontSize: 12, color: colors.muted, textAlign: "center", marginTop: 5 },
});

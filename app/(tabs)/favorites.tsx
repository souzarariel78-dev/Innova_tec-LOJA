import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BrandMark, ProductCard, colors } from "@/components/marketplace";
import { products } from "@/constants/mock-data";
export default function FavoritesScreen(){return <ScreenContainer edges={["top"]} style={{backgroundColor:colors.canvas}}><View style={styles.header}><BrandMark/><Ionicons name="options-outline" size={22} color={colors.ink}/></View><ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>Favoritos</Text><Text style={styles.sub}>Seus produtos salvos ficam aqui.</Text><View style={styles.grid}>{products.slice(0,4).map(p=><ProductCard key={p.id} product={p}/>)}</View></ScrollView></ScreenContainer>}
const styles=StyleSheet.create({header:{padding:18, paddingTop:8,backgroundColor:colors.card,flexDirection:"row",justifyContent:"space-between"},content:{padding:18},title:{fontSize:27,fontWeight:"900",color:colors.ink},sub:{fontSize:13,color:colors.muted,marginTop:5,marginBottom:20},grid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between"}});

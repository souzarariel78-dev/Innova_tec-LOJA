import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BrandMark, colors } from "@/components/marketplace";
import { money, products, type Product } from "@/constants/mock-data";
import { sellerSyncCall } from "@/lib/seller-sync";

const steps = ["Fotos", "Detalhes", "Estado", "Preço", "Envio"];
const sellerCategories = ["Todos", "Eletrônicos", "Celulares e acessórios", "Áudio", "Informática", "Casa e cozinha", "Moda e acessórios", "Energia", "Games", "Variedades"];
const SELLER_OVERRIDES_KEY = "@mercadospot/seller-overrides-v1";
type RemoteOverride = { productId: string; description?: string | null; imageUri?: string | null; imageUris?: string | null; isDeleted?: boolean };
type SellerOverride = Partial<Product> & { isDeleted?: boolean };

function formatDimensions(product: Product) {
  const d = product.dimensions ?? { weightKg: 0.35, heightCm: 8, widthCm: 16, lengthCm: 22 };
  return `${d.heightCm} × ${d.widthCm} × ${d.lengthCm} cm · ${d.weightKg.toFixed(2).replace(".", ",")} kg`;
}

export default function SellScreen() {
  const [mode, setMode] = useState<"inventory" | "create">("inventory");
  const [inventory, setInventory] = useState<Product[]>(products);
  const [overrides, setOverrides] = useState<Record<string, SellerOverride>>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [editing, setEditing] = useState<Product | null>(null);
  const [draftDescription, setDraftDescription] = useState("");
  const [draftImages, setDraftImages] = useState<(string | number)[]>([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(SELLER_OVERRIDES_KEY).then((stored) => {
      if (!stored) return;
      try {
        const saved = JSON.parse(stored) as Record<string, SellerOverride>;
        setOverrides(saved);
        setInventory(products.filter((product) => !saved[product.id]?.isDeleted).map((product) => ({ ...product, ...(saved[product.id] ?? {}) })));
      } catch {
        // Ignore an invalid local cache and keep the catalog defaults.
      }
    });
    void sellerSyncCall<{ overrides: RemoteOverride[] }>("/api/seller/products/overrides").then(({ overrides: remote }) => {
      if (!remote?.length) return;
      const remoteMap = Object.fromEntries(remote.map((item) => {
        const patch: Partial<Product> = {};
        if (item.isDeleted) return [item.productId, { isDeleted: true }];
        if (item.description) patch.description = item.description;
        const gallery = item.imageUris ? JSON.parse(item.imageUris) as string[] : item.imageUri ? [item.imageUri] : [];
        if (gallery.length) { patch.images = gallery.slice(0, 3); patch.image = gallery[0]; }
        else if (item.imageUri) patch.image = item.imageUri;
        return [item.productId, patch];
      }));
      setOverrides((current) => ({ ...current, ...remoteMap }));
      setInventory(products.filter((product) => !remoteMap[product.id]?.isDeleted).map((product) => ({ ...product, ...(remoteMap[product.id] ?? {}) })));
    }).catch(() => undefined);
  }, []);

  const filteredProducts = useMemo(() => inventory.filter((product) => {
    const matchesQuery = `${product.title} ${product.catalogCode ?? ""}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "Todos" || product.category === category || (category === "Eletrônicos" && ["Informática", "Acessórios para celular"].includes(product.category));
    return matchesQuery && matchesCategory;
  }), [category, inventory, query]);

  const openEditor = (product: Product) => {
    setEditing(product);
    setDraftDescription(product.description);
    setDraftImages((product.images?.length ? product.images : [product.image]).slice(0, 3));
  };

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Permita o acesso às fotos para trocar a imagem do anúncio.");
      return;
    }
    const remaining = Math.max(1, 3 - draftImages.length);
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, allowsMultipleSelection: true, selectionLimit: remaining, quality: 0.7, base64: true });
    if (!result.canceled) {
      const picked = result.assets.slice(0, remaining).map((asset) => asset.base64 ? `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}` : asset.uri);
      setDraftImages((current) => [...current, ...picked].slice(0, 3));
    }
  };

  const saveEditor = async () => {
    if (!editing) return;
    const images = draftImages.length ? draftImages.slice(0, 3) : [editing.image];
    const override = { description: draftDescription.trim() || editing.description, image: images[0], images };
    const nextOverrides = { ...overrides, [editing.id]: override };
    setOverrides(nextOverrides);
    setInventory((current) => current.map((product) => product.id === editing.id ? { ...product, ...override } : product));
    AsyncStorage.setItem(SELLER_OVERRIDES_KEY, JSON.stringify(nextOverrides)).catch(() => undefined);
    setEditing(null);
    try {
      await sellerSyncCall(`/api/seller/products/${encodeURIComponent(editing.id)}`, {
        method: "PUT",
        body: JSON.stringify({ description: override.description, imageUri: typeof override.image === "string" ? override.image : undefined, imageUris: override.images.filter((image): image is string => typeof image === "string") }),
      });
      Alert.alert("Anúncio sincronizado", "A alteração foi salva localmente e sincronizada com a loja.");
    } catch {
      Alert.alert("Salvo offline", "A alteração ficou salva neste dispositivo e será sincronizada quando a loja estiver disponível.");
    }
  };

  const deleteProduct = (product: Product) => {
    Alert.alert("Excluir produto", `Excluir “${product.title}” da sua loja? Essa ação remove o item da vitrine.`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => {
        const nextOverrides = { ...overrides, [product.id]: { isDeleted: true } };
        setOverrides(nextOverrides);
        setInventory((current) => current.filter((item) => item.id !== product.id));
        AsyncStorage.setItem(SELLER_OVERRIDES_KEY, JSON.stringify(nextOverrides)).catch(() => undefined);
        void sellerSyncCall(`/api/seller/products/${encodeURIComponent(product.id)}`, { method: "DELETE" }).catch(() => undefined);
      } },
    ]);
  };

  if (mode === "create") {
    return <CreateListing step={step} setStep={setStep} onBack={() => { setMode("inventory"); setStep(0); }} />;
  }

  return (
    <ScreenContainer edges={["top"]} style={{ backgroundColor: colors.canvas }}>
      <View style={styles.header}><BrandMark /><Pressable onPress={() => setMode("create")}><Ionicons name="add-circle-outline" size={25} color={colors.blue} /></Pressable></View>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<>
          <View style={styles.headingRow}><View><Text style={styles.title}>Meus anúncios</Text><Text style={styles.sub}>Você vende todos os produtos do catálogo MercadoSpot.</Text></View><View style={styles.totalBadge}><Text style={styles.totalNumber}>{inventory.length}</Text><Text style={styles.totalLabel}>ativos</Text></View></View>
          <View style={styles.summaryRow}><View style={styles.summary}><Ionicons name="cube-outline" size={18} color={colors.blue} /><Text style={styles.summaryValue}>{inventory.length}</Text><Text style={styles.summaryLabel}>Produtos</Text></View><View style={styles.summary}><Ionicons name="layers-outline" size={18} color={colors.green} /><Text style={styles.summaryValue}>{new Set(inventory.map((product) => product.category)).size}</Text><Text style={styles.summaryLabel}>Categorias</Text></View><View style={styles.summary}><Ionicons name="images-outline" size={18} color={colors.yellow} /><Text style={styles.summaryValue}>{inventory.length}</Text><Text style={styles.summaryLabel}>Com foto</Text></View></View>
          <View style={styles.search}><Ionicons name="search" size={18} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar por produto ou código" placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRail}>{sellerCategories.map((item) => <Pressable key={item} style={[styles.categoryChip, category === item && styles.categoryChipActive]} onPress={() => setCategory(item)}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></Pressable>)}</ScrollView>
          <View style={styles.listHeading}><Text style={styles.sectionTitle}>{filteredProducts.length} anúncios encontrados</Text><Text style={styles.sizeHint}>Tamanho para frete incluso</Text></View>
        </>}
        renderItem={({ item }) => <View style={styles.productRow}><Image source={item.image} style={styles.productImage} contentFit="cover" /><View style={styles.productMain}><Text numberOfLines={2} style={styles.productTitle}>{item.title}</Text><Text style={styles.code}>{item.catalogCode ? `Cód. ${item.catalogCode}` : "Anúncio próprio"} · {item.category}</Text><Text style={styles.productPrice}>{money(item.price)}</Text><Text style={styles.dimensions}><Ionicons name="resize-outline" size={12} color={colors.green} /> {formatDimensions(item)}</Text><View style={styles.rowActions}><Pressable style={styles.editButton} onPress={() => openEditor(item)}><Ionicons name="create-outline" size={14} color={colors.blue} /><Text style={styles.editText}>Editar anúncio</Text></Pressable><Pressable style={styles.photoButton} onPress={() => openEditor(item)}><Ionicons name="camera-outline" size={14} color={colors.muted} /></Pressable><Pressable style={styles.deleteButton} onPress={() => deleteProduct(item)}><Ionicons name="trash-outline" size={14} color={colors.red} /></Pressable></View></View></View>}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="search-outline" size={30} color={colors.blue} /><Text style={styles.emptyTitle}>Nenhum produto encontrado</Text><Text style={styles.emptyText}>Tente outro nome, código ou categoria.</Text></View>}
      />
      <Modal visible={Boolean(editing)} animationType="slide" transparent onRequestClose={() => setEditing(null)}>
        <View style={styles.modalBackdrop}><View style={styles.modalCard}><View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Editar anúncio</Text><Text style={styles.modalSub}>{editing?.catalogCode ? `Código ${editing.catalogCode}` : "Produto próprio"}</Text></View><Pressable onPress={() => setEditing(null)}><Ionicons name="close-circle" size={26} color={colors.muted} /></Pressable></View><View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.editorGallery}>{draftImages.map((image, index) => <View key={`${String(image)}-${index}`} style={styles.editorThumbWrap}><Image source={image} style={styles.editorThumb} contentFit="cover" /><Pressable style={styles.removeThumb} onPress={() => setDraftImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Ionicons name="close" size={13} color={colors.ink} /></Pressable></View>)}{draftImages.length < 3 && <Pressable style={styles.addThumb} onPress={choosePhoto}><Ionicons name="camera-outline" size={22} color={colors.blue} /><Text style={styles.addThumbText}>Adicionar foto</Text><Text style={styles.addThumbCount}>{draftImages.length}/3</Text></Pressable>}</ScrollView><Text style={styles.photoHint}>Você pode carregar até 3 imagens por produto.</Text></View><Text style={styles.fieldLabel}>Descrição do anúncio</Text><TextInput value={draftDescription} onChangeText={setDraftDescription} multiline numberOfLines={6} textAlignVertical="top" style={styles.descriptionInput} placeholderTextColor={colors.muted} /><Text style={styles.fieldLabel}>Dimensões sugeridas para embalagem</Text><Text style={styles.modalDimensions}>{editing ? formatDimensions(editing) : ""}</Text><Text style={styles.dimensionsHelp}>Você pode ajustar este tamanho no cadastro definitivo do produto.</Text><Pressable style={styles.saveButton} onPress={saveEditor}><Ionicons name="checkmark-circle-outline" size={19} color={colors.ink} /><Text style={styles.saveText}>Salvar alterações</Text></Pressable></View></View>
      </Modal>
    </ScreenContainer>
  );
}

function CreateListing({ step, setStep, onBack }: { step: number; setStep: (value: number) => void; onBack: () => void }) {
  return <ScreenContainer edges={["top"]} style={{ backgroundColor: colors.canvas }}><View style={styles.header}><Pressable onPress={onBack}><Ionicons name="arrow-back" size={22} color={colors.ink} /></Pressable><BrandMark compact /><Ionicons name="information-circle-outline" size={22} color={colors.ink} /></View><ScrollView contentContainerStyle={styles.content}><Pressable onPress={onBack} style={styles.backToInventory}><Ionicons name="list-outline" size={16} color={colors.blue} /><Text style={styles.backToInventoryText}>Voltar para meus anúncios</Text></Pressable><Text style={styles.title}>Anunciar produto</Text><Text style={styles.sub}>Venda rápido, com segurança e transparência.</Text><View style={styles.stepper}>{steps.map((label, index) => <View style={styles.stepItem} key={label}><View style={[styles.stepCircle, index <= step && styles.activeCircle]}><Text style={[styles.stepNum, index <= step && { color: colors.ink }]}>{index + 1}</Text></View><Text style={[styles.stepLabel, index === step && { color: colors.blue, fontWeight: "800" }]}>{label}</Text>{index < steps.length - 1 && <View style={[styles.stepLine, index < step && { backgroundColor: colors.blue }]} />}</View>)}</View><View style={styles.formCard}>{step === 0 && <View style={styles.upload}><Ionicons name="camera-outline" size={30} color={colors.blue} /><Text style={styles.uploadTitle}>Adicione fotos do produto</Text><Text style={styles.uploadSub}>Use até 12 fotos e um vídeo curto</Text><Pressable style={styles.outlineButton}><Text style={styles.outlineText}>Escolher da galeria</Text></Pressable></View>}{step === 1 && <><Text style={styles.fieldLabel}>Título do anúncio</Text><TextInput style={styles.input} placeholder="Ex.: iPhone 13 128GB" placeholderTextColor={colors.muted} /><Text style={styles.fieldLabel}>Categoria</Text><View style={styles.select}><Text style={{ color: colors.ink }}>Selecione uma categoria</Text><Ionicons name="chevron-down" size={17} color={colors.muted} /></View><Text style={styles.fieldLabel}>Marca e modelo</Text><TextInput style={styles.input} placeholder="Informe marca e modelo" placeholderTextColor={colors.muted} /></>}{step === 2 && <><Text style={styles.formTitle}>Como está o produto?</Text>{["Novo", "Usado — em ótimo estado", "Usado — bom estado", "Recondicionado"].map((label, index) => <View style={styles.radioRow} key={label}><View style={[styles.radio, index === 0 && styles.radioActive]}>{index === 0 && <View style={styles.radioDot} />}</View><Text style={styles.radioText}>{label}</Text></View>)}</>}{step === 3 && <><Text style={styles.fieldLabel}>Preço de venda</Text><TextInput style={styles.input} keyboardType="decimal-pad" placeholder="R$ 0,00" placeholderTextColor={colors.muted} /><Text style={styles.fieldLabel}>Tipo de exposição</Text><View style={styles.exposure}><View><Text style={styles.exposureTitle}>Clássico</Text><Text style={styles.exposureSub}>Sem custo adicional</Text></View><Ionicons name="checkmark-circle" size={21} color={colors.blue} /></View><View style={styles.exposure}><View><Text style={styles.exposureTitle}>Premium</Text><Text style={styles.exposureSub}>Mais destaque na busca</Text></View><Ionicons name="ellipse-outline" size={21} color={colors.muted} /></View></>}{step === 4 && <><Text style={styles.formTitle}>Informações para o frete</Text>{["Peso com embalagem", "Altura", "Largura", "Comprimento"].map((label) => <View key={label}><Text style={styles.fieldLabel}>{label}</Text><TextInput style={styles.input} placeholder="0 cm" placeholderTextColor={colors.muted} /></View>)}</>}</View><Pressable style={styles.next} onPress={() => setStep(Math.min(step + 1, 4))}><Text style={styles.nextText}>{step === 4 ? "Publicar anúncio" : "Continuar"}</Text><Ionicons name="arrow-forward" size={17} color={colors.ink} /></Pressable>{step > 0 && <Pressable style={styles.back} onPress={() => setStep(step - 1)}><Text style={styles.backText}>Voltar</Text></Pressable>}</ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  header: { padding: 18, paddingTop: 8, backgroundColor: colors.card, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, content: { padding: 18, paddingBottom: 40 }, headingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, title: { fontSize: 27, fontWeight: "900", color: colors.ink }, sub: { fontSize: 13, color: colors.muted, marginTop: 5, maxWidth: 290 }, totalBadge: { width: 56, height: 56, borderRadius: 18, backgroundColor: colors.blue, alignItems: "center", justifyContent: "center" }, totalNumber: { fontSize: 18, fontWeight: "900", color: colors.ink }, totalLabel: { fontSize: 9, fontWeight: "800", color: colors.ink }, summaryRow: { flexDirection: "row", gap: 8, marginVertical: 20 }, summary: { flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 11, borderWidth: 1, borderColor: colors.border }, summaryValue: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 5 }, summaryLabel: { color: colors.muted, fontSize: 10, marginTop: 2 }, search: { height: 46, borderRadius: 14, backgroundColor: colors.card, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, gap: 9, borderWidth: 1, borderColor: colors.border }, searchInput: { flex: 1, color: colors.ink, fontSize: 13 }, categoryRail: { gap: 7, paddingVertical: 15 }, categoryChip: { borderRadius: 18, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.card }, categoryChipActive: { backgroundColor: colors.blue, borderColor: colors.blue }, categoryText: { color: colors.muted, fontSize: 10, fontWeight: "700" }, categoryTextActive: { color: colors.ink }, listHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }, sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: "900" }, sizeHint: { color: colors.green, fontSize: 9, fontWeight: "700" }, productRow: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 10, marginBottom: 10, gap: 11 }, productImage: { width: 86, height: 86, borderRadius: 12, backgroundColor: "#0D3448" }, productMain: { flex: 1 }, productTitle: { color: colors.ink, fontSize: 13, fontWeight: "800", lineHeight: 17 }, code: { color: colors.muted, fontSize: 10, marginTop: 4 }, productPrice: { color: colors.blue, fontSize: 15, fontWeight: "900", marginTop: 5 }, dimensions: { color: colors.green, fontSize: 10, marginTop: 5 }, rowActions: { flexDirection: "row", gap: 7, marginTop: 8 }, editButton: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: colors.blue, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 }, editText: { color: colors.blue, fontSize: 10, fontWeight: "800" }, deleteButton: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, borderColor: "#F3B6B6", alignItems: "center", justifyContent: "center", marginLeft: 4 }, photoButton: { width: 29, height: 27, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }, empty: { alignItems: "center", padding: 40 }, emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: "800", marginTop: 10 }, emptyText: { color: colors.muted, fontSize: 12, marginTop: 5 }, modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,.68)", justifyContent: "flex-end" }, modalCard: { backgroundColor: colors.canvas, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 30 }, modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, modalTitle: { color: colors.ink, fontSize: 21, fontWeight: "900" }, modalSub: { color: colors.muted, fontSize: 11, marginTop: 3 }, editorGallery: { gap: 10, alignItems: "center", paddingVertical: 4 }, editorThumbWrap: { width: 98, height: 118, position: "relative" }, editorThumb: { width: 98, height: 98, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, removeThumb: { position: "absolute", right: 4, top: 4, width: 23, height: 23, borderRadius: 12, backgroundColor: colors.yellow, alignItems: "center", justifyContent: "center" }, addThumb: { width: 98, height: 98, borderRadius: 14, borderWidth: 1, borderStyle: "dashed", borderColor: colors.blue, alignItems: "center", justifyContent: "center", gap: 3 }, addThumbText: { color: colors.blue, fontSize: 10, fontWeight: "800" }, addThumbCount: { color: colors.muted, fontSize: 10 }, photoHint: { color: colors.muted, fontSize: 11, marginTop: 5, marginBottom: 10 }, photoEditor: { height: 150, borderRadius: 16, overflow: "hidden", marginTop: 16, backgroundColor: colors.card, position: "relative" }, editorImage: { width: "100%", height: "100%" }, photoOverlay: { position: "absolute", alignSelf: "center", top: 53, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, backgroundColor: "rgba(6,26,42,.86)" }, photoOverlayText: { color: colors.ink, fontSize: 12, fontWeight: "800" }, fieldLabel: { fontSize: 12, fontWeight: "800", color: colors.ink, marginBottom: 7, marginTop: 15 }, descriptionInput: { minHeight: 105, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.ink, fontSize: 13 }, modalDimensions: { color: colors.green, fontSize: 13, fontWeight: "800" }, dimensionsHelp: { color: colors.muted, fontSize: 10, marginTop: 4 }, saveButton: { height: 50, borderRadius: 14, backgroundColor: colors.yellow, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 }, saveText: { color: colors.ink, fontSize: 14, fontWeight: "900" }, backToInventory: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 18 }, backToInventoryText: { color: colors.blue, fontSize: 12, fontWeight: "800" }, stepper: { flexDirection: "row", alignItems: "flex-start", marginVertical: 25 }, stepItem: { alignItems: "center", flex: 1, position: "relative" }, stepCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.border, alignItems: "center", justifyContent: "center" }, activeCircle: { backgroundColor: colors.blue }, stepNum: { fontSize: 11, fontWeight: "800", color: colors.muted }, stepLabel: { fontSize: 9, color: colors.muted, marginTop: 6 }, stepLine: { height: 2, backgroundColor: colors.border, position: "absolute", top: 12, left: "58%", width: "84%", zIndex: -1 }, formCard: { backgroundColor: colors.card, borderRadius: 20, padding: 17 }, upload: { borderWidth: 1.5, borderColor: colors.blue, borderStyle: "dashed", borderRadius: 17, alignItems: "center", paddingVertical: 42, backgroundColor: "#0D3448" }, uploadTitle: { fontSize: 15, fontWeight: "800", color: colors.ink, marginTop: 12 }, uploadSub: { fontSize: 12, color: colors.muted, marginTop: 4 }, outlineButton: { marginTop: 18, borderWidth: 1, borderColor: colors.blue, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10 }, outlineText: { color: colors.blue, fontSize: 12, fontWeight: "800" }, input: { height: 45, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 13, color: colors.ink, fontSize: 13 }, select: { height: 45, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, formTitle: { fontSize: 16, fontWeight: "800", color: colors.ink, marginBottom: 13 }, radioRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }, radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.muted, marginRight: 10, alignItems: "center", justifyContent: "center" }, radioActive: { borderColor: colors.blue }, radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue }, radioText: { fontSize: 13, color: colors.ink }, exposure: { borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 13, marginTop: 10, flexDirection: "row", justifyContent: "space-between" }, exposureTitle: { fontSize: 13, fontWeight: "800", color: colors.ink }, exposureSub: { fontSize: 11, color: colors.muted, marginTop: 3 }, next: { height: 50, borderRadius: 14, backgroundColor: colors.yellow, marginTop: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 }, nextText: { fontSize: 14, fontWeight: "900", color: colors.ink }, back: { alignItems: "center", padding: 14 }, backText: { color: colors.blue, fontWeight: "800", fontSize: 13 },
});

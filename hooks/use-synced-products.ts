import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { products, type Product } from "@/constants/mock-data";
import { sellerSyncCall } from "@/lib/seller-sync";

const OVERRIDES_KEY = "@mercadospot/seller-overrides-v1";
type RemoteOverride = { productId: string; description?: string | null; imageUri?: string | null; imageUris?: string | null; isDeleted?: boolean };

function mergeProducts(source: Product[], entries: Record<string, Partial<Product> & { isDeleted?: boolean }>) {
  return source.filter((product) => !entries[product.id]?.isDeleted).map((product) => ({ ...product, ...(entries[product.id] ?? {}) }));
}

function toMap(items: RemoteOverride[]) {
  return Object.fromEntries(items.map((item) => {
    const patch: Partial<Product> = {};
    if (item.description) patch.description = item.description;
    const gallery = item.imageUris ? JSON.parse(item.imageUris) as string[] : item.imageUri ? [item.imageUri] : [];
    if (item.isDeleted) return [item.productId, { isDeleted: true }];
    if (gallery.length) { patch.images = gallery.slice(0, 3); patch.image = gallery[0]; }
    return [item.productId, patch];
  }));
}

export function useSyncedProducts(refreshKey = 0) {
  const [syncedProducts, setSyncedProducts] = useState<Product[]>(products);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const local = await AsyncStorage.getItem(OVERRIDES_KEY);
        if (mounted && local) setSyncedProducts(mergeProducts(products, JSON.parse(local)));
      } catch {
        // Keep the bundled catalog when offline or when a local cache is invalid.
      }
      try {
        const result = await sellerSyncCall<{ overrides: RemoteOverride[] }>("/api/seller/products/overrides");
        if (mounted && result.overrides?.length) {
          const remoteMap = toMap(result.overrides);
          setSyncedProducts(mergeProducts(products, remoteMap));
          await AsyncStorage.setItem(OVERRIDES_KEY, JSON.stringify(remoteMap));
        }
      } catch {
        // The local version remains visible while the store is offline.
      }
    };
    void load();
    const interval = setInterval(() => { void load(); }, 8_000);
    return () => { mounted = false; clearInterval(interval); };
  }, [refreshKey]);

  return syncedProducts;
}

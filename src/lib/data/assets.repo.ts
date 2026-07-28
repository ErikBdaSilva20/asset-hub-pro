import { db } from "./client";
import type { Tables } from "./types.gen";

export type Asset = Tables<"assets">;

const assetsTable = db.table<Asset>("assets");

export const EQUIPMENT_KINDS: Asset["kind"][] = ["notebook", "desktop", "peripheral", "tool"];

function normalize(asset: Asset): Asset {
  return { ...asset, purchase_value: Number(asset.purchase_value) || 0 };
}

export const listAssets = () => assetsTable.list().then((rows) => rows.map(normalize));
export const listEquipment = () =>
  listAssets().then((rows) => rows.filter((asset) => EQUIPMENT_KINDS.includes(asset.kind)));
export const createAsset = (input: Partial<Asset>) => assetsTable.create(input);
export const updateAsset = (id: string, patch: Partial<Asset>) => assetsTable.update(id, patch);
export const removeAsset = (id: string) => assetsTable.remove(id);

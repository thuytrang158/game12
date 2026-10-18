import { IItem } from '../types/game';
import { INITIAL_ITEMS } from '../data/items';
import { AudioManager } from './AudioManager';

export type InventoryListener = (items: IItem[]) => void;

export class InventoryManager {
  private static instance: InventoryManager;
  private items: IItem[] = [];
  private listeners: InventoryListener[] = [];

  public static getInstance(): InventoryManager {
    if (!InventoryManager.instance) {
      InventoryManager.instance = new InventoryManager();
    }
    return InventoryManager.instance;
  }

  public init(initialItems: IItem[]) {
    this.items = JSON.parse(JSON.stringify(initialItems));
  }

  public addListener(listener: InventoryListener) {
    this.listeners.push(listener);
  }

  public removeListener(listener: InventoryListener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notify() {
    this.listeners.forEach(l => l([...this.items]));
  }

  public getItems(): IItem[] {
    return this.items;
  }

  public getItem(itemId: string): IItem | undefined {
    return this.items.find(i => i.id === itemId);
  }

  public hasItem(itemId: string): boolean {
    const item = this.getItem(itemId);
    if (!item) return false;
    return item.quantity === undefined ? true : item.quantity > 0;
  }

  public addItem(itemOrId: IItem | string, quantity: number = 1): void {
    let itemToAdd: IItem;

    if (typeof itemOrId === 'string') {
      const template = INITIAL_ITEMS[itemOrId];
      if (!template) {
        console.warn(`Item with id ${itemOrId} not found in INITIAL_ITEMS`);
        return;
      }
      itemToAdd = JSON.parse(JSON.stringify(template));
    } else {
      itemToAdd = JSON.parse(JSON.stringify(itemOrId));
    }

    const existing = this.items.find(i => i.id === itemToAdd.id);

    if (existing) {
      if (existing.quantity !== undefined) {
        existing.quantity += quantity;
      } else {
        existing.quantity = quantity;
      }
    } else {
      if (itemToAdd.quantity !== undefined) {
        itemToAdd.quantity = Math.max(quantity, itemToAdd.quantity);
      }
      this.items.push(itemToAdd);
    }

    AudioManager.getInstance().playPluck();
    this.notify();
  }

  public removeItem(itemId: string, quantity: number = 1): boolean {
    const idx = this.items.findIndex(i => i.id === itemId);
    if (idx === -1) return false;

    const item = this.items[idx];
    if (item.quantity !== undefined) {
      item.quantity -= quantity;
      if (item.quantity <= 0) {
        this.items.splice(idx, 1);
      }
    } else {
      this.items.splice(idx, 1);
    }

    this.notify();
    return true;
  }

  public getFragments(): IItem[] {
    return this.items.filter(i => i.category === 'fragment');
  }

  public getCoins(): number {
    const coinItem = this.getItem('coin_xu_tra');
    return coinItem?.quantity ?? 0;
  }

  public addCoins(amount: number): void {
    this.addItem('coin_xu_tra', amount);
  }

  public spendCoins(amount: number): boolean {
    const cur = this.getCoins();
    if (cur < amount) return false;
    return this.removeItem('coin_xu_tra', amount);
  }
}

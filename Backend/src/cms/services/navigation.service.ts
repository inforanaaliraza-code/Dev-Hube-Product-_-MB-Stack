import { Injectable } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { UserEntity } from '../../users/entities/user.entity';
import { NavItemDto } from '../dto/update-navigation.dto';

export type NavItem = {
  id: string;
  label: string;
  href: string;
  target: '_self' | '_blank';
  sortOrder: number;
  enabled: boolean;
};

export const DEFAULT_NAVIGATION: NavItem[] = [
  { id: 'home', label: 'Home', href: '/', target: '_self', sortOrder: 0, enabled: true },
  { id: 'tools', label: 'Tools', href: '/tools', target: '_self', sortOrder: 1, enabled: true },
  { id: 'blog', label: 'Blog', href: '/blog', target: '_self', sortOrder: 2, enabled: true },
];

@Injectable()
export class NavigationService {
  constructor(private readonly settings: SettingsService) {}

  async getItems(): Promise<NavItem[]> {
    const all = await this.settings.getAll();
    const nav = all.navigation as { items?: NavItem[] } | undefined;
    if (!nav?.items?.length) return DEFAULT_NAVIGATION;
    return [...nav.items].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getPublicItems(): Promise<NavItem[]> {
    const items = await this.getItems();
    return items.filter((i) => i.enabled);
  }

  async updateItems(items: NavItemDto[], user?: UserEntity) {
    const normalized = items.map((i, idx) => ({
      id: i.id,
      label: i.label,
      href: i.href,
      target: i.target ?? '_self',
      sortOrder: i.sortOrder ?? idx,
      enabled: i.enabled,
    }));
    await this.settings.upsert('navigation', { items: normalized }, user);
    return normalized;
  }
}

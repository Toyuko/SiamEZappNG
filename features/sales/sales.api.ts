import { appConfig } from '../../lib/config';
import type { SalesListing } from './sales.types';

type ParsedInventory = {
  vehicles: Array<{
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    mileageKm: number;
    priceAmount: number;
    category: 'car' | 'motorcycle';
    status: 'available' | 'reserved' | 'sold';
    heroImageUrl: string;
    description: string;
    createdById?: string | null;
    createdAt?: string;
  }>;
};

function extractByRegex(html: string, pattern: RegExp) {
  const match = html.match(pattern);
  if (!match?.[1]) return null;
  return match[1];
}

function parseVehiclesFromHtml(html: string): ParsedInventory['vehicles'] {
  // 1) Prefer raw JSON shape if present.
  const rawJsonArray = extractByRegex(html, /"vehicles":(\[[\s\S]*?\]),"bounds":/);
  if (rawJsonArray) {
    try {
      const parsed = JSON.parse(rawJsonArray.replace(/\$D/g, '')) as ParsedInventory['vehicles'];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Fall through to escaped payload parsing.
    }
  }

  // 2) Next.js flight payload often escapes quotes like \"vehicles\": ...
  const escapedJsonArray = extractByRegex(html, /\\"vehicles\\":(\[[\s\S]*?\]),\\"bounds\\":/);
  if (!escapedJsonArray) return [];

  try {
    const unescaped = escapedJsonArray
      .replace(/\$D/g, '')
      .replace(/\\"/g, '"');
    const parsed = JSON.parse(unescaped) as ParsedInventory['vehicles'];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function fetchWebsiteSalesListings(): Promise<SalesListing[]> {
  const response = await fetch(`${appConfig.webBaseUrl}/en/sales`, {
    method: 'GET',
    headers: { Accept: 'text/html' },
  });
  if (!response.ok) {
    throw new Error(`Unable to load website sales inventory (${response.status})`);
  }

  const html = await response.text();
  const vehicles = parseVehiclesFromHtml(html);

  return vehicles.map((vehicle) => ({
    id: vehicle.id,
    ownerId: vehicle.createdById ?? 'seed-admin',
    title: vehicle.title,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    mileageKm: vehicle.mileageKm,
    priceAmount: vehicle.priceAmount,
    category: vehicle.category,
    status: vehicle.status,
    heroImageUrl: vehicle.heroImageUrl,
    description: vehicle.description,
    createdAt: vehicle.createdAt ?? new Date().toISOString(),
  }));
}

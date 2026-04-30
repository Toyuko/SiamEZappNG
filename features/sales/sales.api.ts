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

function parseVehiclesFromHtml(html: string): ParsedInventory['vehicles'] {
  const marker = '"vehicles":[';
  const start = html.indexOf(marker);
  if (start < 0) return [];

  const arrayStart = html.indexOf('[', start);
  if (arrayStart < 0) return [];

  let depth = 0;
  let inString = false;
  let escape = false;
  let arrayEnd = -1;

  for (let i = arrayStart; i < html.length; i += 1) {
    const ch = html[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '[') {
      depth += 1;
    } else if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        arrayEnd = i;
        break;
      }
    }
  }

  if (arrayEnd < 0) return [];

  const rawArray = html.slice(arrayStart, arrayEnd + 1).replace(/\$D/g, '');
  try {
    const parsed = JSON.parse(rawArray) as ParsedInventory['vehicles'];
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

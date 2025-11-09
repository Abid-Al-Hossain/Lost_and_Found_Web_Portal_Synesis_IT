// src/utils/matcher.js

// Haversine distance in meters between two {lat,lng} points
function toRad(d) { return (d * Math.PI) / 180 }
export function haversineMeters(a, b) {
  if (!a || !b) return Infinity
  const lat1 = a.lat ?? a.latitude
  const lng1 = a.lng ?? a.longitude
  const lat2 = b.lat ?? b.latitude
  const lng2 = b.lng ?? b.longitude
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return Infinity

  const R = 6371000 // meters
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const la1 = toRad(lat1)
  const la2 = toRad(lat2)

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)

  const h = sinDLat * sinDLat + Math.cos(la1) * Math.cos(la2) * sinDLng * sinDLng
  return 2 * R * Math.asin(Math.sqrt(h))
}

const norm = (s) => String(s || '').trim().toLowerCase()

// Basic similarity: same "type" (e.g., bag/phone/ID)
// If brand/color exist on both, require at least one to match.
export function isSimilar(lost, found) {
  const t1 = norm(lost.type)
  const t2 = norm(found.type)
  if (!t1 || !t2 || t1 !== t2) return false

  const b1 = norm(lost.brand), b2 = norm(found.private?.brand ?? found.brand)
  const c1 = norm(lost.color), c2 = norm(found.private?.color ?? found.color)

  if (b1 && b2 && c1 && c2) return (b1 === b2) || (c1 === c2)
  if (b1 && b2) return b1 === b2
  if (c1 && c2) return c1 === c2
  return true
}

export function withinMeters(locA, locB, max = 100) {
  return haversineMeters(locA, locB) <= max
}

/**
 * Find counterpart matches for a newly created item.
 * kind: 'lost' | 'found'
 * newItem: the created item (must have {location:{lat,lng}})
 * opts: { candidates, maxMeters=100 }
 */
export function findMatches(kind, newItem, { candidates = [], maxMeters = 100 } = {}) {
  const here = newItem?.location
  if (!here) return []
  const results = []
  for (const other of candidates) {
    if (!other?.location) continue
    const close = withinMeters(here, other.location, maxMeters)
    const similar = kind === 'lost' ? isSimilar(newItem, other) : isSimilar(other, newItem)
    if (close && similar) {
      results.push({
        lost: kind === 'lost' ? newItem : other,
        found: kind === 'found' ? newItem : other,
        distanceM: Math.round(haversineMeters(here, other.location)),
      })
    }
  }
  return results
}

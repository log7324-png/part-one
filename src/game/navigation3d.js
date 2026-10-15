// Pure x/z navigation shared by keyboard movement and click-to-walk.
// A character is a circle against expanded AABBs; y is owned by the 3D scene.
export const CHARACTER_RADIUS = 0.34;

export function isPositionWalkable(position, colliders = [], bounds, radius = CHARACTER_RADIUS) {
  const { x, z } = position;
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  if (bounds && (x < bounds.minX + radius || x > bounds.maxX - radius || z < bounds.minZ + radius || z > bounds.maxZ - radius)) return false;
  return !colliders.some(box => x > box.minX - radius && x < box.maxX + radius && z > box.minZ - radius && z < box.maxZ + radius);
}

export function moveWithCollisions(position, delta, colliders = [], bounds, radius = CHARACTER_RADIUS) {
  const next = { ...position };
  // Substeps prevent crossing thin walls during a delayed animation frame.
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(delta.x), Math.abs(delta.z)) / (radius * 0.55)));
  for (let i = 0; i < steps; i++) {
    const x = { x: next.x + delta.x / steps, z: next.z };
    if (isPositionWalkable(x, colliders, bounds, radius)) next.x = x.x;
    const z = { x: next.x, z: next.z + delta.z / steps };
    if (isPositionWalkable(z, colliders, bounds, radius)) next.z = z.z;
  }
  return next;
}

export function segmentIsWalkable(start, end, colliders = [], bounds, radius = CHARACTER_RADIUS) {
  const distance = Math.hypot(end.x - start.x, end.z - start.z);
  const steps = Math.max(1, Math.ceil(distance / 0.14));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (!isPositionWalkable({ x: start.x + (end.x - start.x) * t, z: start.z + (end.z - start.z) * t }, colliders, bounds, radius)) return false;
  }
  return true;
}

export function nearestWalkablePoint(point, colliders = [], bounds, radius = CHARACTER_RADIUS) {
  const clamped = bounds ? {
    x: Math.max(bounds.minX + radius + 0.01, Math.min(bounds.maxX - radius - 0.01, point.x)),
    z: Math.max(bounds.minZ + radius + 0.01, Math.min(bounds.maxZ - radius - 0.01, point.z)),
  } : { ...point };
  if (isPositionWalkable(clamped, colliders, bounds, radius)) return clamped;
  for (let distance = 0.4; distance < 12; distance += 0.4) {
    const count = Math.ceil(distance * 16);
    for (let step = 0; step < count; step++) {
      const angle = step / count * Math.PI * 2;
      const candidate = { x: clamped.x + Math.cos(angle) * distance, z: clamped.z + Math.sin(angle) * distance };
      if (isPositionWalkable(candidate, colliders, bounds, radius)) return candidate;
    }
  }
  return null;
}

export function findPath(start, target, colliders = [], bounds, radius = CHARACTER_RADIUS) {
  if (!bounds || !isPositionWalkable(start, colliders, bounds, radius)) return [];
  const goal = nearestWalkablePoint(target, colliders, bounds, radius);
  if (!goal) return [];
  if (segmentIsWalkable(start, goal, colliders, bounds, radius)) return [{ ...goal }];
  const size = 0.55;
  const minX = bounds.minX + radius + 0.02;
  const minZ = bounds.minZ + radius + 0.02;
  const width = Math.floor((bounds.maxX - radius - minX) / size) + 1;
  const depth = Math.floor((bounds.maxZ - radius - minZ) / size) + 1;
  const nodes = new Map();
  const key = (x, z) => z * width + x;
  const point = node => ({ x: minX + node.x * size, z: minZ + node.z * size });
  const valid = (x, z) => x >= 0 && z >= 0 && x < width && z < depth && isPositionWalkable({ x: minX + x * size, z: minZ + z * size }, colliders, bounds, radius);
  function gridNear(p) {
    const x = Math.round((p.x - minX) / size), z = Math.round((p.z - minZ) / size);
    for (let r = 0; r < 5; r++) {
      let closest = null, distance = Infinity;
      for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
        if (!valid(x + dx, z + dz)) continue;
        const node = { x: x + dx, z: z + dz };
        const position = point(node);
        const d = Math.hypot(position.x - p.x, position.z - p.z);
        if (d < distance && segmentIsWalkable(p, position, colliders, bounds, radius)) { closest = node; distance = d; }
      }
      if (closest) return closest;
    }
    return null;
  }
  const origin = gridNear(start), destination = gridNear(goal);
  if (!origin || !destination) return [];
  const heuristic = node => Math.hypot(node.x - destination.x, node.z - destination.z);
  const first = { ...origin, g: 0, f: heuristic(origin), parent: null, closed: false };
  nodes.set(key(first.x, first.z), first);
  const open = [first];
  const offsets = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
  let end = null;
  for (let count = 0; open.length && count < 12000; count++) {
    let best = 0;
    for (let i = 1; i < open.length; i++) if (open[i].f < open[best].f) best = i;
    const current = open.splice(best, 1)[0];
    current.closed = true;
    if (current.x === destination.x && current.z === destination.z) { end = current; break; }
    for (const [dx, dz] of offsets) {
      const x = current.x + dx, z = current.z + dz;
      if (!valid(x, z)) continue;
      // Do not clip through the corner between two obstacles.
      if (!segmentIsWalkable(point(current), point({x,z}), colliders, bounds, radius)) continue;
      const id = key(x, z), old = nodes.get(id);
      if (old?.closed) continue;
      const g = current.g + Math.hypot(dx, dz);
      if (old && g >= old.g) continue;
      const node = old || { x, z, closed: false };
      Object.assign(node, { g, f: g + heuristic(node), parent: current });
      if (!old) { nodes.set(id, node); open.push(node); }
    }
  }
  if (!end) return [];
  const raw = [{ ...goal }];
  for (let node = end; node; node = node.parent) raw.push(point(node));
  raw.reverse();
  // Greedy line-of-sight smoothing produces natural paths with few turns.
  const result = [];
  let anchor = start, index = 0;
  while (index < raw.length) {
    let furthest = index;
    for (let i = index; i < raw.length; i++) {
      if (!segmentIsWalkable(anchor, raw[i], colliders, bounds, radius)) break;
      furthest = i;
    }
    const next = raw[furthest];
    if (Math.hypot(next.x - anchor.x, next.z - anchor.z) > 0.03) result.push(next);
    anchor = next;
    index = furthest + 1;
  }
  return result;
}

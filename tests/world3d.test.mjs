import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildExterior, buildInterior } from '../src/game/world3d.js';
import { findPath, isPositionWalkable, segmentIsWalkable, moveWithCollisions } from '../src/game/navigation3d.js';
import { HOUSES } from '../src/data/houses.js';

// Sign textures need a Canvas object, but these contract tests never render pixels.
// Browser verification separately covers the actual WebGL result and interaction.
const context = new Proxy({}, { get: (target, key) => key in target ? target[key] : () => {}, set: (target, key, value) => { target[key] = value; return true; } });
globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => context }) };

function dispose(world) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  world.group.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    for (const mat of [object.material].flat().filter(Boolean)) { materials.add(mat); if (mat.map) textures.add(mat.map); }
  });
  textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose()); geometries.forEach(g => g.dispose());
}
function assertRoute(world, target) {
  const path = findPath(world.spawn, target, world.colliders, world.bounds);
  assert.ok(path.length, 'actual model collision layout must leave a route');
  let previous = world.spawn;
  for (const point of path) {
    assert.ok(segmentIsWalkable(previous, point, world.colliders, world.bounds)); previous = point;
  }
  assert.ok(Math.hypot(previous.x - target.x, previous.z - target.z) < 0.65);
}
for (const company of ['hub', 'systems', 'aerospace', 'ocean']) {
  test(`${company}: real 3D village has walkable hinged entrances and a safe spawn`, () => {
    const world = buildExterior(THREE, company);
    try {
      assert.equal(world.group.type, 'Group');
      assert.ok(isPositionWalkable(world.spawn, world.colliders, world.bounds));
      const doors = world.triggers.filter(t => t.type === 'enter');
      assert.equal(doors.length, company === 'hub' ? 5 : 3);
      assert.equal(world.doors.length, doors.length);
      if(company === 'hub')assert.deepEqual(new Set(doors.map(d=>d.id)),new Set(HOUSES.map(h=>h.id)));
      for (const door of world.triggers) {
        assertRoute(world, door);
        let position = { ...world.spawn };
        const route = findPath(position, door, world.colliders, world.bounds);
        for (let frame = 0; frame < 1800 && route.length; frame++) {
          const target = route[0], distance = Math.hypot(target.x-position.x, target.z-position.z);
          if (distance < .1) { route.shift(); continue; }
          const step = Math.min(4.7 / 60, distance);
          position = moveWithCollisions(position, {x:(target.x-position.x)/distance*step,z:(target.z-position.z)/distance*step}, world.colliders, world.bounds);
        }
        assert.ok(Math.hypot(position.x-door.x,position.z-door.z) < door.radius, 'walking the actual route must reach its door trigger');
      }
      let meshes = 0;
      world.group.traverse(o => { if (o.isMesh) meshes++; });
      assert.ok(meshes > 20, 'village must contain real geometry');
      assert.ok(!isPositionWalkable({ x: 31, z: 25 }, world.colliders, world.bounds), 'rounded coastline cannot be crossed');
    } finally { dispose(world); }
  });
}
test('five homes cover nine topics and each home has a resident and reachable exhibits', () => {
  assert.equal(HOUSES.length,5);
  assert.deepEqual(HOUSES.reduce((count,home)=>(count[home.companyId]=(count[home.companyId]||0)+1,count),{}),{systems:2,aerospace:2,ocean:1});
  assert.equal(new Set(HOUSES.flatMap(home=>home.topics)).size,9);
  for(const home of HOUSES){
    const world=buildInterior(THREE,home.id);
    try{
      assert.ok(world.interactables.some(item=>item.type==='resident'));
      for(const topic of home.topics){
        const exhibit=world.interactables.find(item=>item.id===topic&&item.type!=='resident');
        assert.ok(exhibit,`${topic} must have a physical exhibit`);
        assertRoute(world,{x:exhibit.x,z:exhibit.z+Math.min(1.9,exhibit.radius*.8)});
      }
    } finally {dispose(world);}
  }
});
for (const id of ['radar','satellite','combat','engine','launch','ground','lng','naval','offshore']) {
  test(`${id}: actual room leaves a walkable entrance, exhibit and exit`, () => {
    const world = buildInterior(THREE, id);
    try {
      assert.ok(isPositionWalkable(world.spawn, world.colliders, world.bounds));
      assert.equal(world.triggers.filter(t => t.type === 'exit').length, 1);
      assertRoute(world, world.triggers[0]);
      const exhibit = world.interactables.find(i => i.id === id);
      assert.ok(exhibit);
      const approach = { x: exhibit.x, z: exhibit.z + 2.25 };
      assertRoute(world, approach);
      assert.ok(Math.hypot(approach.x-exhibit.x, approach.z-exhibit.z) < exhibit.radius);
    } finally { dispose(world); }
  });
}

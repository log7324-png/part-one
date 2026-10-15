import test from 'node:test';
import assert from 'node:assert/strict';
import { isPositionWalkable, moveWithCollisions, findPath, nearestWalkablePoint, segmentIsWalkable } from '../src/game/navigation3d.js';

const bounds = {minX:-22,maxX:22,minZ:-18,maxZ:18};
const house = {minX:7,maxX:13,minZ:-10.5,maxZ:-5.5};

test('avatar radius respects walls, world limits and malformed positions', () => {
  assert.equal(isPositionWalkable({x:6.8,z:-8},[house],bounds),false);
  assert.equal(isPositionWalkable({x:6.6,z:-8},[house],bounds),true);
  assert.equal(isPositionWalkable({x:21.9,z:0},[],bounds),false);
  assert.equal(isPositionWalkable({x:NaN,z:0},[],bounds),false);
});

test('movement slides along walls and cannot tunnel across thin obstacles', () => {
  const wall = {minX:1,maxX:1.1,minZ:-3,maxZ:3};
  const result = moveWithCollisions({x:0,z:0},{x:8,z:1},[wall],bounds);
  assert.ok(result.x < 0.67);
  assert.ok(result.z > 0.9);
  assert.ok(isPositionWalkable(result,[wall],bounds));
});

test('A* routes around a house without cutting its corners', () => {
  const start = {x:10,z:-14},goal = {x:10,z:-4.45};
  const path = findPath(start,goal,[house],bounds);
  assert.ok(path.length > 1);
  let previous = start;
  for (const next of path) {
    assert.ok(segmentIsWalkable(previous,next,[house],bounds),JSON.stringify(next));
    previous=next;
  }
  assert.ok(Math.hypot(previous.x-goal.x,previous.z-goal.z)<0.01);
});

test('exterior spawn and reachable door center remain valid', () => {
  const start = {x:0,z:8},door={x:10,z:-4.45};
  const path=findPath(start,door,[house],bounds);
  assert.ok(isPositionWalkable(start,[house],bounds));
  assert.deepEqual(path.at(-1),door);
});

test('invalid click targets resolve to a nearby safe point', () => {
  const point=nearestWalkablePoint({x:10,z:-8},[house],bounds);
  assert.ok(point && isPositionWalkable(point,[house],bounds));
  const edge=nearestWalkablePoint({x:100,z:100},[],bounds);
  assert.ok(isPositionWalkable(edge,[],bounds));
});

test('sealed rooms do not produce a route', () => {
  const colliders=[{minX:-1,maxX:1,minZ:-18,maxZ:18}];
  assert.deepEqual(findPath({x:-8,z:0},{x:8,z:0},colliders,bounds),[]);
});

test('indoor exit is reachable and front world limit stays solid', () => {
  const room={minX:-7,maxX:7,minZ:-5,maxZ:6};
  assert.equal(findPath({x:0,z:3.8},{x:0,z:5.5},[],room).length,1);
  const result=moveWithCollisions({x:0,z:5.5},{x:0,z:5},[],room);
  assert.ok(result.z<=5.66);
});

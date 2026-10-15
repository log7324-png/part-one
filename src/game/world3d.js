// Original, code-built 3D village. No third-party game artwork is used.
import { HOUSES, houseById } from '../data/houses.js';
const LEGACY_HOUSES = [[-11, -6], [10, -8], [9, 8]];
const COMPANY = {
  hub: { name: '한화 테크 빌리지', color: '#eea167', roof: '#db8d5f', subtitle: '천천히 걸으며 기술을 만나요' },
  systems: { name: '한화시스템', color: '#73b6a6', roof: '#529b89', subtitle: '세상을 발견하는 기술' },
  aerospace: { name: '한화에어로스페이스', color: '#e1aa72', roof: '#cb805a', subtitle: '새로운 길을 여는 기술' },
  ocean: { name: '한화오션', color: '#80b9c7', roof: '#588fa7', subtitle: '바다를 연결하는 기술' },
};
const FACILITY = {
  radar: { name: '레이다 연구소', company: 'systems', icon: 'radar', text: '작은 신호에서 정보를 찾아요' },
  satellite: { name: '위성 관측소', company: 'systems', icon: 'satellite', text: '우주에서 지구를 바라봐요' },
  combat: { name: '함정 관제실', company: 'systems', icon: 'combat', text: '여러 정보를 하나로 모아요' },
  engine: { name: '항공엔진 공방', company: 'aerospace', icon: 'engine', text: '움직임을 만드는 작은 공방' },
  launch: { name: '우주 발사센터', company: 'aerospace', icon: 'launch', text: '우주를 향한 여행을 준비해요' },
  ground: { name: '지상장비 정비소', company: 'aerospace', icon: 'ground', text: '함께 움직이고 돌보는 기술' },
  lng: { name: 'LNG 항구 사무소', company: 'ocean', icon: 'lng', text: '바다 건너 에너지를 전해요' },
  naval: { name: '특수선 설계실', company: 'ocean', icon: 'naval', text: '바다의 임무를 담은 배' },
  offshore: { name: '해양설비 제작소', company: 'ocean', icon: 'offshore', text: '바다 위의 큰 구조물을 만들어요' },
};

function kit(THREE) {
  const materials = new Map();
  const mat = (color, roughness = 0.82) => {
    const key = `${color}-${roughness}`;
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness }));
    return materials.get(key);
  };
  const mesh = (parent, geometry, color, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geometry, mat(color));
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  const box = (p, x, y, z, w, h, d, color) => mesh(p, new THREE.BoxGeometry(w, h, d), color, x, y, z);
  const ball = (p, x, y, z, r, color, sx = 1, sy = 1, sz = 1) => {
    const m = mesh(p, new THREE.SphereGeometry(r, 12, 9), color, x, y, z); m.scale.set(sx, sy, sz); return m;
  };
  const cylinder = (p, x, y, z, rt, rb, h, color, sides = 16) => mesh(p, new THREE.CylinderGeometry(rt, rb, h, sides), color, x, y, z);
  const roundShape = (w, h, r) => {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  };
  const rounded = (p, x, y, z, w, h, d, color, r = 0.12) => {
    r = Math.min(r, w * 0.2, h * 0.2, d * 0.2);
    const geo = new THREE.ExtrudeGeometry(roundShape(w - r * 2, h - r * 2, Math.min(r, h / 5)), { depth: Math.max(0.02, d - r * 2), bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: r, bevelThickness: r, curveSegments: 5 });
    geo.translate(0, 0, -Math.max(0.02, d - r * 2) / 2);
    return mesh(p, geo, color, x, y, z);
  };
  const board = (p, title, subtitle, x, y, z, width = 3, color = '#425d4e') => {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 224;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff7e4'; ctx.beginPath(); ctx.roundRect(7, 7, 754, 210, 30); ctx.fill();
    ctx.strokeStyle = '#d6bc8b'; ctx.lineWidth = 8; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
    ctx.font = 'bold 49px "Malgun Gothic", sans-serif'; ctx.fillText(title, 384, subtitle ? 82 : 114, 700);
    if (subtitle) { ctx.font = '28px "Malgun Gothic", sans-serif'; ctx.fillStyle = '#86785e'; ctx.fillText(subtitle, 384, 158, 700); }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(width, width * 224 / 768), new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, depthWrite: true }));
    m.position.set(x, y, z); p.add(m); return m;
  };
  const group = (p, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  return { THREE, mat, mesh, box, ball, cylinder, rounded, roundShape, board, group };
}

function path(k, parent, x1, z1, x2, z2, width = 2.4) {
  const dx = x2 - x1, dz = z2 - z1, length = Math.hypot(dx, dz);
  const tile = k.rounded(parent, (x1 + x2) / 2, 0.025, (z1 + z2) / 2, width, 0.055, length + width / 2, '#e4d0a0', 0.04);
  tile.rotation.y = Math.atan2(dx, dz);
  // Small irregular edge stones make the paths feel like garden paths.
  for (let i = 1; i < length; i += 2.1) {
    const t = i / length, side = Math.floor(i) % 2 ? 1 : -1;
    const x = x1 + dx * t + dz / length * width * 0.55 * side;
    const z = z1 + dz * t - dx / length * width * 0.55 * side;
    const s = k.ball(parent, x, 0.075, z, 0.18, '#f2e4bc', 1.6, 0.3, 1.05); s.rotation.y = i;
  }
}

function tree(k, p, x, z, scale = 1, leafTexture = null) {
  const g = k.group(p, x, 0, z); g.scale.setScalar(scale);
  k.cylinder(g,0,1.05,0,.2,.37,2.1,'#a76028',10);
  for(const side of[-1,1]){
    const root=k.ball(g,side*.25,.2,.03,.36,'#a76028',1.1,.35,.55);root.rotation.z=side*.4;
    const branch=k.cylinder(g,side*.28,1.82,0,.09,.17,1.25,'#a76028',8);branch.rotation.z=-side*.54;
  }
  if(leafTexture){
    const material=new k.THREE.MeshStandardMaterial({map:leafTexture,transparent:true,alphaTest:.35,side:k.THREE.DoubleSide,depthWrite:true,roughness:1});
    for(const angle of[0,Math.PI/3,Math.PI*2/3]){
      const panel=new k.THREE.Mesh(new k.THREE.PlaneGeometry(4.2,4.2),material);
      panel.position.y=2.1;panel.rotation.y=angle;panel.castShadow=true;panel.receiveShadow=true;g.add(panel);
    }
  }else{
    for(const [xx,yy,zz,r,c] of [[0,2.6,0,1.25,'#61b239'],[-.7,2.25,.2,.92,'#b5d644'],[.7,2.25,.2,.92,'#88c534']])k.ball(g,xx,yy,zz,r,c);
  }
}

function planter(k, p, x, z, color = '#f2ae9c', size = 1) {
  k.cylinder(p, x, 0.25 * size, z, 0.38 * size, 0.28 * size, 0.5 * size, '#c8906c', 10);
  k.cylinder(p, x, 0.5 * size, z, 0.4 * size, 0.4 * size, 0.12 * size, '#e0af88', 10);
  for (let i = 0; i < 4; i++) {
    const a = i * 2.4, fx = x + Math.cos(a) * 0.2 * size, fz = z + Math.sin(a) * 0.2 * size;
    k.cylinder(p, fx, 0.68 * size, fz, 0.025 * size, 0.035 * size, 0.4 * size, '#648f5e', 5);
    for (let j = 0; j < 5; j++) k.ball(p, fx + Math.cos(j * 1.256) * 0.1 * size, (0.9 + i * 0.04) * size, fz + Math.sin(j * 1.256) * 0.1 * size, 0.1 * size, color, 1, 0.6, 1);
    k.ball(p, fx, (0.94 + i * 0.04) * size, fz, 0.065 * size, '#f5d572');
  }
}

function fence(k, p, x, z, length, rotation = 0) {
  const g = k.group(p, x, 0, z); g.rotation.y = rotation;
  k.box(g, 0, 0.65, 0, length, 0.13, 0.13, '#e4c99b'); k.box(g, 0, 0.3, 0, length, 0.13, 0.13, '#e4c99b');
  for (let i = -length / 2; i <= length / 2 + 0.01; i += 0.65) {
    k.cylinder(g, i, 0.48, 0, 0.08, 0.08, 0.95, '#f1d9b2', 6);
    k.ball(g, i, 0.98, 0, 0.1, '#f1d9b2');
  }
}

function bench(k, p, x, z, rotation = 0) {
  const g = k.group(p, x, 0, z); g.rotation.y = rotation;
  for (const lx of [-0.85, 0.85]) { k.box(g, lx, 0.3, 0, 0.13, 0.6, 0.75, '#819480'); k.box(g, lx, 0.85, -0.3, 0.13, 1, 0.13, '#819480'); }
  for (let i = 0; i < 3; i++) k.rounded(g, 0, 0.62, -0.22 + i * 0.24, 2.1, 0.14, 0.2, '#c79e6f', 0.04);
  for (let i = 0; i < 2; i++) k.rounded(g, 0, 0.98 + i * 0.25, -0.35, 2.1, 0.2, 0.13, '#d4ad7e', 0.04);
}

function iconModel(k, p, type, x, y, z, scale, animated) {
  const g = k.group(p, x, y, z); g.scale.setScalar(scale);
  const cream = '#eee8d8', teal = '#6baca6', dark = '#526a6c', orange = '#e89b66';
  if (type === 'radar') {
    k.cylinder(g, 0, 0.55, 0, 0.18, 0.28, 1.1, cream);
    const dish = k.group(g, 0, 1.15, 0);
    const bowl = k.mesh(dish, new k.THREE.SphereGeometry(0.9, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), cream);
    bowl.rotation.x = Math.PI * 0.7; bowl.scale.y = 0.5;
    k.cylinder(dish, 0, 0.18, 0.45, 0.045, 0.045, 1.05, teal, 7).rotation.x = 0.8;
    k.ball(dish, 0, 0.55, 0.8, 0.13, orange);
    animated.push({ mesh: dish, kind: 'rotate', speed: 0.4 });
  } else if (type === 'satellite') {
    const sat = k.group(g, 0, 1.15, 0); sat.rotation.z = -0.2;
    k.rounded(sat, 0, 0, 0, 0.8, 0.8, 0.8, '#e9c37d');
    for (const side of [-1, 1]) {
      k.box(sat, side * 1.15, 0, 0, 1.3, 0.075, 1.05, '#668ea1');
      for (let i = -1; i <= 1; i++) { k.box(sat, side * 1.15 + i * 0.35, 0.047, 0, 0.025, 0.015, 1, '#b7d8d6'); }
      k.box(sat, side * 1.15, 0.047, 0, 1.25, 0.015, 0.025, '#b7d8d6');
    }
    k.cylinder(sat, 0, 0.7, 0, 0.025, 0.035, 0.8, dark, 6); k.ball(sat, 0, 1.1, 0, 0.09, orange);
    animated.push({ mesh: sat, kind: 'bob', speed: 1, baseY: 1.15 });
  } else if (type === 'combat') {
    k.box(g, 0, 0.2, 0, 2.8, 0.4, 1.2, dark);
    for (let i = -1; i <= 1; i++) {
      k.rounded(g, i * 0.88, 0.9, -0.22, 0.78, 1, 0.16, cream, 0.06);
      k.box(g, i * 0.88, 0.92, -0.12, 0.64, 0.74, 0.03, '#89c9b4');
      for (let j = 0; j < 3; j++) k.box(g, i * 0.88 - 0.17 + j * 0.15, 0.86, -0.095, 0.06, 0.12 + j * 0.09, 0.025, '#def1c5');
    }
  } else if (type === 'engine') {
    const body = k.cylinder(g, 0, 0.85, 0, 0.8, 0.68, 1.7, '#bed1ce', 20); body.rotation.x = Math.PI / 2;
    const ring = k.mesh(g, new k.THREE.TorusGeometry(0.72, 0.1, 8, 20), cream, 0, 0.85, 0.9);
    const fan = k.group(g, 0, 0.85, 0.95);
    k.ball(fan, 0, 0, 0, 0.2, orange);
    for (let i = 0; i < 8; i++) { const blade = k.box(fan, Math.cos(i * Math.PI / 4) * 0.36, Math.sin(i * Math.PI / 4) * 0.36, 0, 0.45, 0.13, 0.06, dark); blade.rotation.z = i * Math.PI / 4 + 0.5; }
    // Engine rotates around local z via a y-oriented parent in the engine.
    ring.rotation.z = 0; k.box(g, -0.58, 0.2, 0, 0.22, 0.4, 1.5, dark); k.box(g, 0.58, 0.2, 0, 0.22, 0.4, 1.5, dark);
  } else if (type === 'launch') {
    k.cylinder(g, 0, 1.18, 0, 0.37, 0.37, 2, cream);
    k.cylinder(g, 0, 2.48, 0, 0, 0.38, 0.65, '#e69b73', 20);
    k.cylinder(g, 0, 0.18, 0, 0.3, 0.42, 0.35, dark);
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3, fin = k.box(g, Math.cos(a) * 0.45, 0.35, Math.sin(a) * 0.45, 0.25, 0.7, 0.55, orange); fin.rotation.y = -a; }
    k.ball(g, 0, 1.6, 0.37, 0.13, '#8cb8c8', 1, 1, 0.3);
    k.cylinder(g, 0, 0.02, 0, 1.1, 1.15, 0.15, '#c9d4c6', 20);
  } else if (type === 'ground') {
    for (const side of [-1, 1]) {
      k.rounded(g, side * 0.8, 0.3, 0, 0.45, 0.6, 2.4, dark, 0.15);
      for (let i = -1; i <= 1; i++) { const wheel = k.cylinder(g, side * 1.04, 0.3, i * 0.7, 0.23, 0.23, 0.04, '#a4af91', 12); wheel.rotation.z = Math.PI / 2; }
    }
    k.rounded(g, 0, 0.72, 0, 1.5, 0.65, 2.1, '#acb68e');
    k.rounded(g, 0, 1.28, -0.12, 1.16, 0.65, 1.2, '#d5d8ab');
    k.box(g, 0, 1.43, 0.5, 0.8, 0.3, 0.025, '#80aaaf');
    k.cylinder(g, -0.4, 1.95, -0.4, 0.02, 0.025, 1.1, dark, 5);
  } else if (type === 'lng' || type === 'naval') {
    if (type === 'lng') {
      k.ball(g, 0, 0.4, 0, 1, '#719fac', 0.74, 0.48, 1.7);
      k.box(g, 0, 0.6, 0, 1.35, 0.18, 2.75, cream);
      for (let i = -1; i <= 1; i++) k.ball(g, 0, 0.9, i * 0.67, 0.48, '#c9ddd1', 1, 0.8, 1);
      k.rounded(g, 0, 1, -1.1, 0.8, 0.75, 0.6, cream, 0.04);
      k.box(g, 0, 1.2, -0.785, 0.6, 0.2, 0.02, '#74acb6');
    } else {
      k.ball(g, 0, 0.63, 0, 1, '#7e9da0', 0.65, 0.58, 1.8);
      k.rounded(g, 0, 1.13, -0.28, 0.55, 0.7, 0.9, '#a5bab4', 0.12);
      k.cylinder(g, 0.1, 1.7, -0.3, 0.045, 0.045, 0.55, dark, 6);
      k.box(g, 0, 0.67, -1.4, 1.5, 0.1, 0.3, '#aac0b6');
    }
  } else if (type === 'offshore') {
    for (const x of [-0.8, 0.8]) for (const z of [-0.65, 0.65]) k.cylinder(g, x, 0.75, z, 0.12, 0.18, 1.5, '#b8afa0', 8);
    k.box(g, 0, 1.5, 0, 2.2, 0.3, 1.9, cream); k.box(g, -0.45, 1.95, -0.1, 0.85, 0.6, 0.8, teal);
    k.cylinder(g, 0.65, 2.45, -0.4, 0.08, 0.13, 1.7, orange, 8);
    const arm = k.box(g, 0.05, 3.25, -0.4, 2.1, 0.17, 0.17, orange); arm.rotation.z = -0.12;
    k.cylinder(g, -0.85, 2.75, -0.4, 0.025, 0.025, 0.9, dark, 5);
    k.ball(g, -0.85, 2.28, -0.4, 0.1, orange);
  }
  return g;
}

function cottage(k, parent, x, z, config, animated) {
  const g = k.group(parent, x, 0, z), roofColor = config.roof;
  k.rounded(g, 0, 0.12, 0, 7.3, 0.25, 5.4, '#d1be99');
  k.rounded(g, 0, 1.82, 0, 7, 3.35, 5, '#fff0d2', 0.16);
  // Timber columns, a thick gabled roof, and a rounded dormer create an actual cottage silhouette.
  for (const cx of [-3.3, 3.3]) k.rounded(g, cx, 1.78, 2.48, 0.23, 3.4, 0.2, '#cfa378', 0.05);
  k.box(g, 0, 0.44, 2.52, 6.7, 0.2, 0.12, '#d9bd91');
  const roofShape = new k.THREE.Shape(); roofShape.moveTo(-4, 3.4); roofShape.lineTo(0, 5.15); roofShape.lineTo(4, 3.4); roofShape.closePath();
  const roofGeo = new k.THREE.ExtrudeGeometry(roofShape, { depth: 6.3, bevelEnabled: true, bevelSegments: 2, bevelThickness: 0.11, bevelSize: 0.11, steps: 1 });
  roofGeo.translate(0, 0, -3.15); k.mesh(g, roofGeo, roofColor);
  // Distinct roof courses catch the light without a texture atlas.
  for (let i = 0; i < 5; i++) {
    const fraction = (i + 0.45) / 5;
    for (const side of [-1, 1]) {
      const course = k.rounded(g, side * fraction * 4, 5.2 - fraction * 1.75, 0, 0.19, 0.12, 6.5, roofColor, 0.03); course.rotation.z = -side * 0.412;
    }
  }
  const ridge = k.cylinder(g, 0, 5.21, 0, 0.16, 0.16, 6.65, '#ead0ab', 10); ridge.rotation.x = Math.PI / 2;
  k.rounded(g, 0, 1.27, 2.58, 1.5, 2.3, 0.18, '#9e7954', 0.12);
  k.rounded(g, 0, 1.29, 2.69, 1.18, 2.06, 0.025, '#4b6258', 0.05);
  const doorPivot=k.group(g,-.575,0,2.76);doorPivot.userData.dynamic=true;
  k.rounded(doorPivot,.575,1.29,0,1.15,2.04,.08,config.color,.1);
  k.rounded(doorPivot,.575,1.85,.06,.72,.62,.045,'#c4e0d6',.05);
  k.box(doorPivot,.575,1.85,.1,.05,.6,.035,'#fff3d7');k.box(doorPivot,.575,1.85,.1,.7,.05,.035,'#fff3d7');
  k.ball(doorPivot,.965,1.14,.12,.07,'#f6d889');
  g.userData.doorPivot=doorPivot;
  k.rounded(g, 0, 0.11, 3, 2, 0.18, 0.9, '#d4b990');
  for (const wx of [-2.08, 2.08]) {
    k.rounded(g, wx, 1.96, 2.57, 1.35, 1.47, 0.2, '#d6b589', 0.1);
    k.rounded(g, wx, 1.96, 2.7, 1.13, 1.22, 0.07, '#a7d0d3', 0.08);
    k.box(g, wx, 1.96, 2.76, 1.1, 0.075, 0.06, '#fff3d7'); k.box(g, wx, 1.96, 2.76, 0.075, 1.2, 0.06, '#fff3d7');
    k.rounded(g, wx, 1.15, 2.75, 1.6, 0.23, 0.45, '#bf9470', 0.04);
    for (let f = -1; f <= 1; f++) { k.ball(g, wx + f * 0.39, 1.4, 2.88, 0.2, '#7aaf72', 1, 0.7, 0.7); k.ball(g, wx + f * 0.39, 1.54, 2.98, 0.1, f % 2 ? '#f0b3a5' : '#f3d48f'); }
  }
  // Side windows are visible from the game's oblique camera.
  for (const sx of [-1, 1]) {
    k.rounded(g, sx * 3.54, 2, 0, 0.14, 1.3, 1.1, '#b5d5d1', 0.04);
    k.box(g, sx * 3.63, 2, 0, 0.06, 1.35, 0.06, '#fff3d7');
  }
  const awning = k.rounded(g, 0, 2.66, 2.95, 2.2, 0.18, 1.1, config.color, 0.06); awning.rotation.x = 0.12;
  for (const ax of [-0.96, 0.96]) k.cylinder(g, ax, 1.4, 3.32, 0.045, 0.045, 2.6, '#cba475', 6);
  k.board(g, config.name, '문까지 걸어가면 들어갈 수 있어요', 0, 3.43, 3.34, 4.5);
  // Roof-mounted exhibit is visible in the village and changes with every house.
  iconModel(k, g, config.icon, 0, 5.3, -0.35, 0.65, animated);
  planter(k, g, -3.8, 2.4, '#f0b2a3', 0.9); planter(k, g, 3.8, 2.4, '#f2d177', 0.9);
  return g;
}

function outdoorDecoration(k, group, colliders, animated, companyId) {
  const trees = [[-29,-24,1.2],[-23,-25,.95],[-12,-25,1.15],[14,-25,.9],[29,-22,1.2],[-30,-5,1],[-29,20,1.15],[-20,23,1],[-9,23,1.2],[18,23,1],[29,15,1.15],[30,6,.9],[-9,15,.85],[14,-10,1.05],[-13,4,.9]];
  const leafTexture=typeof Image==='undefined'?null:new k.THREE.TextureLoader().load('/textures/tree.png');
  if(leafTexture)leafTexture.colorSpace=k.THREE.SRGBColorSpace;
  trees.forEach(([x,z,s]) => { tree(k, group, x,z,s,leafTexture); colliders.push({minX:x-.4,maxX:x+.4,minZ:z-.4,maxZ:z+.4}); });
  fence(k, group, -13, -13, 9); fence(k, group, 10, -15, 8);
  fence(k, group, -18, 5, 7, Math.PI / 2); fence(k, group, 17, 9, 8, Math.PI / 2);
  colliders.push({minX:-17.55,maxX:-17.25,minZ:1.3,maxZ:8.8});
  colliders.push({minX:16.8,maxX:17.2,minZ:4.8,maxZ:13.2});
  bench(k, group, -8, 4, -0.2); bench(k, group, 2.7, -6, 0.2);
  colliders.push({minX:-9.1,maxX:-6.9,minZ:3.6,maxZ:4.5});
  // A small round fountain at the quiet edge of the main plaza.
  k.cylinder(group, -4, 0.17, -0.7, 1.5, 1.6, 0.35, '#d9cbb1', 24);
  k.cylinder(group, -4, 0.37, -0.7, 1.35, 1.35, 0.12, '#a6d7ce', 24);
  k.cylinder(group, -4, 0.77, -0.7, 0.22, 0.4, 0.8, '#e8dbc2', 12);
  k.cylinder(group, -4, 1.15, -0.7, 0.62, 0.25, 0.2, '#e8dbc2', 18);
  k.ball(group, -4, 1.45, -0.7, 0.2, '#a6d7ce', 0.7, 1.3, 0.7);
  colliders.push({minX:-5.5,maxX:-2.5,minZ:-2.2,maxZ:0.8});
  const petals = ['#fff1bd','#efb0a9','#e0c6e8','#fff5dd'];
  // Instanced flowers and lawn blades avoid hundreds of individual draw calls.
  const stemMat = k.mat('#77a66a'), petalGeo = new k.THREE.SphereGeometry(0.1, 5, 4), stemGeo = new k.THREE.CylinderGeometry(0.018, 0.018, 0.22, 4);
  const flowerCount = 110, stems = new k.THREE.InstancedMesh(stemGeo, stemMat, flowerCount), dummy = new k.THREE.Object3D();
  const blooms = new k.THREE.InstancedMesh(petalGeo, k.mat('#fff1bd'), flowerCount); blooms.instanceColor = null;
  for (let i = 0; i < flowerCount; i++) {
    const t = i * 2.39996, edge = 0.8 + (i % 5) * 0.04;
    const x = Math.cos(t) * 30 * edge, z = Math.sin(t) * 25 * edge;
    dummy.position.set(x, 0.14, z); dummy.scale.set(1,1,1); dummy.rotation.set(0,0,0); dummy.updateMatrix(); stems.setMatrixAt(i,dummy.matrix);
    dummy.position.y = 0.29; dummy.scale.set(1.4,0.55,1.4); dummy.updateMatrix(); blooms.setMatrixAt(i,dummy.matrix); blooms.setColorAt(i,new k.THREE.Color(petals[i%petals.length]));
  }
  group.add(stems,blooms);
  const grass = new k.THREE.InstancedMesh(new k.THREE.ConeGeometry(0.09,0.25,3),k.mat('#8bbd74'),140);
  for (let i=0;i<140;i++) { const a=i*2.39996,r=15+((i*17)%140)/10; dummy.position.set(Math.cos(a)*r,0.13,Math.sin(a)*r*.83);dummy.scale.set(1,1,1);dummy.rotation.set(0,a,0);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix); }
  group.add(grass);
  // Pebbles, mushrooms and a little mailbox give the space a lived-in character.
  for (let i = 0; i < 13; i++) { const a=i*2.4,x=Math.cos(a)*32,z=Math.sin(a)*27; k.ball(group,x,0.15,z,0.35,'#cad0b4',1.3,0.55,1); }
  for (let i = 0; i < 4; i++) {
    const x=-15+i*.45,z=10+(i%2)*.5;k.cylinder(group,x,.15,z,.04,.07,.3,'#f4e4bc',6);k.ball(group,x,.31,z,.2,'#dba28a',1,.5,1);
  }
  k.cylinder(group, -1.9, 0.7, 12.4, 0.06, 0.06, 1.4, '#a57d58', 6);
  k.rounded(group, -1.9, 1.35, 12.4, .65, .52, .55, COMPANY[companyId].color, .1);
  k.box(group,-1.9,1.34,12.7,.35,.04,.03,'#f9edcf');
}

export function buildExterior(THREE, companyId = 'hub') {
  const company = COMPANY[companyId] || COMPANY.hub, id = COMPANY[companyId] ? companyId : 'hub';
  const k = kit(THREE), group = new THREE.Group(), colliders = [], triggers = [], interactables = [], animated = [], doors = [];
  // Stepped invisible shoreline blockers approximate the rounded island corners
  // while retaining the simple shared rectangle collision/navigation contract.
  for(const sx of[-1,1])for(const sz of[-1,1]){
    const corner=(x0,x1,z0,z1)=>colliders.push({minX:sx<0?-x1:x0,maxX:sx<0?-x0:x1,minZ:sz<0?-z1:z0,maxZ:sz<0?-z0:z1});
    corner(30.5,33,22.4,28);corner(28.5,30.5,24.8,28);corner(27,28.5,25.8,28);
  }
  // The supplied sea and meadow images become materials on real 3D surfaces.
  // In Node's geometry tests there is no Image object, so flat colors remain.
  const texture=(url,repeatX,repeatY)=>{
    if(typeof Image==='undefined')return null;
    const map=new THREE.TextureLoader().load(url);
    map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(repeatX,repeatY);
    map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;
  };
  const seaMap=texture('/textures/sea.png',8,7),grassMap=texture('/textures/grass.png',7,6);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(180,150,48,40),new THREE.MeshStandardMaterial({color:seaMap?'#ffffff':'#178fc5',map:seaMap,roughness:.48,metalness:.03,side:THREE.DoubleSide}));
  sea.position.y=-.4;sea.rotation.x=-Math.PI/2;sea.receiveShadow=true;group.add(sea);
  animated.push({mesh:sea,kind:'water'});
  const sand = k.mesh(group,new THREE.ExtrudeGeometry(k.roundShape(72,62,13),{depth:.42,bevelEnabled:true,bevelSize:.7,bevelThickness:.25,bevelSegments:3,steps:1,curveSegments:12}),'#e9d9aa',0,-.78,0); sand.rotation.x=-Math.PI/2;
  const lawnGeometry=new THREE.ExtrudeGeometry(k.roundShape(68,58,11),{depth:.16,bevelEnabled:true,bevelSize:.18,bevelThickness:.12,bevelSegments:3,steps:1,curveSegments:12});
  const lawnPositions=lawnGeometry.getAttribute('position'),lawnUV=lawnGeometry.getAttribute('uv');
  for(let i=0;i<lawnUV.count;i++)lawnUV.setXY(i,lawnPositions.getX(i)/68+.5,lawnPositions.getY(i)/58+.5);
  lawnUV.needsUpdate=true;
  const lawn=new THREE.Mesh(lawnGeometry,new THREE.MeshStandardMaterial({color:grassMap?'#ffffff':'#a6cd86',map:grassMap,roughness:1}));
  lawn.position.y=-.3;lawn.rotation.x=-Math.PI/2;lawn.castShadow=false;lawn.receiveShadow=true;group.add(lawn);
  // The extrusion and bevel end at y=-.02, immediately below the player's feet.
  path(k,group,0,24,0,3,3);
  if(id==='hub') {
    for(const home of HOUSES)path(k,group,0,home.z+9,home.x,home.z+3.7,2.35);
    path(k,group,0,4,-22,11.7,2.2);path(k,group,0,4,26,-2.3,2.2);
  } else {
    path(k,group,0,4,-11,-2.4,2.6);path(k,group,0,3,10,-4.4,2.6);path(k,group,0,8,9,11.6,2.6);
  }
  k.cylinder(group,0,.025,3,3.1,3.1,.045,'#e4d0a0',32);
  const facilities = id === 'hub' ? HOUSES : Object.keys(FACILITY).filter(f=>FACILITY[f].company===id).map((facilityId,index)=>({id:facilityId,x:LEGACY_HOUSES[index][0],z:LEGACY_HOUSES[index][1]}));
  facilities.forEach(home => {
    const {id:facilityId,x,z}=home;
    const homeCompany=COMPANY[home.companyId]||company;
    const info=id==='hub'?{...home,color:homeCompany.color,roof:homeCompany.roof}:{...FACILITY[facilityId],color:company.color,roof:company.roof};
    const house = cottage(k,group,x,z,info,animated);
    doors.push({id:facilityId,pivot:house.userData.doorPivot});
    delete house.userData.doorPivot;
    house.userData.facilityId=facilityId;
    colliders.push({minX:x-3.6,maxX:x+3.6,minZ:z-2.6,maxZ:z+2.6});
    triggers.push({id:facilityId,type:'enter',x,z:z+3.55,radius:1,label:id==='hub'?`${home.name} · 문으로 걸어가 입장`:undefined});
  });
  if(id==='hub') {
    // Oversized landmarks read clearly from the path: radar, rocket and ship.
    iconModel(k,group,'radar',-30,.1,-10,1.55,animated);
    colliders.push({minX:-31.3,maxX:-28.7,minZ:-11.4,maxZ:-8.6});
    iconModel(k,group,'launch',10,.1,-23,2,animated);
    colliders.push({minX:8.8,maxX:11.2,minZ:-24.2,maxZ:-21.8});
    const inletShape=k.roundShape(11,20,4);
    const inletSand=new THREE.Mesh(new THREE.ShapeGeometry(k.roundShape(12,21,4.5)),k.mat('#f0dbac'));
    inletSand.rotation.x=-Math.PI/2;inletSand.position.set(35.5,.015,-9);inletSand.receiveShadow=true;group.add(inletSand);
    const inletMap=texture('/textures/sea.png',1.2,2.1);
    const inlet=new THREE.Mesh(new THREE.ShapeGeometry(inletShape),new THREE.MeshStandardMaterial({color:inletMap?'#ffffff':'#178fc5',map:inletMap,roughness:.46,side:THREE.DoubleSide}));
    inlet.rotation.x=-Math.PI/2;inlet.position.set(35.5,.04,-9);inlet.receiveShadow=true;group.add(inlet);
    const pier=k.group(group,30,0,-6);
    for(const px of[0,1.6,3.2,4.8]) {k.box(pier,px,.02,0,1.55,.18,2.1,'#cda675');for(const pz of[-.85,.85])k.cylinder(pier,px,.1,pz,.1,.1,.45,'#9a7951',8);}
    const ship=iconModel(k,group,'lng',33.4,.07,-10,2.4,animated);
    ship.rotation.y=.12;
    for(const zz of[-4,4]) {const wake=k.mesh(group,new THREE.TorusGeometry(1.7,.035,4,32,Math.PI),'#e5f6eb',34,.055,-10+zz);wake.rotation.x=-Math.PI/2;}
    k.board(group,'바다에 떠 있는 배','한화오션의 해양 기술을 만나보세요',31.5,1.45,-4.6,4.4);
  }
  outdoorDecoration(k,group,colliders,animated,id);
  // Keep the player-facing camera clear of a tall foreground arch.
  if(id!=='hub'){
    for (const x of [-2.6,2.6]) {k.cylinder(group,x,1.65,24,.14,.18,3.3,'#d1ad79',8);k.ball(group,x,3.35,24,.3,'#f2d8a0');}
    k.rounded(group,0,3.1,24,5.6,.55,.4,company.color,.12);
    k.board(group,'중앙 마을로 돌아가기','이 관문 아래로 걸어가세요',0,3.12,24.3,5);
    triggers.push({id:'hub',type:'company',x:0,z:24,radius:1});
  } else k.board(group,'어서 와요, 기술의 섬','섬의 다섯 집을 찾아 걸어가 보세요',-6,1.5,24,4.8);
  planter(k,group,-8,24,'#eab2b2');planter(k,group,8,24,'#f2d177');
  k.board(group,company.name,company.subtitle,0,1.5,-25,5.6);
  for(const x of[-2.1,2.1])k.cylinder(group,x,.6,-25.1,.07,.07,1.2,'#bc966b',6);
  // A few simple ripples around the shore.
  for(let i=0;i<6;i++){const ripple=k.mesh(group,new THREE.TorusGeometry(1.4+i*.15,.025,3,26,Math.PI*.85),'#c3e9e6',-26+i*10,-.35,23+(i%2));ripple.rotation.x=-Math.PI/2;ripple.rotation.z=i;}
  batchStatic(THREE,group,animated);
  return {group,colliders,triggers,interactables,doors,spawn:{x:0,z:20},bounds:{minX:-32,maxX:32,minZ:-27,maxZ:27},animated,label:company.name};
}

function guide(k,p,x,z,color,name='안내원') {
  const g=k.group(p,x,0,z);
  g.name=`Resident mesh: ${name}`;g.userData.dynamic=true;
  // Residents are actual shaded 3D meshes, with geometry on every side.
  k.ball(g,0,.75,0,.42,color,.8,1.15,.8);
  k.ball(g,0,1.43,.03,.53,'#d7b58b',1,.94,.94);
  for(const side of[-1,1]){k.ball(g,side*.37,1.83,.01,.2,'#d7b58b');k.ball(g,side*.37,1.83,.1,.11,'#efc9ac',1,1,.6);k.ball(g,side*.17,1.48,.48,.045,'#4e5548',1,1.3,.6);k.ball(g,side*.3,1.3,.43,.075,'#e9b4a2',1,.6,.3);}
  k.ball(g,0,1.34,.51,.15,'#f5e8cd',1,.8,.45);k.ball(g,0,1.39,.59,.045,'#675b4f',1,.6,.5);
  k.rounded(g,0,.8,.29,.5,.55,.1,'#f6e6c7',.05);k.box(g,0,.67,.36,.26,.16,.04,color);
  for(const side of[-1,1]) {k.ball(g,side*.38,.8,.07,.15,'#d7b58b',.8,1.4,.8);k.ball(g,side*.2,.2,.11,.18,'#7d6b51',1,.6,1.3);}
}

function batchStatic(THREE, group, animated) {
  // Collapse the many hand-built pieces into a few material batches. Animated
  // exhibits and textured signboards retain their independent transforms.
  group.updateMatrixWorld(true);
  const moving = new Set(animated.map(a => a.mesh)), buckets = new Map();
  group.traverse(node => {
    if (!node.isMesh || node.isInstancedMesh || Array.isArray(node.material) || node.material.map) return;
    let ancestor = node;
    while (ancestor && ancestor !== group) { if (moving.has(ancestor)||ancestor.userData.dynamic) return; ancestor = ancestor.parent; }
    let pointer = node;
    while(pointer && pointer !== group){
      const data=pointer.userData;
      if(data.facilityId||data.interactId||data.triggerId){Object.assign(node.userData,data);break;}
      pointer=pointer.parent;
    }
    const interaction=node.userData.facilityId||node.userData.interactId||node.userData.triggerId||'';
    const key = `${node.material.uuid}-${node.castShadow}-${node.receiveShadow}-${interaction}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(node);
  });
  for (const list of buckets.values()) {
    if (list.length < 2) continue;
    let vertices = 0;
    const geometries = list.map(node => {
      const geometry = node.geometry.index ? node.geometry.toNonIndexed() : node.geometry.clone();
      geometry.applyMatrix4(node.matrixWorld); vertices += geometry.attributes.position.count; return geometry;
    });
    const geometry = new THREE.BufferGeometry();
    for (const [name, size] of [['position',3],['normal',3],['uv',2]]) {
      const array = new Float32Array(vertices * size); let offset = 0;
      for (const source of geometries) {
        const attribute = source.getAttribute(name);
        if (attribute) array.set(attribute.array, offset);
        offset += source.attributes.position.count * size;
      }
      geometry.setAttribute(name,new THREE.BufferAttribute(array,size));
    }
    geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry,list[0].material);
    Object.assign(mesh.userData,list[0].userData);
    mesh.castShadow=list[0].castShadow;mesh.receiveShadow=list[0].receiveShadow;
    for(const node of list){node.parent.remove(node);node.geometry.dispose();}
    for(const source of geometries)source.dispose();
    group.add(mesh);
  }
}

export function buildInterior(THREE, facilityId = 'radar') {
  const home=houseById(facilityId);
  const primary=FACILITY[facilityId]||FACILITY.radar;
  const info=home?{...primary,name:home.name,text:home.subtitle}:primary;
  const company=COMPANY[primary.company],k=kit(THREE),group=new THREE.Group(),animated=[],colliders=[];
  // Cutaway room: no front wall, so the camera can always see the player.
  k.rounded(group,0,-.17,.5,14.8,.32,11.8,'#ba9874',.12);
  k.box(group,0,-.015,.5,14,.04,11,'#dfc69e');
  for(let i=-6;i<=6;i++) k.box(group,i,.012,.5,.025,.012,11,'#cdb48d');
  for(let row=0;row<5;row++) for(let col=-3;col<=3;col++) k.box(group,col*2+(row%2),.015,-4.5+row*2.2,1.97,.012,.025,'#cdb48d');
  k.rounded(group,0,1.8,-5.2,14.7,3.8,.35,'#f2e7cd',.1);
  k.box(group,0,.4,-4.98,14.5,.8,.08,company.color);
  for(const side of[-1,1]) {
    k.rounded(group,side*7.2,1.8,.3,.3,3.8,11.2,'#f4ead4',.08);
    k.box(group,side*7.01,.4,.3,.08,.8,11.2,company.color);
    k.box(group,side*7.0,3.62,.3,.12,.18,11.3,'#d5b58b');
  }
  k.box(group,0,3.62,-4.96,14.4,.18,.12,'#d5b58b');
  k.board(group,info.name,info.text,0,2.75,-4.9,5.6);
  // Windows and soft curtains on the back wall.
  for(const wx of[-4.8,4.8]) {
    k.rounded(group,wx,2.15,-4.94,2.2,2.05,.15,'#d0b08a',.1);
    k.rounded(group,wx,2.15,-4.82,1.95,1.8,.05,'#b9dbdf',.08);
    k.box(group,wx,2.15,-4.76,.08,1.85,.05,'#fff8e5');k.box(group,wx,2.15,-4.76,2,.08,.05,'#fff8e5');
    for(const side of[-1,1])k.rounded(group,wx+side*.89,2.2,-4.65,.25,1.95,.1,'#e5c89d',.07);
  }
  // Large oval rug and a central museum pedestal.
  const rug=k.cylinder(group,0,.04,-.1,3.4,3.4,.045,'#c4d2b1',40);rug.scale.z=.86;
  const border=k.mesh(group,new THREE.TorusGeometry(3.15,.035,5,48),'#f6e8c7',0,.07,-.1);border.rotation.x=-Math.PI/2;border.scale.y=.86;
  k.cylinder(group,0,.48,-1.7,1.65,1.65,.85,'#f0e3c7',24);
  k.cylinder(group,0,.93,-1.7,1.75,1.75,.15,'#c3a47b',24);
  iconModel(k,group,info.icon,0,1.02,-1.7,.85,animated);
  k.board(group,'E  전시물 살펴보기','가까이 걸어와 이야기를 들어보세요',0,1.05,.04,3.7);
  colliders.push({minX:-1.65,maxX:1.65,minZ:-3.35,maxZ:-.05});
  // The workstation, bookcase and small thematic models make each house a real room.
  k.rounded(group,-4.9,.85,-1.4,2.4,.18,1.35,'#bd986c',.06);
  for(const dx of[-.95,.95])for(const dz of[-.45,.45])k.box(group,-4.9+dx,.4,-1.4+dz,.12,.8,.12,'#a88965');
  k.rounded(group,-4.9,1.35,-1.6,1.1,.85,.12,'#567c76',.06);k.box(group,-4.9,1.35,-1.52,.92,.67,.025,'#b8d9c5');
  k.rounded(group,-4.9,1,-.95,.85,.06,.35,'#eee1c8',.03);
  k.cylinder(group,-5.65,1.1,-1.2,.12,.13,.25,'#e7c28b',12);
  colliders.push({minX:-6.2,maxX:-3.6,minZ:-2.2,maxZ:-.55});
  k.rounded(group,5.1,1.1,-2.9,2.45,2.2,.7,'#c6a16f',.07);
  for(const y of[.4,1.1,1.8]) {
    k.box(group,5.1,y,-2.48,2.2,.1,.55,'#e2c393');
    for(let b=0;b<6;b++) {const m=k.box(group,4.2+b*.32,y+.24,-2.56,.18,.4+(b%2)*.1,.3,['#98b69f','#d8a98c','#c9be91','#91b4be'][b%4]);m.rotation.z=b===5?.12:0;}
  }
  colliders.push({minX:3.85,maxX:6.35,minZ:-3.35,maxZ:-2.4});
  // A second and third exhibit let all nine subjects live in five homes.
  k.cylinder(group,4.6,.37,1.1,1,1,.7,'#e6cfaa',18);
  const second=home?.topics[1];
  iconModel(k,group,second||info.icon,4.6,.75,1.1,.48,animated);
  if(second)k.board(group,FACILITY[second].name,'E  가까이에서 살펴보기',4.5,2.2,1.1,2.8);
  colliders.push({minX:3.6,maxX:5.6,minZ:.1,maxZ:2.1});
  const third=home?.topics[2];
  if(third){iconModel(k,group,third,-4.9,1.05,-1.5,.38,animated);k.board(group,FACILITY[third].name,'E  가까이에서 살펴보기',-5,2.18,-1.5,2.8);}
  guide(k,group,-3,1.8,home?.residentColor||company.color,home?.resident);colliders.push({minX:-3.35,maxX:-2.65,minZ:1.45,maxZ:2.15});
  k.board(group,home?`주민 ${home.resident}`:'안녕! 전시물에 다가가 봐요',home?'E 키로 주민과 이야기해요':'E 키로 기술 이야기를 열어요',-3,2.55,1.8,3.2);
  planter(k,group,-6.15,-3.9,'#e4ae9f',1.6);planter(k,group,6.1,4.35,'#f2d58f',1.5);
  bench(k,group,-5.5,3.9,Math.PI/2);colliders.push({minX:-5.95,maxX:-5.05,minZ:2.8,maxZ:5});
  k.board(group,'출처와 기술 도감','전시물을 열면 공식 자료를 확인해요',5.2,2.8,3.4,3.1);
  for(const sx of[4.3,6.1])k.cylinder(group,sx,1.1,3.45,.05,.05,2.2,'#c3a17b',6);
  // Exterior doorway is intentionally open; approaching this threshold returns outside.
  k.rounded(group,0,.035,5.35,2.5,.05,1.25,'#d6ad7b',.05);
  k.board(group,'밖으로 나가기 ↓','문 앞까지 걸어가세요',0,.17,6.1,2.8).rotation.x=-Math.PI/3;
  const triggers=[{id:facilityId,type:'exit',x:0,z:5.5,radius:1}];
  const interactables=[{id:facilityId,x:0,z:-1.7,radius:2.4,label:`E  ${primary.name} 살펴보기`}];
  if(second)interactables.push({id:second,x:4.6,z:1.1,radius:2.2,label:`E  ${FACILITY[second].name} 살펴보기`});
  if(third)interactables.push({id:third,x:-4.9,z:-1.4,radius:2.2,label:`E  ${FACILITY[third].name} 살펴보기`});
  interactables.push({id:facilityId,type:'resident',x:-3,z:1.8,radius:1.55,label:`E  주민 ${home?.resident||'안내원'}과 이야기하기`});
  batchStatic(THREE,group,animated);
  return {group,colliders,triggers,interactables,spawn:{x:0,z:3.8},bounds:{minX:-7,maxX:7,minZ:-5,maxZ:6},animated,label:info.name};
}

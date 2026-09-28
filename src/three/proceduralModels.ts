import * as THREE from 'three';
import { ModelType } from '../types';

/**
 * Procedural 3D Food Models and Objects built with Three.js primitives.
 * Provides lightweight, zero-download, vibrant 3D assets that run fast on any device.
 */

// Helper to create materials with rich PBR properties
const createMat = (color: number | string, roughness = 0.4, metalness = 0.1, extra?: Partial<THREE.MeshStandardMaterialParameters>) => {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    ...extra,
  });
};

/**
 * 1. DELUXE 3D BURGER
 */
export function createBurgerGroup(): THREE.Group {
  const burger = new THREE.Group();

  // Bottom bun
  const bottomBunGeo = new THREE.CylinderGeometry(1.3, 1.25, 0.4, 32);
  const bunMat = createMat(0xd48b38, 0.6, 0.05);
  const bottomBun = new THREE.Mesh(bottomBunGeo, bunMat);
  bottomBun.position.y = -0.6;
  bottomBun.castShadow = true;
  bottomBun.receiveShadow = true;
  burger.add(bottomBun);

  // Patty (grilled burger meat)
  const pattyGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.35, 32);
  const pattyMat = createMat(0x4a2311, 0.8, 0.1);
  const patty = new THREE.Mesh(pattyGeo, pattyMat);
  patty.position.y = -0.25;
  patty.castShadow = true;
  burger.add(patty);

  // Cheese slice (square melted over edges)
  const cheeseGeo = new THREE.BoxGeometry(2.1, 0.06, 2.1);
  const cheeseMat = createMat(0xffc107, 0.3, 0.2);
  const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
  cheese.position.y = -0.05;
  cheese.rotation.y = Math.PI / 4;
  burger.add(cheese);

  // Tomato slices
  const tomatoMat = createMat(0xe53935, 0.3, 0.1);
  for (let i = 0; i < 2; i++) {
    const tomatoGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 24);
    const tomato = new THREE.Mesh(tomatoGeo, tomatoMat);
    tomato.position.set(i === 0 ? -0.4 : 0.4, 0.05, i === 0 ? 0.2 : -0.2);
    tomato.rotation.z = (i === 0 ? -0.05 : 0.05);
    burger.add(tomato);
  }

  // Lettuce (ruffled disc)
  const lettuceGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.08, 16);
  const lettuceMat = createMat(0x43a047, 0.5, 0.05);
  const lettuce = new THREE.Mesh(lettuceGeo, lettuceMat);
  lettuce.position.y = 0.16;
  burger.add(lettuce);

  // Top bun (dome)
  const topBunGeo = new THREE.SphereGeometry(1.35, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const topBun = new THREE.Mesh(topBunGeo, bunMat);
  topBun.position.y = 0.2;
  topBun.scale.set(1, 0.7, 1);
  topBun.castShadow = true;
  burger.add(topBun);

  // Sesame seeds on top bun
  const seedGeo = new THREE.ConeGeometry(0.04, 0.08, 6);
  const seedMat = createMat(0xfff8e7, 0.6, 0.1);
  for (let i = 0; i < 28; i++) {
    const seed = new THREE.Mesh(seedGeo, seedMat);
    const theta = Math.random() * Math.PI * 2;
    const radius = 0.3 + Math.random() * 0.8;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const y = 0.2 + Math.sqrt(Math.max(0, 1.35 * 1.35 - radius * radius)) * 0.7;
    seed.position.set(x, y + 0.02, z);
    seed.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    seed.rotation.z = Math.random() * Math.PI;
    burger.add(seed);
  }

  burger.scale.set(1.2, 1.2, 1.2);
  return burger;
}

/**
 * 2. PIZZA SLICE
 */
export function createPizzaSliceGroup(): THREE.Group {
  const pizza = new THREE.Group();

  // Wedge shape using ExtrudeGeometry
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  const angle = Math.PI / 3.5; // ~51 degrees slice
  const radius = 2.4;
  shape.lineTo(Math.cos(-angle / 2) * radius, Math.sin(-angle / 2) * radius);
  shape.absarc(0, 0, radius, -angle / 2, angle / 2, false);
  shape.lineTo(0, 0);

  const extrudeSettings = {
    steps: 1,
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3,
  };

  const sliceGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const cheeseMat = createMat(0xffb74d, 0.4, 0.1);
  const slice = new THREE.Mesh(sliceGeo, cheeseMat);
  slice.rotation.x = -Math.PI / 2;
  slice.position.y = -0.1;
  pizza.add(slice);

  // Outer baked crust rim
  const crustGeo = new THREE.TorusGeometry(2.38, 0.18, 12, 24, angle);
  const crustMat = createMat(0xc47a2b, 0.7, 0.05);
  const crust = new THREE.Mesh(crustGeo, crustMat);
  crust.rotation.x = -Math.PI / 2;
  crust.rotation.z = -angle / 2;
  crust.position.y = 0.04;
  pizza.add(crust);

  // Pepperoni toppings
  const pepGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16);
  const pepMat = createMat(0xb71c1c, 0.5, 0.1);
  const pepPositions = [
    [1.1, 0.08, 0.1],
    [1.6, 0.08, -0.3],
    [1.7, 0.08, 0.35],
    [0.7, 0.08, -0.05],
    [2.0, 0.08, 0.0],
  ];

  pepPositions.forEach(([x, y, z]) => {
    const pep = new THREE.Mesh(pepGeo, pepMat);
    pep.position.set(x, y, z);
    pep.rotation.y = Math.random() * 0.2;
    pizza.add(pep);
  });

  // Green bell pepper chunks
  const pepperGeo = new THREE.BoxGeometry(0.12, 0.03, 0.3);
  const pepperMat = createMat(0x2e7d32, 0.4, 0.1);
  const pepperPositions = [
    [1.3, 0.09, -0.15, 0.5],
    [0.9, 0.09, 0.2, -0.4],
    [1.8, 0.09, -0.1, 1.2],
  ];

  pepperPositions.forEach(([x, y, z, rot]) => {
    const pepper = new THREE.Mesh(pepperGeo, pepperMat);
    pepper.position.set(x, y, z);
    pepper.rotation.y = rot;
    pizza.add(pepper);
  });

  // Center pivot
  pizza.position.set(-1.0, 0, 0);
  const wrapper = new THREE.Group();
  wrapper.add(pizza);
  return wrapper;
}

/**
 * 3. GLAZED DONUT WITH SPRINKLES
 */
export function createDonutGroup(): THREE.Group {
  const donut = new THREE.Group();

  // Dough base
  const doughGeo = new THREE.TorusGeometry(1.2, 0.6, 24, 48);
  const doughMat = createMat(0xe0a96d, 0.7, 0.05);
  const dough = new THREE.Mesh(doughGeo, doughMat);
  dough.rotation.x = Math.PI / 2;
  donut.add(dough);

  // Strawberry frosting (slightly larger top torus)
  const frostingGeo = new THREE.TorusGeometry(1.2, 0.61, 24, 48, Math.PI * 2);
  const frostingMat = createMat(0xff4081, 0.25, 0.15); // Glossy strawberry pink
  const frosting = new THREE.Mesh(frostingGeo, frostingMat);
  frosting.rotation.x = Math.PI / 2;
  frosting.position.y = 0.05;
  frosting.scale.set(1.01, 1.01, 0.7);
  donut.add(frosting);

  // Colorful sprinkles
  const sprinkleColors = [0xffeb3b, 0x00e676, 0x29b6f6, 0xffffff, 0xab47bc];
  const sprinkleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8);

  for (let i = 0; i < 45; i++) {
    const col = sprinkleColors[i % sprinkleColors.length];
    const spMat = createMat(col, 0.3, 0.1);
    const sprinkle = new THREE.Mesh(sprinkleGeo, spMat);

    const angle = Math.random() * Math.PI * 2;
    const r = 1.0 + (Math.random() - 0.5) * 0.6;
    sprinkle.position.set(Math.cos(angle) * r, 0.58 + (Math.random() - 0.5) * 0.1, Math.sin(angle) * r);
    sprinkle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    donut.add(sprinkle);
  }

  return donut;
}

/**
 * 4. NOODLE / RAMEN BOWL
 */
export function createNoodlesGroup(): THREE.Group {
  const ramen = new THREE.Group();

  // Ceramic Bowl
  const bowlGeo = new THREE.CylinderGeometry(1.4, 0.8, 1.1, 32, 1, true);
  const bowlMat = createMat(0x1e293b, 0.2, 0.2); // Sleek dark slate ceramic
  const bowl = new THREE.Mesh(bowlGeo, bowlMat);
  bowl.position.y = 0;
  ramen.add(bowl);

  // Bowl base foot
  const footGeo = new THREE.CylinderGeometry(0.85, 0.8, 0.2, 32);
  const foot = new THREE.Mesh(footGeo, bowlMat);
  foot.position.y = -0.6;
  ramen.add(foot);

  // Broth surface
  const brothGeo = new THREE.CylinderGeometry(1.32, 1.32, 0.05, 32);
  const brothMat = createMat(0xd97706, 0.3, 0.1); // Warm golden broth
  const broth = new THREE.Mesh(brothGeo, brothMat);
  broth.position.y = 0.38;
  ramen.add(broth);

  // Curly ramen noodles (golden tori)
  const noodleMat = createMat(0xfef08a, 0.6, 0.05);
  for (let i = 0; i < 7; i++) {
    const nGeo = new THREE.TorusGeometry(0.3 + (i % 3) * 0.1, 0.06, 8, 16);
    const nMesh = new THREE.Mesh(nGeo, noodleMat);
    nMesh.rotation.x = Math.PI / 2 + Math.random() * 0.4;
    nMesh.rotation.z = Math.random() * Math.PI;
    nMesh.position.set((Math.random() - 0.5) * 0.9, 0.44, (Math.random() - 0.5) * 0.9);
    ramen.add(nMesh);
  }

  // Boiled Egg Half
  const eggWhiteGeo = new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const eggWhiteMat = createMat(0xffffff, 0.3, 0.05);
  const eggWhite = new THREE.Mesh(eggWhiteGeo, eggWhiteMat);
  eggWhite.position.set(-0.45, 0.45, 0.4);
  eggWhite.rotation.x = -Math.PI / 2;
  ramen.add(eggWhite);

  const yolkGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const yolkMat = createMat(0xf59e0b, 0.3, 0.1);
  const yolk = new THREE.Mesh(yolkGeo, yolkMat);
  yolk.position.set(-0.45, 0.46, 0.4);
  ramen.add(yolk);

  // Chopsticks resting on rim
  const chopstickGeo = new THREE.CylinderGeometry(0.04, 0.02, 2.8, 8);
  const woodMat = createMat(0xa16207, 0.7, 0.1);
  const chop1 = new THREE.Mesh(chopstickGeo, woodMat);
  chop1.position.set(0.3, 0.65, 0.1);
  chop1.rotation.z = Math.PI / 3;
  chop1.rotation.y = 0.2;
  ramen.add(chop1);

  const chop2 = chop1.clone();
  chop2.position.set(0.4, 0.66, 0.2);
  ramen.add(chop2);

  return ramen;
}

/**
 * 5. REFRESHING DRINK / BOBA SMOOTHIE
 */
export function createDrinkGroup(): THREE.Group {
  const drink = new THREE.Group();

  // Cup (translucent)
  const cupGeo = new THREE.CylinderGeometry(0.9, 0.7, 2.2, 32);
  const cupMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    roughness: 0.1,
    transmission: 0.8,
    thickness: 0.2,
  });
  const cup = new THREE.Mesh(cupGeo, cupMat);
  drink.add(cup);

  // Liquid inside
  const liquidGeo = new THREE.CylinderGeometry(0.85, 0.66, 1.8, 32);
  const liquidMat = createMat(0xf97316, 0.2, 0.1); // Fresh mango/passionfruit orange
  const liquid = new THREE.Mesh(liquidGeo, liquidMat);
  liquid.position.y = -0.15;
  drink.add(liquid);

  // Dome lid
  const lidGeo = new THREE.SphereGeometry(0.92, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const lid = new THREE.Mesh(lidGeo, cupMat);
  lid.position.y = 1.1;
  drink.add(lid);

  // Straw
  const strawGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.0, 16);
  const strawMat = createMat(0xef4444, 0.3, 0.1); // Red striped straw
  const straw = new THREE.Mesh(strawGeo, strawMat);
  straw.position.set(0.15, 0.8, 0);
  straw.rotation.z = -0.25;
  drink.add(straw);

  // Boba pearls in bottom
  const pearlGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const pearlMat = createMat(0x18181b, 0.3, 0.3); // Shiny black tapioca pearls
  for (let i = 0; i < 18; i++) {
    const pearl = new THREE.Mesh(pearlGeo, pearlMat);
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.5;
    pearl.position.set(Math.cos(angle) * r, -0.9 + Math.random() * 0.3, Math.sin(angle) * r);
    drink.add(pearl);
  }

  return drink;
}

/**
 * 6. CRISPY TACO
 */
export function createTacoGroup(): THREE.Group {
  const taco = new THREE.Group();

  // Folded Taco Shell
  const shellGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.1, 32, 1, false, 0, Math.PI);
  const shellMat = createMat(0xfbbf24, 0.6, 0.1); // Crispy corn tortilla
  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.rotation.z = Math.PI / 2;
  shell.rotation.x = Math.PI / 2;
  shell.scale.set(1, 0.5, 1);
  taco.add(shell);

  // Meat filling
  const meatGeo = new THREE.BoxGeometry(0.7, 0.4, 2.4);
  const meatMat = createMat(0x78350f, 0.8, 0.1);
  const meat = new THREE.Mesh(meatGeo, meatMat);
  meat.position.y = 0.2;
  taco.add(meat);

  // Shredded lettuce
  const lettuceMat = createMat(0x22c55e, 0.5, 0.05);
  for (let i = 0; i < 8; i++) {
    const shredGeo = new THREE.BoxGeometry(0.15, 0.1, 0.4);
    const shred = new THREE.Mesh(shredGeo, lettuceMat);
    shred.position.set((Math.random() - 0.5) * 0.5, 0.45 + Math.random() * 0.1, -1.0 + i * 0.28);
    shred.rotation.set(Math.random() * 0.4, Math.random() * 0.4, Math.random() * 0.4);
    taco.add(shred);
  }

  // Diced tomatoes
  const tomMat = createMat(0xef4444, 0.3, 0.1);
  for (let i = 0; i < 6; i++) {
    const dGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const dMesh = new THREE.Mesh(dGeo, tomMat);
    dMesh.position.set((Math.random() - 0.5) * 0.4, 0.5 + Math.random() * 0.1, -0.8 + i * 0.32);
    taco.add(dMesh);
  }

  // Shredded cheese
  const cheeseMat = createMat(0xfde047, 0.4, 0.1);
  for (let i = 0; i < 10; i++) {
    const chGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6);
    const chMesh = new THREE.Mesh(chGeo, cheeseMat);
    chMesh.position.set((Math.random() - 0.5) * 0.4, 0.55, -0.9 + Math.random() * 1.8);
    chMesh.rotation.set(Math.random(), Math.random(), Math.random());
    taco.add(chMesh);
  }

  return taco;
}

/**
 * 7. 3D DELIVERY SCOOTER (for live order tracking)
 */
export function createDeliveryScooterGroup(): THREE.Group {
  const scooter = new THREE.Group();

  // Wheels
  const wheelGeo = new THREE.TorusGeometry(0.45, 0.18, 16, 32);
  const tireMat = createMat(0x18181b, 0.8, 0.2); // Dark rubber
  const rimMat = createMat(0xd1d5db, 0.2, 0.8); // Chrome silver

  const makeWheel = (xPos: number) => {
    const wheelGroup = new THREE.Group();
    const tire = new THREE.Mesh(wheelGeo, tireMat);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16), rimMat);
    rim.rotation.x = Math.PI / 2;
    wheelGroup.add(tire);
    wheelGroup.add(rim);
    wheelGroup.position.set(xPos, 0.45, 0);
    return wheelGroup;
  };

  const frontWheel = makeWheel(1.3);
  const backWheel = makeWheel(-1.2);
  scooter.add(frontWheel);
  scooter.add(backWheel);

  // Scooter Body / Footboard
  const bodyMat = createMat(0xe11d48, 0.3, 0.2); // Vibrant FoodVerse red
  const footboard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.7), createMat(0x27272a, 0.7, 0.1));
  footboard.position.set(-0.1, 0.5, 0);
  scooter.add(footboard);

  // Main chassis & seat frame
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.6), bodyMat);
  chassis.position.set(-0.7, 0.8, 0);
  scooter.add(chassis);

  // Seat
  const seatMat = createMat(0x1c1917, 0.7, 0.1);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.5), seatMat);
  seat.position.set(-0.6, 1.15, 0);
  scooter.add(seat);

  // Front Apron & Steering Column
  const apron = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.65), bodyMat);
  apron.position.set(1.0, 1.1, 0);
  apron.rotation.z = -0.2;
  scooter.add(apron);

  // Handlebars
  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 16), rimMat);
  handlebar.position.set(0.9, 1.7, 0);
  handlebar.rotation.x = Math.PI / 2;
  scooter.add(handlebar);

  // Grips
  const gripMat = createMat(0x0f172a, 0.8, 0.1);
  const grip1 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.25, 12), gripMat);
  grip1.position.set(0.9, 1.7, 0.5);
  grip1.rotation.x = Math.PI / 2;
  scooter.add(grip1);

  const grip2 = grip1.clone();
  grip2.position.set(0.9, 1.7, -0.5);
  scooter.add(grip2);

  // Headlight with glowing emissive material
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfef08a,
    emissiveIntensity: 1.5,
    roughness: 0.1,
  });
  const headlight = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16), lightMat);
  headlight.position.set(1.2, 1.5, 0);
  headlight.rotation.z = Math.PI / 2;
  scooter.add(headlight);

  // FoodVerse Thermal Delivery Box on rear
  const boxMat = createMat(0xdc2626, 0.4, 0.1); // Warm bright red delivery box
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), boxMat);
  box.position.set(-1.1, 1.4, 0);
  scooter.add(box);

  // Delivery Box Brand Plate / Label
  const brandPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.4, 0.6),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  brandPlate.position.set(-1.1, 1.4, 0.43);
  scooter.add(brandPlate);

  // Rider helmet & silhouette
  const helmetMat = createMat(0xffffff, 0.2, 0.1);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 24), helmetMat);
  helmet.position.set(-0.3, 2.05, 0);
  scooter.add(helmet);

  const visorMat = createMat(0x0f172a, 0.1, 0.9);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.38), visorMat);
  visor.position.set(-0.15, 2.05, 0);
  scooter.add(visor);

  scooter.scale.set(0.85, 0.85, 0.85);
  return scooter;
}

/**
 * 8. CRISPY PUNJABI SAMOSA PLATTER
 */
export function createSamosaGroup(): THREE.Group {
  const samosaGroup = new THREE.Group();

  // Ceramic / Steel Plate
  const plateGeo = new THREE.CylinderGeometry(1.6, 1.4, 0.1, 32);
  const plateMat = createMat(0xf1f5f9, 0.2, 0.3);
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = -0.55;
  plate.receiveShadow = true;
  samosaGroup.add(plate);

  // Samosa pastry material (Golden crispy fried crust)
  const crustMat = createMat(0xd97706, 0.5, 0.05);

  const makeSamosa = (x: number, z: number, rotY: number) => {
    const s = new THREE.Group();
    // Triangular pyramid body (cone with 3 segments)
    const coneGeo = new THREE.ConeGeometry(0.7, 1.0, 3);
    const body = new THREE.Mesh(coneGeo, crustMat);
    body.castShadow = true;
    body.rotation.y = Math.PI / 6;
    s.add(body);

    // Crimped bottom seam
    const seamGeo = new THREE.TorusGeometry(0.35, 0.06, 8, 16);
    const seam = new THREE.Mesh(seamGeo, crustMat);
    seam.rotation.x = Math.PI / 2;
    seam.position.y = -0.42;
    s.add(seam);

    s.position.set(x, 0.0, z);
    s.rotation.y = rotY;
    s.rotation.z = 0.08;
    return s;
  };

  const samosa1 = makeSamosa(-0.45, -0.1, 0.3);
  const samosa2 = makeSamosa(0.45, 0.15, -0.6);
  samosaGroup.add(samosa1);
  samosaGroup.add(samosa2);

  // Mint-Coriander Chutney Katori
  const bowlGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.35, 24);
  const bowlMat = createMat(0x94a3b8, 0.3, 0.6);
  const bowl = new THREE.Mesh(bowlGeo, bowlMat);
  bowl.position.set(0.65, -0.35, -0.7);
  samosaGroup.add(bowl);

  // Green chutney surface
  const chutneyGeo = new THREE.CylinderGeometry(0.37, 0.37, 0.05, 24);
  const chutneyMat = createMat(0x15803d, 0.3, 0.1); // Vibrant green
  const chutney = new THREE.Mesh(chutneyGeo, chutneyMat);
  chutney.position.set(0.65, -0.2, -0.7);
  samosaGroup.add(chutney);

  // Fried green chili on side
  const chiliGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.8, 8);
  const chiliMat = createMat(0x16a34a, 0.3, 0.1);
  const chili = new THREE.Mesh(chiliGeo, chiliMat);
  chili.position.set(-0.5, -0.48, 0.8);
  chili.rotation.z = Math.PI / 3;
  chili.rotation.y = -0.5;
  samosaGroup.add(chili);

  return samosaGroup;
}

/**
 * 9. ROYAL INDIAN CURRY HANDI (Paneer Butter Masala / Butter Chicken)
 */
export function createCurryHandiGroup(): THREE.Group {
  const handi = new THREE.Group();

  // Handi Pot Body (Traditional flared pot)
  const potMat = createMat(0x78350f, 0.4, 0.6); // Warm antique brass/copper
  const bellyGeo = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65);
  const belly = new THREE.Mesh(bellyGeo, potMat);
  belly.position.y = -0.1;
  belly.scale.set(1.1, 0.8, 1.1);
  handi.add(belly);

  // Flared Rim
  const rimGeo = new THREE.TorusGeometry(0.95, 0.08, 16, 32);
  const rim = new THREE.Mesh(rimGeo, potMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.45;
  handi.add(rim);

  // Twin Brass Handles
  for (let i = 0; i < 2; i++) {
    const handleGeo = new THREE.TorusGeometry(0.2, 0.04, 8, 16, Math.PI);
    const handle = new THREE.Mesh(handleGeo, createMat(0xd97706, 0.3, 0.8));
    handle.position.set(i === 0 ? -1.05 : 1.05, 0.25, 0);
    handle.rotation.y = i === 0 ? 0 : Math.PI;
    handle.rotation.z = i === 0 ? -Math.PI / 4 : Math.PI / 4;
    handi.add(handle);
  }

  // Velvety Makhani Curry Gravy
  const curryGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.05, 32);
  const curryMat = createMat(0xdc2626, 0.2, 0.05); // Rich spiced tomato-butter red
  const gravy = new THREE.Mesh(curryGeo, curryMat);
  gravy.position.y = 0.38;
  handi.add(gravy);

  // Fresh Cream Swirl (White spiral ring)
  const creamGeo = new THREE.TorusGeometry(0.45, 0.05, 8, 24, Math.PI * 1.5);
  const creamMat = createMat(0xffffff, 0.2, 0.05);
  const cream = new THREE.Mesh(creamGeo, creamMat);
  cream.rotation.x = Math.PI / 2;
  cream.position.set(0, 0.41, 0);
  handi.add(cream);

  // Floating Paneer / Chicken Cubes
  const paneerMat = createMat(0xfef9c3, 0.4, 0.05);
  for (let i = 0; i < 4; i++) {
    const pGeo = new THREE.BoxGeometry(0.25, 0.2, 0.25);
    const p = new THREE.Mesh(pGeo, paneerMat);
    const angle = (i * Math.PI) / 2 + 0.3;
    p.position.set(Math.cos(angle) * 0.45, 0.42, Math.sin(angle) * 0.45);
    p.rotation.y = Math.random() * Math.PI;
    handi.add(p);
  }

  // Fresh Coriander garnish
  const leafMat = createMat(0x16a34a, 0.4, 0.05);
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.22), leafMat);
  leaf.position.set(0.05, 0.44, 0.05);
  leaf.rotation.y = 0.6;
  handi.add(leaf);

  return handi;
}

/**
 * 10. CRISPY SOUTH INDIAN MASALA DOSA ROLL
 */
export function createDosaGroup(): THREE.Group {
  const dosaGroup = new THREE.Group();

  // Banana Leaf / Dark Slate Platter
  const leafGeo = new THREE.BoxGeometry(2.8, 0.06, 1.6);
  const leafMat = createMat(0x15803d, 0.6, 0.05); // Lush banana leaf green
  const platter = new THREE.Mesh(leafGeo, leafMat);
  platter.position.y = -0.55;
  platter.receiveShadow = true;
  dosaGroup.add(platter);

  // Rolled Golden Dosa Cylinder
  const dosaMat = createMat(0xb45309, 0.5, 0.05); // Crisp golden roasted
  const dosaGeo = new THREE.CylinderGeometry(0.38, 0.38, 2.4, 32);
  const dosa = new THREE.Mesh(dosaGeo, dosaMat);
  dosa.rotation.z = Math.PI / 2;
  dosa.position.set(0, -0.15, 0.1);
  dosa.castShadow = true;
  dosaGroup.add(dosa);

  // Roasted golden streaks on dosa crust
  const streakMat = createMat(0x78350f, 0.6, 0.05);
  for (let i = 0; i < 5; i++) {
    const strk = new THREE.Mesh(new THREE.TorusGeometry(0.385, 0.02, 8, 16, Math.PI), streakMat);
    strk.position.set(-0.8 + i * 0.4, -0.15, 0.1);
    strk.rotation.y = Math.PI / 2;
    dosaGroup.add(strk);
  }

  // Chutney Katori 1: White Coconut Chutney
  const kat1Geo = new THREE.CylinderGeometry(0.32, 0.25, 0.25, 24);
  const katMat = createMat(0x94a3b8, 0.3, 0.6);
  const kat1 = new THREE.Mesh(kat1Geo, katMat);
  kat1.position.set(-0.8, -0.42, -0.5);
  dosaGroup.add(kat1);

  const cocoChutney = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.04, 24),
    createMat(0xf8fafc, 0.3, 0.05)
  );
  cocoChutney.position.set(-0.8, -0.3, -0.5);
  dosaGroup.add(cocoChutney);

  // Chutney Katori 2: Red Sambar / Tomato Chutney
  const kat2 = kat1.clone();
  kat2.position.set(0.8, -0.42, -0.5);
  dosaGroup.add(kat2);

  const redSambar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.04, 24),
    createMat(0xdc2626, 0.3, 0.05)
  );
  redSambar.position.set(0.8, -0.3, -0.5);
  dosaGroup.add(redSambar);

  return dosaGroup;
}

/**
 * 11. GULAB JAMUN ROYAL BOWL
 */
export function createGulabJamunGroup(): THREE.Group {
  const dessert = new THREE.Group();

  // Silver Serving Bowl
  const bowlGeo = new THREE.CylinderGeometry(1.2, 0.7, 0.8, 32);
  const bowlMat = createMat(0xe2e8f0, 0.2, 0.85); // Lustrous silver
  const bowl = new THREE.Mesh(bowlGeo, bowlMat);
  bowl.position.y = -0.3;
  dessert.add(bowl);

  // Sweet Rose-Cardamom Syrup
  const syrupGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.05, 32);
  const syrupMat = createMat(0x9a3412, 0.1, 0.2); // Glossy amber syrup
  const syrup = new THREE.Mesh(syrupGeo, syrupMat);
  syrup.position.y = 0.05;
  dessert.add(syrup);

  // 3 Golden Brown Jamun Dumplings
  const jamunMat = createMat(0x451a03, 0.2, 0.1); // Deep caramel golden-brown
  const positions = [
    [-0.35, 0.22, -0.2],
    [0.35, 0.22, -0.2],
    [0.0, 0.24, 0.35],
  ];

  positions.forEach(([x, y, z]) => {
    const jamunGeo = new THREE.SphereGeometry(0.38, 24, 24);
    const j = new THREE.Mesh(jamunGeo, jamunMat);
    j.position.set(x, y, z);
    j.castShadow = true;
    dessert.add(j);
  });

  // Glistening Pistachio Flakes on top
  const pistaMat = createMat(0x65a30d, 0.4, 0.05);
  for (let i = 0; i < 8; i++) {
    const pista = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.1), pistaMat);
    pista.position.set((Math.random() - 0.5) * 0.6, 0.55 + Math.random() * 0.05, (Math.random() - 0.5) * 0.6);
    pista.rotation.set(Math.random(), Math.random(), Math.random());
    dessert.add(pista);
  }

  return dessert;
}

/**
 * 12. DUM BIRYANI CLAY POT
 */
export function createBiryaniHandiGroup(): THREE.Group {
  const pot = new THREE.Group();

  // Terracotta Handi Pot
  const clayMat = createMat(0x9a3412, 0.7, 0.05); // Unglazed earthen terracotta
  const potGeo = new THREE.CylinderGeometry(1.3, 0.9, 1.0, 32);
  const body = new THREE.Mesh(potGeo, clayMat);
  body.position.y = -0.2;
  pot.add(body);

  // Clay rim
  const rimGeo = new THREE.TorusGeometry(1.3, 0.1, 16, 32);
  const rim = new THREE.Mesh(rimGeo, clayMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.3;
  pot.add(rim);

  // Basmati Rice Dome (Saffron & White mix)
  const riceGeo = new THREE.SphereGeometry(1.22, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const riceMat = createMat(0xfef08a, 0.6, 0.05); // Saffron golden yellow
  const rice = new THREE.Mesh(riceGeo, riceMat);
  rice.position.y = 0.28;
  pot.add(rice);

  // Fried Onions (Birista)
  const onionMat = createMat(0x451a03, 0.8, 0.05);
  for (let i = 0; i < 16; i++) {
    const fGeo = new THREE.BoxGeometry(0.18, 0.03, 0.04);
    const flake = new THREE.Mesh(fGeo, onionMat);
    const r = Math.random() * 0.9;
    const th = Math.random() * Math.PI * 2;
    flake.position.set(Math.cos(th) * r, 0.55 + (1 - r / 1.2) * 0.3, Math.sin(th) * r);
    flake.rotation.set(Math.random(), Math.random(), Math.random());
    pot.add(flake);
  }

  // Fresh Mint Leaves
  const mintMat = createMat(0x15803d, 0.5, 0.05);
  const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.24), mintMat);
  m1.position.set(0.1, 0.85, 0.1);
  m1.rotation.y = 0.4;
  pot.add(m1);

  return pot;
}

/**
 * Factory dispatcher to build any requested procedural model
 */
export function createFoodModel(type: ModelType): THREE.Group {
  switch (type) {
    case 'burger':
      return createBurgerGroup();
    case 'pizza':
      return createPizzaSliceGroup();
    case 'donut':
      return createDonutGroup();
    case 'noodles':
      return createNoodlesGroup();
    case 'biryani':
      return createBiryaniHandiGroup();
    case 'samosa':
      return createSamosaGroup();
    case 'curry':
      return createCurryHandiGroup();
    case 'dosa':
      return createDosaGroup();
    case 'gulabjamun':
      return createGulabJamunGroup();
    case 'drink':
      return createDrinkGroup();
    case 'taco':
      return createTacoGroup();
    default:
      return createBurgerGroup();
  }
}

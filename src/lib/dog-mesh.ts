import * as THREE from "three";

const PAW_COLOR = 0xf3e9d6;
const COLLAR_COLOR = 0xff8a3d;
const NOSE_COLOR = 0x1c1712;

export type LookProfile = {
  coat: number;
  legMul: number;
  bodyLenMul: number;
  bodyWidMul: number;
  bodyHeightMul: number;
  headMul: number;
  earStyle: string;
  furry: boolean;
  sizeMul: number;
};

export const LOOK_PROFILES: Record<string, LookProfile> = {
  "🐕":  { coat: 0xc9975b, legMul: 1,    bodyLenMul: 1,    bodyWidMul: 1,    bodyHeightMul: 1,    headMul: 1,    earStyle: "perked",       furry: false, sizeMul: 1    },
  "🐶":  { coat: 0xe0b467, legMul: 0.72, bodyLenMul: 0.82, bodyWidMul: 0.85, bodyHeightMul: 0.85, headMul: 1.28, earStyle: "small-round",  furry: false, sizeMul: 0.85 },
  "🐩":  { coat: 0xf2ede1, legMul: 1.15, bodyLenMul: 0.95, bodyWidMul: 0.9,  bodyHeightMul: 0.95, headMul: 1,    earStyle: "floppy-small", furry: true,  sizeMul: 1    },
  "🦮":  { coat: 0x4a3527, legMul: 1.1,  bodyLenMul: 1.15, bodyWidMul: 1.15, bodyHeightMul: 1.1,  headMul: 1.05, earStyle: "floppy-large", furry: false, sizeMul: 1.1  },
  "🐕‍🦺": { coat: 0x2b2b2b, legMul: 1.2,  bodyLenMul: 1.1,  bodyWidMul: 0.92, bodyHeightMul: 0.95, headMul: 0.95, earStyle: "perked-large", furry: false, sizeMul: 1.05 },
  "🌭":  { coat: 0xdeb06c, legMul: 0.55, bodyLenMul: 1.5,  bodyWidMul: 0.85, bodyHeightMul: 0.8,  headMul: 0.9,  earStyle: "floppy-small", furry: false, sizeMul: 1    },
  "🦴":  { coat: 0xe6b254, legMul: 1.1,  bodyLenMul: 1.1,  bodyWidMul: 1.1,  bodyHeightMul: 1.05, headMul: 1,    earStyle: "floppy-large", furry: false, sizeMul: 1.1  },
};

const EAR_STYLES: Record<string, { w: number; h: number; hingeY: number; hingeX: number; tiltZ: number; tiltX: number }> = {
  "small-round":  { w: 0.09, h: 0.11, hingeY: 0.24, hingeX: 0.15, tiltZ: 0.15,  tiltX: 0     },
  "floppy-small": { w: 0.1,  h: 0.24, hingeY: 0.27, hingeX: 0.18, tiltZ: 0.55,  tiltX: 0.25  },
  "floppy-large": { w: 0.13, h: 0.3,  hingeY: 0.29, hingeX: 0.2,  tiltZ: 0.65,  tiltX: 0.3   },
  "perked-large": { w: 0.12, h: 0.28, hingeY: 0.26, hingeX: 0.19, tiltZ: 0.12,  tiltX: -0.05 },
  "perked":       { w: 0.11, h: 0.22, hingeY: 0.23, hingeX: 0.18, tiltZ: 0.25,  tiltX: -0.05 },
};

function shade(hex: number, amount: number): THREE.Color {
  return new THREE.Color(hex).multiplyScalar(amount);
}

function addEars(head: THREE.Group, dark: THREE.MeshLambertMaterial, style: string) {
  const c = EAR_STYLES[style] ?? EAR_STYLES["perked"];
  const earGeo = new THREE.BoxGeometry(c.w, c.h, 0.06);
  ([-1, 1] as const).forEach((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * c.hingeX, c.hingeY, 0.03);
    pivot.rotation.z = side * c.tiltZ;
    pivot.rotation.x = c.tiltX;
    const ear = new THREE.Mesh(earGeo, dark);
    ear.position.y = -c.h / 2;
    ear.castShadow = true;
    pivot.add(ear);
    head.add(pivot);
  });
}

export type DogMeshResult = {
  root: THREE.Group;
  head: THREE.Group;
  tailPivot: THREE.Group;
  legPivots: THREE.Group[];
};

export function buildDogMesh(profile: LookProfile): DogMeshResult {
  const root = new THREE.Group();
  const coat = new THREE.MeshLambertMaterial({ color: profile.coat, flatShading: true });
  const dark = new THREE.MeshLambertMaterial({ color: shade(profile.coat, 0.55), flatShading: true });
  const pawMat = new THREE.MeshLambertMaterial({ color: PAW_COLOR, flatShading: true });
  const collarMat = new THREE.MeshLambertMaterial({ color: COLLAR_COLOR, flatShading: true });
  const noseMat = new THREE.MeshBasicMaterial({ color: NOSE_COLOR });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1c1712 });
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xf5f0e6 });

  const legLength = 0.32 * profile.legMul;
  const bodyY = legLength + 0.18;
  const { bodyWidMul: bw, bodyHeightMul: bh, bodyLenMul: bl } = profile;

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.52 * bw, 0.38 * bh, 0.5 * bl), coat);
  chest.position.set(0, bodyY + 0.01, -0.22 * bl);
  chest.castShadow = true;
  root.add(chest);

  const rear = new THREE.Mesh(new THREE.BoxGeometry(0.46 * bw, 0.34 * bh, 0.46 * bl), coat);
  rear.position.set(0, bodyY, 0.24 * bl);
  rear.castShadow = true;
  root.add(rear);

  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.4 * bw, 0.1, 0.7 * bl), dark);
  belly.position.set(0, bodyY - 0.19, 0);
  root.add(belly);

  const head = new THREE.Group();
  head.position.set(0, bodyY + 0.32, -(0.22 * bl + 0.36));
  head.scale.setScalar(profile.headMul);
  const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.4), coat);
  headBox.castShadow = true;
  head.add(headBox);

  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.17, 0.32), dark);
  snout.position.set(0, -0.09, -0.34);
  head.add(snout);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.06), noseMat);
  nose.position.set(0, -0.08, -0.49);
  head.add(nose);

  const eyeWhiteGeo = new THREE.BoxGeometry(0.09, 0.08, 0.02);
  const eyeGeo = new THREE.BoxGeometry(0.05, 0.05, 0.03);
  ([-0.12, 0.12] as const).forEach((x) => {
    const white = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    white.position.set(x, 0.06, -0.185);
    const pupil = new THREE.Mesh(eyeGeo, eyeMat);
    pupil.position.set(x, 0.05, -0.2);
    head.add(white, pupil);
  });

  addEars(head, dark, profile.earStyle);

  if (profile.furry) {
    const poofGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    [[0, 0.24, -0.02], [-0.1, 0.19, -0.11], [0.1, 0.19, -0.11], [0, 0.19, -0.22]].forEach(([x, y, z]) => {
      const poof = new THREE.Mesh(poofGeo, coat);
      poof.position.set(x, y, z);
      poof.castShadow = true;
      head.add(poof);
    });
  }
  root.add(head);

  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.42 * bw, 0.09, 0.46), collarMat);
  collar.position.set(0, bodyY + 0.19, -0.42 * bl);
  root.add(collar);

  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, bodyY + 0.14, 0.45 * bl);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.4), dark);
  tail.position.z = 0.2;
  tail.rotation.x = -0.5;
  const tipSize = profile.furry ? 0.19 : 0.13;
  const tailTip = new THREE.Mesh(new THREE.BoxGeometry(tipSize, tipSize, tipSize), profile.furry ? coat : pawMat);
  tailTip.position.z = 0.24;
  tail.add(tailTip);
  tailPivot.add(tail);
  root.add(tailPivot);

  const legGeo = new THREE.BoxGeometry(0.13, legLength * 0.7, 0.13);
  const pawGeo = new THREE.BoxGeometry(0.15, legLength * 0.3, 0.16);
  const legPositions: [number, number][] = [
    [-0.17 * bw, -0.32 * bl], [0.17 * bw, -0.32 * bl],
    [-0.17 * bw,  0.32 * bl], [0.17 * bw,  0.32 * bl],
  ];
  const legPivots = legPositions.map(([lx, lz]) => {
    const pivot = new THREE.Group();
    pivot.position.set(lx, legLength + 0.16, lz);
    const leg = new THREE.Mesh(legGeo, dark);
    leg.position.y = -legLength * 0.35;
    leg.castShadow = true;
    const paw = new THREE.Mesh(pawGeo, pawMat);
    paw.position.y = -legLength * 0.75;
    paw.castShadow = true;
    pivot.add(leg, paw);
    root.add(pivot);
    return pivot;
  });

  return { root, head, tailPivot, legPivots };
}

export function emojiForDog(breed: string | null, size: string): string {
  const b = (breed ?? "").toLowerCase();
  if (b.includes("dachshund") || b.includes("doxie") || b.includes("wiener")) return "🌭";
  if (b.includes("golden retriever") || b.includes("golden")) return "🦴";
  if (b.includes("poodle") || b.includes("doodle") || b.includes("oodle")) return "🐩";
  if (b.includes("shepherd") || b.includes("husky") || b.includes("malinois") || b.includes("collie")) return "🐕‍🦺";
  if (size === "small") return "🐶";
  if (size === "large" || size === "xlarge") return "🦮";
  return "🐕";
}

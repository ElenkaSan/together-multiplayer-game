// Presentation coordinates only: feet stay on dry ground in the original maps.
export type SceneLayout = {
  feet: [number, number];
  ground: string;
  width: number;
  height: number;
};
export const expeditionSceneLayouts: Record<string, SceneLayout[]> = {
  "jungle-adventure": [
    {
      feet: [43, 84],
      ground: "Dry sand before the landing pier",
      width: 971,
      height: 1620,
    },
    {
      feet: [13, 62],
      ground: "Solid trail before the suspension bridge",
      width: 971,
      height: 1620,
    },
    {
      feet: [43, 48],
      ground: "Stone path beside the ancient ruins",
      width: 971,
      height: 1620,
    },
    {
      feet: [56, 34],
      ground: "Dry rock ledge outside the waterfall cave",
      width: 971,
      height: 1620,
    },
    {
      feet: [53, 16],
      ground: "Temple approach before the stairs",
      width: 971,
      height: 1620,
    },
  ],
  "treasure-island": [
    {
      feet: [39, 69],
      ground: "Dry beach before the cove pier",
      width: 1024,
      height: 1536,
    },
    {
      feet: [35, 47],
      ground: "Sand beside the shipwreck",
      width: 1024,
      height: 1536,
    },
    {
      feet: [61, 55],
      ground: "Island trail beside the palms",
      width: 1024,
      height: 1536,
    },
    {
      feet: [69, 44],
      ground: "Dry approach outside Skull Rock Cave",
      width: 1024,
      height: 1536,
    },
    {
      feet: [61, 22],
      ground: "Sandy shore beside the hidden lagoon",
      width: 1024,
      height: 1536,
    },
  ],
};
export function expeditionSceneLayout(id: string, round: number) {
  return expeditionSceneLayouts[id]?.[round];
}
export function sceneViewport(layout: SceneLayout) {
  const height = (layout.width * 9) / 16;
  const top = Math.max(
    0,
    Math.min(
      layout.height - height,
      (layout.feet[1] / 100) * layout.height - height * 0.78,
    ),
  );
  return {
    top,
    height,
    heroTop: (((layout.feet[1] / 100) * layout.height - top) / height) * 100,
  };
}

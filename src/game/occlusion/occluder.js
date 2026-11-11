// Marks a piece of scenery (cabin, forge, arch, obelisk...) the camera occlusion pass may fade while it hides the hero.
export function occluder(object) {
  object.userData.occluder = true;
  return object;
}
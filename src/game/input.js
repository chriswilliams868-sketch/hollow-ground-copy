const PREVENT = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyJ', 'KeyK', 'KeyF'];
const ATTACK_KEYS = ['KeyJ', 'KeyK'];
const DASH_KEYS = ['ShiftLeft', 'ShiftRight'];

// Keyboard + mouse bindings. Attack is press/release so holding it charges a heavy slam.
export function bindInput(engine) {
  const canvas = engine.renderer.domElement;

  const onKeyDown = (event) => {
    // Let text fields (hero name) receive every key
    if (event.target instanceof HTMLInputElement) return;
    const code = event.code;
    if (PREVENT.includes(code)) event.preventDefault();
    if (code === 'Escape' || code === 'KeyP') {
      if (!event.repeat) engine.togglePause();
      return;
    }
    if (code === 'Tab') {
      if (engine.state === 'playing' || engine.state === 'paused') event.preventDefault();
      if (!event.repeat) engine.toggleInventory();
      return;
    }
    if (engine.keys.has(code)) return;
    engine.keys.add(code);
    if (engine.state !== 'playing') return;
    if (code === 'Space') engine.lockOn();
    if (DASH_KEYS.includes(code) && !event.ctrlKey && !event.metaKey) engine.dodge();
    if (code === 'KeyF') engine.skillPress();
    if (code === 'KeyQ') engine.drinkPotion();
    if (code === 'KeyE') engine.interact();
    if (ATTACK_KEYS.includes(code)) engine.attackPress();
  };

  const onKeyUp = (event) => {
    engine.keys.delete(event.code);
    if (ATTACK_KEYS.includes(event.code)) engine.attackRelease();
    if (event.code === 'KeyF') engine.skillRelease();
  };

  const onBlur = () => {
    engine.keys.clear();
    engine.skillRelease();
    engine.cancelCharge();
  };

  const onPointerDown = (event) => {
    if (event.pointerType !== 'mouse' || engine.state !== 'playing') return;
    event.preventDefault();
    if (event.button === 0) engine.attackPress();
    if (event.button === 1) engine.lockOn();
    if (event.button === 2) engine.skillPress();
  };

  const onPointerUp = (event) => {
    if (event.pointerType === 'mouse' && event.button === 0) engine.attackRelease();
    if (event.pointerType === 'mouse' && event.button === 2) engine.skillRelease();
  };

  const onMouseDown = (event) => {
    if (event.button === 1) event.preventDefault();
  };
  const onContextMenu = (event) => event.preventDefault();
  // Block page panning during play, but let menu panels (marked data-scroll) scroll by touch
  const onTouchMove = (event) => {
    if (event.target instanceof Element && event.target.closest('[data-scroll]')) return;
    if (event.cancelable) event.preventDefault();
  };

  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('contextmenu', onContextMenu);
  document.addEventListener('touchmove', onTouchMove, { passive: false });

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('contextmenu', onContextMenu);
    document.removeEventListener('touchmove', onTouchMove);
  };
}
export const CanvasEdgeMode = {
  BOUNCE: 'bounce',
  WRAP: 'wrap'
};

export const config = {
  canvasMode: CanvasEdgeMode.BOUNCE,

  particles: {
    count: 120,
    radius: 2.5,
    speed: 1
  },

  edges: {
    show: true,
    maxDist: 120,
  },

  mouse: {
    active: false,
    x: -9999,
    y: -9999,
    repelRadius: 90,
    repelForce: 8
  },

  colors: {
    particle: '#ef77b5',
    edge: '#ef77b5',
    mouse: '#ef77b5', //'white',
    background: '#1f1f1f'
  },

  // visuals: {
  //   glow: true,
  //   trails: false
  // }
};

export function setMousePosition(x, y) {
  config.mouse.x = x;
  config.mouse.y = y;
}
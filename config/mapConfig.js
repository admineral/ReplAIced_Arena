import { db } from '../firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const defaultMapConfig = {
  worldSize: 5,
  minBoxDistance: 2,
  initialPosition: { x: 0, y: 0 },
  initialZoom: 1.3,
  minZoom: 0.3,
  maxZoom: 1.6,
  zoomStep: 0.05,
  mapSize: 70,
  panLimit: 3,
  dragSpeed: 0.02,
  invertDragX: true,
  invertDragY: false,
  miniMapSize: 300,
  miniMapMinZoom: 0.5,
  miniMapMaxZoom: 4,
  miniMapZoomStep: 0.5,
  miniMapSpeedFactor: 0.5,
};

const fetchMapConfig = async () => {
  const mapConfigRef = doc(db, 'config', 'mapConfig');
  const mapConfigSnap = await getDoc(mapConfigRef);

  if (mapConfigSnap.exists()) {
    return { ...defaultMapConfig, ...mapConfigSnap.data() };
  } else {
    // If the document doesn't exist, create it with default values
    await setDoc(mapConfigRef, defaultMapConfig);
    return defaultMapConfig;
  }
};

let mapConfig = defaultMapConfig;

fetchMapConfig().then(config => {
  mapConfig = config;
});

export default mapConfig;

export const refreshMapConfig = async () => {
  mapConfig = await fetchMapConfig();
  return mapConfig;
};
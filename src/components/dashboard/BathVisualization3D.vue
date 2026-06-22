<script setup lang="ts">
import { onMounted, onUnmounted, watch, useTemplateRef } from "vue";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three";

const props = defineProps<{
  temperature: number;
}>();

const containerRef = useTemplateRef("container");
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let bath: THREE.Mesh;
let liquid: THREE.Mesh;
let animationId: number;
let controls: OrbitControls;
const disposables: { dispose: () => void }[] = [];

const handleResize = () => {
  if (!containerRef.value || !renderer || !camera) return;
  const w = containerRef.value.clientWidth;
  const h = containerRef.value.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
};

const temperatureToColor = (temp: number) => {
  // 20°C = blue, 45°C = yellow, 60°C = red
  const ratio = Math.min(1, Math.max(0, (temp - 20) / 40));
  const r = ratio;
  const g = ratio < 0.5 ? ratio * 2 : 1 - (ratio - 0.5) * 2;
  const b = 1 - ratio;
  return new THREE.Color(r, g, b);
};

const init = () => {
  if (!containerRef.value) {
    return;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1f2937);

  camera = new THREE.PerspectiveCamera(60, 2, 0.15, 100);
  camera.position.set(2.5, 3.5, 4);
  camera.lookAt(0, -0.3, 2);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // rotate and scroll in/out
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  containerRef.value.appendChild(renderer.domElement);

  // ambient light
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // directional light
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // bath (cylinder)
  const bathGeometry = new THREE.CylinderGeometry(1, 1, 2, 32, 1, true);
  const bathMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b7280,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });
  bath = new THREE.Mesh(bathGeometry, bathMaterial);
  bath.position.y = 1;
  scene.add(bath);

  // bath bottom
  const bottomGeometry = new THREE.CircleGeometry(1, 32);
  const bottomMaterial = new THREE.MeshStandardMaterial({ color: 0x4b5563 });
  const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.01;
  scene.add(bottom);

  // liquid
  const liquidGeometry = new THREE.CylinderGeometry(0.95, 0.95, 1.4, 32);
  const liquidMaterial = new THREE.MeshStandardMaterial({
    color: temperatureToColor(props.temperature),
    transparent: true,
    opacity: 0.7,
  });
  liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
  liquid.position.y = 0.7;
  scene.add(liquid);

  // electrodes (two thin cylinders)
  const electrodeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8);
  const electrodeMaterial = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8 });

  const electrode1 = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  electrode1.position.set(-0.4, 1.25, 0);
  scene.add(electrode1);

  const electrode2 = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  electrode2.position.set(0.4, 1.25, 0);
  scene.add(electrode2);

  // platform
  const platformGeometry = new THREE.CylinderGeometry(1.3, 1.3, 0.1, 32);
  const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x6b7280 });
  const platform = new THREE.Mesh(platformGeometry, platformMaterial);
  platform.position.y = -0.05;
  scene.add(platform);

  disposables.push(
    bathGeometry,
    bathMaterial,
    liquidGeometry,
    liquidMaterial,
    bottomGeometry,
    bottomMaterial,
    electrodeGeometry,
    electrodeMaterial,
    platformGeometry,
    platformMaterial,
  );
};

const animate = () => {
  animationId = requestAnimationFrame(animate);
  controls.update();
  bath.rotation.y += 0.003;
  renderer.render(scene, camera);
};

watch(
  () => props.temperature,
  (newTemp) => {
    if (liquid) {
      (liquid.material as THREE.MeshStandardMaterial).color = temperatureToColor(newTemp);
    }
  },
);

onMounted(() => {
  init();
  animate();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  cancelAnimationFrame(animationId);
  controls?.dispose();
  for (const d of disposables) d.dispose();
  renderer?.dispose();
  disposables.length = 0;
});
</script>

<template>
  <div class="bath-3d">
    <div class="chart-header">
      <h3>Plating Bath — 3D View</h3>
      <span class="temp-badge" :style="{ color: temperature > 45 ? '#ef4444' : '#34d399' }">
        {{ temperature.toFixed(1) }}°C
      </span>
    </div>
    <div ref="container" class="three-container"></div>
    <p class="rotate-hint">Click and drag to rotate • Scroll to zoom</p>
  </div>
</template>

<style scoped>
.bath-3d {
  background: #1f2937;
  border-radius: 12px;
  padding: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chart-header h3 {
  margin: 0;
  font-size: 14px;
  color: #e5e7eb;
  font-weight: 500;
}

.temp-badge {
  font-size: 13px;
  font-weight: 600;
}

.three-container {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
}

.rotate-hint {
  margin: 8px 0 0;
  font-size: 11px;
  color: #6b7280;
  text-align: center;
}
</style>

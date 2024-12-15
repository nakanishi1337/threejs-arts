
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// シーン、カメラ、レンダラーの設定
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(50, 80, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;


// ランダムな黄色を生成する関数
const getRandomYellow = () => {
  const h = Math.random() * 20 +20; // 黄色の色相は 0 ~ 60 の範囲でランダムに
  const s = 100; // 彩度は100%
  const l = Math.random() * 70 + 20; // 明度は50~90の間でランダムに

  return new THREE.Color(`hsl(${h}, ${s}%, ${l}%)`);
};

// ランダムな四角形のサイズを生成する関数
const getRandomSquareSize = () => {
  return Math.random() * 70 + 25; // 四角形のサイズは10~40の間でランダム
};

// テクスチャを作成
const createTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512; // テクスチャの幅
  canvas.height = 512; // テクスチャの高さ
  const ctx = canvas.getContext('2d');

  // 背景塗りつぶし
  ctx.fillStyle = '#9c9303'; // ダークな背景色
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 四角形を描画
  const spacing = 50; // 四角形の間隔
  const rows = Math.floor(canvas.height / (spacing + 1)); // ランダムサイズの四角形の行数
  const columns = Math.floor(canvas.width / (spacing + 1)); // ランダムサイズの四角形の列数

  // ランダムな黄色の四角形を描画
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const x = j * (spacing + 1); // 間隔を少し追加
      const y = i * (spacing + 1);

      // ランダムな黄色を設定
      ctx.fillStyle = getRandomYellow().getStyle();

      // ランダムなサイズで四角形を描画
      const size = getRandomSquareSize(); // ランダムなサイズを取得
      ctx.clearRect(x, y, size, size);  // 上から塗りつぶし

      ctx.fillRect(x, y, size, size); // ランダムな大きさで四角形を描画
    }
  }

  // テクスチャを作成
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4); // テクスチャを繰り返し配置
  return texture;
};

// 球体背景を作成
const createSphereBackground = () => {
  const geometry = new THREE.SphereGeometry(200, 64, 64); // 大きな球体
  const material = new THREE.MeshStandardMaterial({
    map: createTexture(), // テクスチャを適用
    side: THREE.BackSide, // 内側を描画
  });

  const sphere = new THREE.Mesh(geometry, material);
  return sphere;
};


// 背景球体をシーンに追加
const sphereBackground = createSphereBackground();
scene.add(sphereBackground);


// 地面
const groundGeometry = new THREE.PlaneGeometry(400, 400);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ネオンビルを作成（修正: 輪っかを追加）
const createNeonBuilding = (x, z, maxHeight = 25, maxRings = 6) => {
  const height = (Math.floor(Math.random() * 4) + 2) * 5; // 10, 15, 20, 25 のいずれか
  const geometry = new THREE.BoxGeometry(5, height, 5);

  const material = new THREE.MeshStandardMaterial({
    color: 0x222222, // ベースカラー（暗い色）
  });

  const building = new THREE.Mesh(geometry, material);
  building.position.set(x, height / 2, z); // ビルの高さに応じて位置を調整

  // リングの作成
  const ringCount = Math.round((height / maxHeight) * maxRings); // 高さに比例してリング数を計算
  const ringSpacing = height / (ringCount + 1); // 高さを均等に分割してリング間隔を計算
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff000, // ベースカラー
    emissive: new THREE.Color(0xfff000), // 輝く色
    emissiveIntensity: 0.8,
  });

  for (let i = 1; i <= ringCount; i++) {
    const ringGeometry = new THREE.TorusGeometry(3, 0.2, 16, 100); // 半径3の薄いリング
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);

    // リングをビルの中心に配置し、均等に間隔を開ける
    ring.position.set(0, i * ringSpacing - height / 2, 0); // リングを高さに応じて配置
    ring.rotation.x = Math.PI / 2; // 横向きに配置
    building.add(ring); // ビルにリングを追加
  }

  return building;
};

// ビル群を配置
for (let x = -120; x <= 120; x += 10) {
  for (let z = -120; z <= 120; z += 10) {
    const building = createNeonBuilding(x, z, 25, 15);
    scene.add(building);
  }
}

// ライトの設定
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9); // 環境光
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(50, 50, 10);
scene.add(directionalLight);

// ポストプロセッシング: Unreal Bloom Effect
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, // 強さ
  0.4, // 半径
  0.85 // 明るさ閾値
);
composer.addPass(bloomPass);

// アニメーションループ
const animate = () => {
  requestAnimationFrame(animate);
  controls.update(); // カメラ操作のスムーズさを反映
  composer.render();
};
animate();

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

import './style.css'


import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from "/modules/dat.gui.module.js"; // Import GUI module

const textureLoader = new THREE.TextureLoader();



// LET THERE BE TIME
var clock = new THREE.Clock();
var speed = 1; //units a second
var delta = 0;
delta = clock.getDelta();



// DEFINING SCENE, CAMERA, AND RENDERER
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer( {
  canvas: document.querySelector('#bg'),
})



// DEFINE ASPECT RATIO - Taking the device's window size as default
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
renderer.render(scene, camera)



// MILKY WAY BACKGROUND - We have to simulate the universe, what better way to do it than with this background :)
const bgGeometry = new THREE.SphereGeometry(1000, 100, 100);
const bgMaterial = new THREE.MeshStandardMaterial({
  map: textureLoader.load("/milkyway.jpg"),
  side: THREE.DoubleSide, // Texture shows on both sides of sphere
  transparent: true,
  opacity: 0.25
});

const bg = new THREE.Mesh(bgGeometry, bgMaterial);
scene.add(bg);



// MOON GEOMETRY - Consists of a map of the surface with a bumpMap on top to emphasize depth
const moonGeometry = new THREE.SphereGeometry(15, 100, 100);
// const moonMaterial = new THREE.MeshBasicMaterial({color: 0xFF6347, wireframe: true});
const moonMaterial = new THREE.MeshStandardMaterial({
  map: textureLoader.load("/moon.jpg"),
});
moonMaterial.bumpMap = textureLoader.load("/moon16.jpg");
moonMaterial.bumpScale = 0.025

const moon = new THREE.Mesh(moonGeometry, moonMaterial);
// moon.rotation.z = 0.05 // Moon's oblique tilt
scene.add(moon)



// LIGHTING - One that mimicks the sun's light and another is ambient light in the universe for better user experience
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(50, 10, 50);
scene.add(pointLight)

const ambientLight = new THREE.AmbientLight(0x282828);
scene.add(ambientLight)

const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50)
scene.add(lightHelper, gridHelper)



// ORBITAL CONTROLS - Allows user to use mouse to navigate the 3D scene within the boundaries of the environment
const controls = new OrbitControls(camera, renderer.domElement)
controls.minDistance = 16
controls.maxDistance = 200



// GUI FUNCTIONS




// GRAPHICAL USER INTERFACE
const gui = new GUI();

let lightFolder = gui.addFolder("Light Options");
let moonFolder = gui.addFolder("Moon Options");
let temporalFolder = gui.addFolder("Date & Time Options");

lightFolder.add(pointLight, "intensity", 0, 2).name("Sunlight Intensity");
lightFolder.add(pointLight.position, "z", 0, 100).name("Sunlight Position");
lightFolder.add(ambientLight, "intensity", 0, 6).name("Universal Intensity");

const fillerGeometry = new THREE.SphereGeometry(5, 5, 5);
const fillerMaterial = new THREE.MeshStandardMaterial({
  transparent: true,
  opacity: 0,
});
const filler = new THREE.Mesh(fillerGeometry, fillerMaterial);
moonFolder.add(filler.rotation, "y", -10, 10, 0.001).name("Rotation Speed");

//gui.add(pointLight, "Sunlight").name("Sunlight");


// ANIMATE
function animate() {
  requestAnimationFrame(animate);
  delta = clock.getDelta();

  // moon.rotation.x += 0.001;
  moon.rotation.y += moonFolder.__controllers[0].getValue()/100;
  // moon.rotation.z += 0.001;

  controls.update();
  renderer.render(scene, camera);
}

animate()
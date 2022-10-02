import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from "/modules/dat.gui.module.js"; // Import GUI module
import sm1979 from '/src/nakamura_1979_sm_locations.json' assert {type: 'json'};
import dm2005 from '/src/nakamura_2005_dm_locations.json' assert {type: 'json'};
import mm2003 from '/src/lognonne_2003_meteorite_locations.json' assert {type: 'json'};
import lm1983 from '/src/nakamura_1983_ai_locations.json' assert {type: 'json'};


// var TEXTURES_LOADED = false;
var manager = new THREE.LoadingManager(); 
const textureLoader = new THREE.TextureLoader(manager);

manager.onLoad = function(){
	console.log('Loading complete!');
  // document.querySelector('#bg');
  // document.getElementById("bg").style.zIndex = 1000;
  // document.getElementById("portfolio-loader").remove();
  document.getElementById("loadingScreen").remove();
};




// DEFINING SCENE, CAMERA, AND RENDERER
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 20000);
const renderer = new THREE.WebGLRenderer( {
  canvas: document.querySelector('#bg'),
  antialias: true,
})

function onWindowResize() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);



// ORBITAL CONTROLS - Allows user to use mouse to navigate the 3D scene within the boundaries of the environment
const controls = new OrbitControls(camera, renderer.domElement)
controls.minDistance = 16;
controls.maxDistance = 200;



// DEFINE ASPECT RATIO - Taking the device's window size as default
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
renderer.render(scene, camera);
controls.saveState(); // To save starting point for 'Reset Camera' option in GUI



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


// MILKY WAY BACKGROUND - We have to simulate the universe, what better way to do it than with this background :)
const bgGeometry = new THREE.SphereGeometry(10000, 100, 100);
const bgMaterial = new THREE.MeshStandardMaterial({
  map: textureLoader.load("/milkyway.jpg"),
  side: THREE.DoubleSide, // Texture shows on both sides of sphere
  transparent: true,
  opacity: 0.25
});

const bg = new THREE.Mesh(bgGeometry, bgMaterial);
scene.add(bg);



// LIGHTING - One that mimicks the sun's light and another is ambient light in the universe for better user experience
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(50, 10, 50);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x282828);
scene.add(ambientLight)

// const lightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(200, 50)
// scene.add(lightHelper, gridHelper)
// const axesHelper = new THREE.AxesHelper(30);
// scene.add(axesHelper);
// light rotation object
const lvs = new THREE.Mesh(new THREE.SphereGeometry(5, 3, 2), new THREE.MeshStandardMaterial({transparent: true, opacity: 1,}));
scene.add(lvs)
lvs.add(pointLight);


// LATITUDE & LONGITUDE TO SPHERICAL COORDINATES
function toCartesian(lat, lon) {
  const radius = 15;
  var phi = (90 - lat)*(Math.PI/180);
  var theta = (lon + 180)*(Math.PI/180);
  
  
  var x = -(radius * Math.sin(phi)*Math.cos(theta));
  var z = (radius * Math.sin(phi)*Math.sin(theta));
  var y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z)
}


// DATA POINTS IN GROUPS - Add each data point to a group to be used to enable/disable on the Moon's surface
// // // Shallow Moonquakes Points
var sm1979_group = new THREE.Group();
for (var i = 0; i < sm1979.length; i++) {
  var sm_cartesian = toCartesian(sm1979[i].Lat, sm1979[i].Long);
  var sm_mesh = new THREE.Mesh(new THREE.SphereGeometry(0.08*sm1979[i].Magnitude, 20, 20), new THREE.MeshBasicMaterial({color:0xff0000}));
  sm_mesh.position.set(sm_cartesian.x, sm_cartesian.y, sm_cartesian.z);
  sm1979_group.add(sm_mesh);
}
sm1979_group.visible = false;
scene.add(sm1979_group);

var sm1979_groupStatus = {
  toggleStatus: function() {
    if (sm1979_group.visible == false) {
      sm1979_group.visible = true;
    } else {
      sm1979_group.visible = false;
    }    
  }
}


// // // Deep Moonquakes Points
var dm2005_group = new THREE.Group();
for (var j = 0; j < dm2005.length; j++) {
  var dm_cartesian = toCartesian(dm2005[j].Lat, dm2005[j].Long);
  var dm_mesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 20),new THREE.MeshBasicMaterial({color:0xfff000}));
  dm_mesh.position.set(dm_cartesian.x, dm_cartesian.y, dm_cartesian.z);
  dm2005_group.add(dm_mesh);
}
dm2005_group.visible = false;
scene.add(dm2005_group);

var dm2005_groupStatus = {
  toggleStatus: function() {
    if (dm2005_group.visible == false) {
      dm2005_group.visible = true;
    } else {
      dm2005_group.visible = false;
    }
  }
}


// METEORITE LOCATIONS
var mm2003_group = new THREE.Group();
for (var r = 0; r < mm2003.length; r++) {
  var mm_cartesian = toCartesian(mm2003[r].Lat, mm2003[r].Long);
  var mm_mesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 20),new THREE.MeshBasicMaterial({color:0x0066FF}));
  mm_mesh.position.set(mm_cartesian.x, mm_cartesian.y, mm_cartesian.z);
  mm2003_group.add(mm_mesh);
}
mm2003_group.visible = false;
scene.add(mm2003_group);

var mm2003_groupStatus = {
  toggleStatus: function() {
    if (mm2003_group.visible == false) {
      mm2003_group.visible = true;
    } else {
      mm2003_group.visible = false;
    }
  }
}



// LUNAR MODULE LOCATIONS
var lm1983_group = new THREE.Group();
for (var k = 0; k < lm1983.length; k++) {
  var lm_cartesian = toCartesian(lm1983[k].Lat, lm1983[k].Long);
  var lm_mesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 20),new THREE.MeshBasicMaterial({color:0x00FF00}));
  lm_mesh.position.set(lm_cartesian.x, lm_cartesian.y, lm_cartesian.z);
  lm1983_group.add(lm_mesh);
}
lm1983_group.visible = false;
scene.add(lm1983_group);

var lm1983_groupStatus = {
  toggleStatus: function() {
    if (lm1983_group.visible == false) {
      lm1983_group.visible = true;
    } else {
      lm1983_group.visible = false;
    }
  }
}


// COLOR MAP - Show data of moonquakes on surface






// GRAPHICAL USER INTERFACE
const gui = new GUI();

let quakeFolder = gui.addFolder("Moonquake Options");
let moonFolder = gui.addFolder("Moon Options");
let lightFolder = gui.addFolder("Light Options");
let cameraFolder = gui.addFolder("Camera Options");
// let temporalFolder = gui.addFolder("Date & Time Options");


// Moonquake Options
quakeFolder.add(sm1979_groupStatus, "toggleStatus").name("Shallow Quakes Visibility");
quakeFolder.add(dm2005_groupStatus, "toggleStatus").name("Deep Quakes Visibility");
quakeFolder.add(mm2003_groupStatus, "toggleStatus").name("Meteorite Quakes Visibility");
quakeFolder.add(lm1983_groupStatus, "toggleStatus").name("Lunar Modules Visibility");


// Moon Options
const fillerGeometry = new THREE.SphereGeometry(2, 3, 2);
const fillerMaterial = new THREE.MeshStandardMaterial({
  transparent: true,
  opacity: 0,
});
const filler = new THREE.Mesh(fillerGeometry, fillerMaterial);
moonFolder.add(filler.rotation, "y", -5, 5, 0.01).name("Rotation Speed");
var stopstatus = {
  toggleStatus: function() {
    if (filler.rotation.y != 0) {
      filler.rotation.y = 0
    }
}
}
moonFolder.add(stopstatus, "toggleStatus").name("Stop Rotation");

// Light Options
lightFolder.add(pointLight, "intensity", 0, 2).name("Sunlight Intensity");
lightFolder.add(lvs.rotation, 'y', 0, 2*Math.PI, 0.1).name("Sunlight Position");
lightFolder.add(ambientLight, "intensity", 0, 6).name("Universal Intensity");
var universallightstatus = {
  toggleStatus: function() {
    if (pointLight.intensity != 0 || ambientLight.intensity != 5) {
      pointLight.intensity = 0;
      ambientLight.intensity = 5;
    } else {
      pointLight.intensity = 1;
      ambientLight.intensity = 1;
    }    
  }
}
lightFolder.add(universallightstatus, "toggleStatus").name("Disable Realistic Light");


// Camera Options
var fovSettings = {
  fovValue: 75,
  fovReset: function() {
    this.fovValue = 75;
  }
}
cameraFolder.add(fovSettings, "fovValue", 50, 120, 1).name("Field of View");
cameraFolder.add(fovSettings, "fovReset").name("Reset Camera");
cameraFolder.add(controls, "reset").name("Reset Position");
// cameraFolder.add(axesHelperSettings, "")






// ANIMATE
function animate() {
  requestAnimationFrame(animate);
  moon.rotation.y += moonFolder.__controllers[0].getValue()/100;
  sm1979_group.rotation.y += moonFolder.__controllers[0].getValue()/100;
  dm2005_group.rotation.y += moonFolder.__controllers[0].getValue()/100;
  mm2003_group.rotation.y += moonFolder.__controllers[0].getValue()/100;
  lm1983_group.rotation.y += moonFolder.__controllers[0].getValue()/100;

  camera.fov = cameraFolder.__controllers[0].getValue()

  controls.update();
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

animate()
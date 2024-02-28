"use_strict";

import * as THREE from 'three';
import vertexShader from "./shader.vert";
import fragmentShader from "./shader.frag";

var renderer = new THREE.WebGLRenderer();
var scene = new THREE.Scene();
var camera = new THREE.Camera();
var startTime;
var prevTime;
const MAX_FPS = 1000.0;

var uniforms = {
  iTime: { value: 0.0 },
  iResolution: { value: new THREE.Vector2() },
  iMouse: { value: new THREE.Vector4() }
};

window.addEventListener("resize", function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.iResolution.value.x = window.innerWidth;
  uniforms.iResolution.value.y = window.innerHeight;
});

window.addEventListener("mousemove", function (event) {
  event.preventDefault();
  uniforms.iMouse.value.x = (event.clientX / window.innerWidth) * 2 - 1;
  uniforms.iMouse.value.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("mousedown", (event) => {
  if (event.button == 0) {
    uniforms.iMouse.value.z = 1.0;
  }
});

window.addEventListener("mouseup", (event) => {
  if (event.button == 0) {
    uniforms.iMouse.value.z = 0.0;
  }
});

function init() {
  camera.position.z = 1.0;

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  var plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);

  scene.add(plane);

  uniforms.iResolution.value.x = window.innerWidth;
  uniforms.iResolution.value.y = window.innerHeight;

  renderer.setClearColor(new THREE.Color(0.0, 0.0, 1.0));
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function animate(timeStamp : number) {
  requestAnimationFrame(animate);

  if (startTime === undefined) {
    startTime = timeStamp;
  }

  if (prevTime === undefined || timeStamp - prevTime > 1000.0/MAX_FPS)
  {
    var elapsedTime = timeStamp - startTime;

    uniforms.iTime.value = elapsedTime / 1000;
    renderer.render(scene, camera);
    prevTime = timeStamp;
  }
}

init();
requestAnimationFrame(animate);
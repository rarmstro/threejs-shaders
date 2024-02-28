"use_strict";

import * as THREE from 'three';

var renderer = new THREE.WebGLRenderer();
var scene = new THREE.Scene();
var camera = new THREE.Camera();


function init() {
  renderer.setClearColor(new THREE.Color(0.0, 0.0, 1.0));
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function render() {
  renderer.render(scene, camera);
}

init();
renderer.setAnimationLoop(render);
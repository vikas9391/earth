// earth.js - Enhanced version with debris and rotation (Fixed)
import * as THREE from "three";
import {
    colorMix,
    generateRandomNumber,
    latLongToVector3
} from "../util"
import consts from "../consts";

// Fixed: SphereBufferGeometry → SphereGeometry
let _geometry = new THREE.SphereGeometry(consts.globeRadius, 64, 64);

function innerEarth() {
    let _material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(0x4a90e2), // Changed to more realistic blue
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        opacity: 1,
        fog: true,
        depthWrite: false,
        depthTest: false
    });
    return new THREE.Mesh(_geometry, _material)
}

function earthMap(img) {
    let _texture, _material;
    _texture = new THREE.TextureLoader().load(img.src);

    _texture.anisotropy = 16;
    _material = new THREE.MeshBasicMaterial({
        map: _texture,
        color: new THREE.Color(0xffffff), // White to show true texture colors
        transparent: true,
        blending: THREE.NormalBlending, // Changed for realistic look
        side: THREE.DoubleSide,
        fog: true,
        depthWrite: true,
        depthTest: true
    });
    _material.needsUpdate = true;
    return new THREE.Mesh(_geometry, _material)
}

function earthBuffer(img) {
    let globeCloudVerticesArray = [],
        globeCloud;
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < imageData.data.length; i += 4) {
        var curX = (i / 4) % canvas.width;
        var curY = ((i / 4) - curX) / canvas.width;
        if (((i / 4)) % 2 === 1 && curY % 2 === 1) {
            var color = imageData.data[i];
            if (color === 0) {
                var x = curX;
                var y = curY;
                var lat = (y / (canvas.height / 180) - 90) / -1;
                var lng = x / (canvas.width / 360) - 180;
                var position = latLongToVector3(lat, lng, consts.globeRadius, -0.1);
                globeCloudVerticesArray.push(position);
            }
        }
    }

    let globeCloudBufferGeometry = new THREE.BufferGeometry();
    var positions = new Float32Array(globeCloudVerticesArray.length * 3);
    for (var i = 0; i < globeCloudVerticesArray.length; i++) {
        positions[i * 3] = globeCloudVerticesArray[i].x;
        positions[i * 3 + 1] = globeCloudVerticesArray[i].y;
        positions[i * 3 + 2] = globeCloudVerticesArray[i].z;
    }
    // Fixed: addAttribute → setAttribute
    globeCloudBufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    let globeCloudMaterial = new THREE.PointsMaterial({
        size: 0.75,
        fog: true,
        vertexColors: true, // Fixed: THREE.VertexColors → true
        depthWrite: false
    });

    var colors = new Float32Array(globeCloudVerticesArray.length * 3);
    var globeCloudColors = [];
    
    // Define custom colors (change these to any color you want)
    var primaryColor = new THREE.Color(0x4a90e2); // Blue
    var darkenColor = new THREE.Color(0x1a3a5c);  // Dark blue
    
    for (var i = 0; i < globeCloudVerticesArray.length; i++) {
        var tempPercentage = generateRandomNumber(80, 90) * 0.01;
        // Manually interpolate between colors
        var r = primaryColor.r * tempPercentage + darkenColor.r * (1 - tempPercentage);
        var g = primaryColor.g * tempPercentage + darkenColor.g * (1 - tempPercentage);
        var b = primaryColor.b * tempPercentage + darkenColor.b * (1 - tempPercentage);
        globeCloudColors[i] = new THREE.Color(r, g, b);
    }
    for (var i = 0; i < globeCloudVerticesArray.length; i++) {
        colors[i * 3] = globeCloudColors[i].r;
        colors[i * 3 + 1] = globeCloudColors[i].g;
        colors[i * 3 + 2] = globeCloudColors[i].b;
    }
    // Fixed: addAttribute → setAttribute
    globeCloudBufferGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    globeCloud = new THREE.Points(globeCloudBufferGeometry, globeCloudMaterial);
    globeCloud.sortParticles = true;
    globeCloud.name = 'globeCloud';
    return globeCloud
}

function outerEarth(img) {
    let globeGlowSize, globeGlowTexture, globeGlowBufferGeometry, globeGlowMaterial, globeGlowMesh;

    globeGlowSize = 200;
    globeGlowTexture = new THREE.TextureLoader().load(img.src);
    globeGlowTexture.anisotropy = 2;

    globeGlowTexture.wrapS = globeGlowTexture.wrapT = THREE.RepeatWrapping;
    globeGlowTexture.magFilter = THREE.NearestFilter;
    globeGlowTexture.minFilter = THREE.NearestMipMapNearestFilter;

    // Fixed: PlaneBufferGeometry → PlaneGeometry
    globeGlowBufferGeometry = new THREE.PlaneGeometry(globeGlowSize, globeGlowSize, 1, 1);
    globeGlowMaterial = new THREE.MeshBasicMaterial({
        map: globeGlowTexture,
        color: 0x7eb3d9, // Softer blue glow
        transparent: true,
        opacity: 0.6,
        fog: false,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
    });
    globeGlowMesh = new THREE.Mesh(globeGlowBufferGeometry, globeGlowMaterial);
    globeGlowMesh.name = 'globeGlowMesh';

    return globeGlowMesh
}

function spike() {
    let spikesObject, spikesVerticesArray = [],
        spikesMaterial, spikesBufferGeometry, spikesMesh,
        spikeRadius = consts.globeRadius + 30,
        sphereSpikeRadius = consts.globeRadius + 40;

    spikesObject = new THREE.Group();
    spikesObject.name = 'spikesObject';

    var spikeTotal = 400;
    var spikeAngle = 2 * Math.PI / spikeTotal;
    for (var i = 0; i < spikeTotal; i++) {
        var vertex1 = new THREE.Vector3();
        vertex1.x = spikeRadius * Math.cos(spikeAngle * i);
        vertex1.y = 0;
        vertex1.z = spikeRadius * Math.sin(spikeAngle * i);
        vertex1.normalize();
        vertex1.multiplyScalar(spikeRadius);
        var vertex2 = vertex1.clone();
        if (i % 10 === 1) {
            vertex2.multiplyScalar(1.02);
        } else {
            vertex2.multiplyScalar(1.01);
        }
        spikesVerticesArray.push(vertex1);
        spikesVerticesArray.push(vertex2);
    }

    var positions = new Float32Array(spikesVerticesArray.length * 3);
    for (var i = 0; i < spikesVerticesArray.length; i++) {
        positions[i * 3] = spikesVerticesArray[i].x;
        positions[i * 3 + 1] = spikesVerticesArray[i].y;
        positions[i * 3 + 2] = spikesVerticesArray[i].z;
    }

    spikesMaterial = new THREE.LineBasicMaterial({
        linewidth: 1,
        color: new THREE.Color(0x5a9fd4),
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        fog: true,
        depthWrite: false,
        depthTest: false
    });

    spikesBufferGeometry = new THREE.BufferGeometry();
    // Fixed: addAttribute → setAttribute
    spikesBufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    spikesMesh = new THREE.LineSegments(spikesBufferGeometry, spikesMaterial);
    spikesObject.add(spikesMesh);

    return spikesObject
}

// NEW: Debris field around Earth
function createDebris() {
    const debrisGroup = new THREE.Group();
    debrisGroup.name = 'debrisField';
    
    const debrisCount = 2000;
    const positions = new Float32Array(debrisCount * 3);
    const colors = new Float32Array(debrisCount * 3);
    const sizes = new Float32Array(debrisCount);
    
    const minRadius = consts.globeRadius + 15;
    const maxRadius = consts.globeRadius + 80;
    
    for (let i = 0; i < debrisCount; i++) {
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Varied colors - white, gray, orange
        const colorChoice = Math.random();
        if (colorChoice < 0.6) {
            colors[i * 3] = 0.8 + Math.random() * 0.2;
            colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
            colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
        } else if (colorChoice < 0.9) {
            colors[i * 3] = 0.5 + Math.random() * 0.3;
            colors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
            colors[i * 3 + 2] = 0.5 + Math.random() * 0.3;
        } else {
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
            colors[i * 3 + 2] = 0.1;
        }
        
        sizes[i] = 0.5 + Math.random() * 2;
    }
    
    const debrisGeometry = new THREE.BufferGeometry();
    // Fixed: addAttribute → setAttribute
    debrisGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    debrisGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    debrisGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const debrisMaterial = new THREE.PointsMaterial({
        size: 1,
        sizeAttenuation: true,
        vertexColors: true, // Fixed: THREE.VertexColors → true
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const debrisMesh = new THREE.Points(debrisGeometry, debrisMaterial);
    debrisGroup.add(debrisMesh);
    
    return debrisGroup;
}

// NEW: Rotation animation function
function animateEarthRotation(earthGroup, speed = 0.001) {
    if (!earthGroup) return;
    
    function rotate() {
        earthGroup.rotation.y += speed;
        requestAnimationFrame(rotate);
    }
    
    rotate();
}

export {
    innerEarth,
    earthMap,
    earthBuffer,
    outerEarth,
    spike,
    createDebris,
    animateEarthRotation
}
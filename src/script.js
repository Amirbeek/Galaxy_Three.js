import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({width: 400, height: 400})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const listener = new THREE.AudioListener();
camera.add(listener)
/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )
// scene.add(cube)


/**
 *   Galaxy
 */

const sound = new THREE.Audio(listener);

const parameters = {
    count:100000,
    size:0.01,
    radius:5,
    branches: 3,
    spin: 1,
    randomness: 0.02,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
    rotationY : 0

}


let geometry = null
let material = null
let points = null

const generateGalaxy = ()=>{
    /*
    *  Destroy
    * */
    if (points !== null){
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    /*
     *  Geometry
     * */
    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++){
        const i3 = i * 3;

        //POSITION
        const radius = Math.random() * parameters.radius
        const spin = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI *2

        const RandomX =Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const RandomY =Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const RandomZ =Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

        positions[i3] = Math.cos(branchAngle + spin) *radius + RandomX
        positions[i3 + 1] = RandomY
        positions[i3 + 2] = Math.sin(branchAngle + spin)*radius +RandomZ


        //COLOR
        const mixColor = colorInside.clone()
        mixColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3    ] = mixColor.r
        colors[i3 + 1] = mixColor.g
        colors[i3 + 2] = mixColor.b

    }
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3))
    /**
     *  Material
     * */
    material = new THREE.PointsMaterial({
        size:parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    /**
     *  Points
     * **/
    points = new THREE.Points(geometry, material)
    scene.add(points)

}

generateGalaxy()

gui.add(parameters, 'count', 1000,1000000,100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size', 0.001,0.1,0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius', 0.01,20,0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches', 2,20,1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin', -5,5,0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness', 0,2,0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower', 1,10,0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor' ).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)
/**
 * Sizes
 */

// Load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load('./universe-space-sounds-3595.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();
});
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    const rotationSpeed = 0.003; 
    
    parameters.rotationY += rotationSpeed

    points.rotation.y = parameters.rotationY

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()
import * as THREE from 'three'
import TrackballControls from 'three-trackballcontrols'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import TWEEN from '@tweenjs/tween.js'

import createPoint from './lib/create-point'
import { getPointerXY, showTooltip } from './lib/tooltip'
import xyzFromLatLng from './lib/xyz-from-lat-lng'

import datacenters from './data/datacenters.json'

class KinstaGlobe {
  intersected = null

  constructor(container) {
    // Bind methods
    this.render = this.render.bind(this)
    this.onPointerMove = this.onPointerMove.bind(this)
    this.resize = this.resize.bind(this)
    // this.createDatacenters = this.createDatacenters.bind(this)
    this.createPoint = createPoint.bind(this)
    this.showTooltip = showTooltip.bind(this)
    this.getPointerXY = getPointerXY.bind(this)

    this.container = container

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    )
    this.camera.position.z = 9

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: document.querySelector('canvas'),
    })
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    )
    this.renderer.setPixelRatio(window.devicePixelRatio)

    this.controls = new TrackballControls(this.camera, this.renderer.domElement)
    this.controls.minDistance = 6
    this.controls.maxDistance = 10
    this.controls.noPan = true
    this.controls.update()

    // Raycaster is used to tell where the mouse is pointing in the 3d scene
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    container.addEventListener('mousemove', this.onPointerMove)

    window.addEventListener('resize', this.resize, false)

    this.createEarth()
    this.createDatacenters()
    this.render()
  }

  createEarth() {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(5, 50, 50),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          globeTexture: {
            value: new THREE.TextureLoader().load('./img/globe.jpeg'),
          },
        },
      })
    )
    sphere.rotation.y = -Math.PI / 2

    this.earth = sphere
    this.scene.add(sphere)
    return sphere
  }

  createDatacenters() {
    // Add Datacenter points
    const pointGroup = new THREE.Group()
    datacenters.forEach((dc) => {
      const point = this.createPoint(dc)
      pointGroup.add(point)
    })
    this.datacentersGroup = pointGroup
    this.scene.add(pointGroup)
    return pointGroup
  }

  onPointerMove(event) {
    const containerWidth = this.container.clientWidth
    const containerHeight = this.container.clientHeight
    this.pointer.x = (event.clientX / containerWidth) * 2 - 1
    this.pointer.y = -(event.clientY / containerHeight) * 2 + 1
  }

  resize() {
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    )
  }

  render() {
    this.controls.update()
    requestAnimationFrame(this.render)

    // Check for hovered items
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const intersects = this.raycaster.intersectObjects(
      this.datacentersGroup.children
    )

    if (intersects.length > 0) {
      if (this.intersected !== intersects[0].object) {
        if (this.intersected) {
          this.intersected.material.color.setHex(this.intersected.currentHex)
        }
        this.intersected = intersects[0].object
        this.intersected.currentHex = this.intersected.material.color.getHex()
        this.intersected.material.color.setHex(0x5333ed)
        if (this.intersected?.userData?.city) {
          const { city, name } = this.intersected.userData
          this.showTooltip(`${city} (${name})`)
        }
      }
    } else {
      if (this.intersected) {
        this.intersected.material.color.setHex(this.intersected.currentHex)
        showTooltip(false)
      }
      this.intersected = null
    }

    // Render scene
    TWEEN.update()
    this.renderer.render(this.scene, this.camera)
    if (this.intersected === null) {
      this.scene.rotation.y += -0.001
    }
  }

  // TODO: This does rotate the globe but it's odd and does not end up in the correct place.
  zoomToLatLng(lat, lng) {
    const coords = {
      x: this.scene.rotation.x,
      y: this.scene.rotation.y,
      z: this.scene.rotation.z,
    }
    const to = xyzFromLatLng(lat, lng)
    new TWEEN.Tween(coords)
      .to(to, 3000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        this.scene.rotation.x = coords.x
        this.scene.rotation.y = coords.y
        this.scene.rotation.z = coords.z
      })
      .start()
  }

  zoomToDatacenter(id) {
    const datacenter = datacenters.find((dc) => dc.name === id)
    if (datacenter) {
      this.zoomToLatLng(datacenter.latitude, datacenter.longitude)
    }
  }
}

const canvas = document.querySelector('#canvasContainer canvas')
const kinstaGlobe = new KinstaGlobe(canvas)

setTimeout(() => {
  // kinstaGlobe.zoomToLatLng(52.5, 13.4)
  kinstaGlobe.zoomToDatacenter('australia-southeast1')
}, 4000)

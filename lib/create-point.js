import * as THREE from 'three'

const size = 0.06

import xyzFromLatLng from './xyz-from-lat-lng'

const geometry = new THREE.SphereGeometry(size, 20, 20)

// TODO: We may want to add hidden points that are larger than
// the visible ones and then use that to hover the datacenter
// effectively adding a bit of padding to the hover.

function createPoint({ latitude: lat, longitude: lng, name, city }) {
  // Unique material for each point so that the color can be changed.
  const material = new THREE.MeshBasicMaterial({
    color: '#2CD4D9',
  })
  const point = new THREE.Mesh(geometry, material)

  const { x, y, z } = xyzFromLatLng(lat, lng)

  point.position.x = x
  point.position.y = y
  point.position.z = z

  point.userData.name = name
  point.userData.city = city

  return point
}

export default createPoint

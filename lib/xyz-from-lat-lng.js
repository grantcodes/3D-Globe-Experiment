// NOTE: Also used elsewhere, should be made global variable.
const radius = 5

function xyzFromLatLng(lat, lng) {
  const latitude = (lat / 180) * Math.PI
  const longitude = (lng / 180) * Math.PI
  const x = radius * Math.cos(latitude) * Math.sin(longitude)
  const y = radius * Math.sin(latitude)
  const z = radius * Math.cos(latitude) * Math.cos(longitude)
  return { x, y, z }
}

export default xyzFromLatLng

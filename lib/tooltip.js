const tooltip = document.createElement('span')
tooltip.style.display = 'none'
tooltip.style.position = 'absolute'
tooltip.style.zIndex = '10'
tooltip.style.backgroundColor = 'white'
tooltip.style.padding = '10px'
tooltip.style.borderRadius = '4px'
tooltip.style.left = '4px'
tooltip.style.top = '4px'
document.body.appendChild(tooltip)

function getPointerXY() {
  const widthHalf = this.container.clientWidth / 2
  const heightHalf = this.container.clientHeight / 2

  const x = this.pointer.x * widthHalf + widthHalf
  const y = -(this.pointer.y * heightHalf) + heightHalf

  return [x, y]
}

function showTooltip(text = null) {
  if (text) {
    tooltip.style.display = 'block'
    tooltip.innerText = text
    const [x, y] = this.getPointerXY()
    if (x < 0) {
      tooltip.style.left = 0
    } else if (x + tooltip.offsetWidth < this.container.clientWidth) {
      tooltip.style.left = x + 'px'
    } else {
      tooltip.style.left =
        this.container.clientWidth - tooltip.offsetWidth + 'px'
    }
    tooltip.style.top = y + 'px'
  } else {
    tooltip.style.display = 'none'
  }
}

export { showTooltip, getPointerXY }

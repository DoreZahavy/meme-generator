'use strict'

const gElCanvas = document.querySelector('.meme-canvas')
const gCtx = gElCanvas.getContext('2d')
const gElGallery = document.querySelector('.image-gallery')
const gElEditor = document.querySelector('.meme-editor')
const gElSavedMemes = document.querySelector('.saved-memes')

const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

var gLastPos
var gRotatePos
var gResizePos

function onInit() {
  resizeCanvas()
  addListeners()
  gElGallery.classList.add('show')

  renderKeywords()
  onCleanFilter()
  renderImages()
}

function renderKeywords() {
  const maxKey = findMaxKeyword()
  const minKey = findMinKeyword()
  const maxFSize = 3
  const minFSize = 1

  const keywordMap = getKeywordCountMap()
  var strHTML = ''
  for (const keyword in keywordMap) {
    var keyCount = keywordMap[keyword]

    // Calculate desired fontsize relative to max and min previous searches
    var fontSize =
      ((keyCount - minKey) * (maxFSize - minFSize)) / (maxKey - minKey) +
      minFSize
    strHTML += `<li onclick="onSetFilter('${keyword}')" style="font-size:${fontSize}em;">${keyword}</li>\n`
  }
  document.querySelector('.keywords-container').innerHTML = strHTML
}

function renderImages() {
  const elGrid = document.querySelector('.grid-container')
  const images = getImages()
  var strHTMLs = images.map(
    (image) => `
    <img onclick="onOpenEditor(${image.id})" src="img/bgs/${image.id}.jpg" alt="">`
  )
  elGrid.innerHTML = strHTMLs.join('')
}

function addListeners() {
  addMouseListeners()
  addTouchListeners()
  window.addEventListener('resize', () => {
    resizeCanvas()
    renderMeme()
  })
}

function addMouseListeners() {
  gElCanvas.addEventListener('mousedown', onDown)
  gElCanvas.addEventListener('mousemove', onMove)
  gElCanvas.addEventListener('mouseup', onUp)
}

function addTouchListeners() {
  gElCanvas.addEventListener('touchstart', onDown)
  gElCanvas.addEventListener('touchmove', onMove)
  gElCanvas.addEventListener('touchend', onUp)
}

function onDown(ev) {
  const pos = getEvPos(ev)

  // checking what user clicked
  if (calcDistance(pos.x, pos.y, gRotatePos) < 15) {
    setRotateMode(true)
  } else if (calcDistance(pos.x, pos.y, gResizePos) < 15) {
    setResizeMode(true)
  } else if (findLineIdx(pos)) {
    setDragMode(true)
    gLastPos = pos
  } else {
    deselect()
    document.querySelector('#line-txt').value = ''
  }
  document.body.style.cursor = 'grabbing'
  renderMeme()
}

function onMove(ev) {
  const pos = getEvPos(ev)
  // Drag rotate or resize
  if (getIsRotate()) {
    rotateLine(pos.x, pos.y)
  } else if (getIsResize()) {
    resizeLine(pos.x, pos.y, gResizePos)
  } else if (getIsDrag()) {
    const dx = pos.x - gLastPos.x
    const dy = pos.y - gLastPos.y
    moveLine(dx, dy)
    gLastPos = pos
  }
  renderMeme()
}

function onUp() {
  setDragMode(false)
  setResizeMode(false)
  setRotateMode(false)
  document.body.style.cursor = 'grab'
}

function getEvPos(ev) {
  let pos = {
    x: ev.offsetX,
    y: ev.offsetY,
  }

  if (TOUCH_EVS.includes(ev.type)) {
    ev.preventDefault()
    ev = ev.changedTouches[0]
    pos = {
      x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
      y: ev.pageY - ev.target.offsetTop - ev.target.clientTop,
    }
  }
  return pos
}

function resizeCanvas() {
  const elContainer = document.querySelector('.canvas-container')
  gElCanvas.width = elContainer.offsetWidth
  gElCanvas.height = elContainer.offsetHeight
}

function onOpenEditor(imgId) {
  gElGallery.classList.remove('show')
  gElEditor.classList.add('show')
  gElSavedMemes.classList.remove('show')
  resizeCanvas()
  renderIcons()
  document.querySelector('#line-txt').focus()
  setMeme(imgId)
  if (getMeme().lines.length === 0) addLine(gElCanvas.width / 2, 50)
  renderMeme()
}

function renderMeme() {
  const meme = getMeme()
  const img = new Image()
  if (meme.selectedImgId === 0) img.src = meme.uploadData
  else img.src = `img/bgs/${meme.selectedImgId}.jpg`
  img.onload = () => {
    gElCanvas.height = (img.naturalHeight / img.naturalWidth) * gElCanvas.width
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
    meme.lines.forEach((line, idx) => {
      placeTxt(line, idx, meme.selectedLineIdx)
    })
  }
}

function placeTxt(line, idx, selLineIdx) {
  let height = gElCanvas.height / 2
  gCtx.lineWidth = line.outline
  gCtx.strokeStyle = line.colorStroke
  gCtx.fillStyle = line.colorFill
  gCtx.font = `${line.fontSize}px ${line.font}`
  gCtx.textAlign = 'center'
  gCtx.textBaseline = 'middle'

  gCtx.save()
  gCtx.translate(line.x, line.y)
  gCtx.rotate(line.rotate)

  gCtx.fillText(line.txt, 0, 0)
  gCtx.strokeText(line.txt, 0, 0)

  if (selLineIdx === idx) markSelectedLine(line)
  gCtx.restore()
}

function markSelectedLine(line) {
  const width = gCtx.measureText(line.txt).width * 1.2
  const lineHeight = line.fontSize * 1.2
  gCtx.strokeStyle = 'white'
  gCtx.lineWidth = 2

  // Outline selected line
  gCtx.strokeRect(-width / 2, -lineHeight / 2, width, lineHeight)
  // Resize indicator
  gCtx.fillRect(-width / 2 - 5, -line.fontSize / 2 - 3, 7, -7)

  const angle = Math.atan2(-width / 2, -line.fontSize / 2)
  const dist = calcDistance(width / 2, line.fontSize / 2, { x: 0, y: 0 })

  // Saving resize indicator location
  gResizePos = {
    x: line.x + dist * Math.sin(angle - line.rotate),
    y: line.y + dist * Math.cos(-angle + line.rotate),
  }

  gCtx.stroke()
  gCtx.beginPath()

  // Rotate indicator
  gCtx.arc(0, -lineHeight * 0.8, 5, Math.PI, 2 * Math.PI)
  gCtx.stroke()

  // Saving rotate indicator location
  gRotatePos = {
    x: line.x + lineHeight * 0.8 * Math.sin(line.rotate),
    y: line.y - lineHeight * 0.8 * Math.cos(line.rotate),
  }
}

function onAddLine() {
  const width = gElCanvas.width / 2
  const height = gElCanvas.height / 2
  addLine(width, height)
  document.querySelector('#line-txt').focus()
  renderMeme()
}

function onRemoveLine() {
  removeLine()
  renderMeme()
}

function onTextInput(txt) {
  setLineTxt(txt)
  renderMeme()
}

function onSaveMeme() {
  deselect()
  renderMeme()
  setTimeout(function () {
    saveMeme()
    onOpenSaved()
  }, 1000)
}

function onDownloadCanvas() {
  deselect()
  renderMeme()
  setTimeout(downloadCanvas, 1000)
}

function downloadCanvas() {
  const data = gElCanvas.toDataURL()
  const anchor = document.createElement('a')
  anchor.href = data
  anchor.download = 'my-meme'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

function measureTextWidth(lineIdx) {
  return gCtx.measureText(gMeme.lines[lineIdx].txt).width
}

function onImgInput(ev) {
  onOpenEditor(0)
  loadImageFromInput(ev, renderMeme)
}

function loadImageFromInput(ev, onImageReady) {
  const reader = new FileReader()
  reader.onload = function (event) {
    let img = new Image()
    setImageData(event.target.result)
  }
  reader.readAsDataURL(ev.target.files[0])
}

function renderIcons() {
  const icons = getIcons()
  var strHTMLs = icons.map(
    (icon) => `
    <button class="icon-btn" onclick="onAddIcon('${icon}')">${icon}</button>
    `
  )
  document.querySelector('.icon-display').innerHTML = strHTMLs.join('')
}

function onIconCarousel(iconIdx) {
  setCarouselIdx(iconIdx)
  renderIcons()
}

function onSetFontSize(sizeDiff) {
  setFontSize(sizeDiff)
  renderMeme()
}

function onSetColorStroke(color) {
  setColorStroke(color)
  renderMeme()
}

function onSetColorFill(color) {
  setColorFill(color)
  renderMeme()
}

function onToggleOutline() {
  toggleOutline()
  renderMeme()
}

function setSelectedLine(line) {
  document.querySelector('#line-txt').value = line.txt
  document.querySelector('#colorStroke').value = line.colorStroke
  document.querySelector('#colorFill').value = line.colorFill
}

function onOpenGallery() {
  gElSavedMemes.classList.remove('show')
  gElEditor.classList.remove('show')
  gElGallery.classList.add('show')
}

function onOpenSaved() {
  gElSavedMemes.classList.add('show')
  gElEditor.classList.remove('show')
  gElGallery.classList.remove('show')
  renderSavedMemes()
}

function renderSavedMemes() {
  const savedMemes = getSavedMemes()
  const elMemesCont = document.querySelector('.memes-container')
  var strHTMLs = savedMemes.map(
    (meme, idx) => `
    <div><img onclick="onEditMeme(${idx})" src='${meme.data}' alt=""><button onclick="onRemoveSavedMeme(${idx})"><img src="img/icons/delete.png" alt=""></button></div>`
  )
  elMemesCont.innerHTML = strHTMLs.join('')
}

function onEditMeme(idx) {
  gElSavedMemes.classList.remove('show')
  gElEditor.classList.add('show')
  gElGallery.classList.remove('show')
  resizeCanvas()
  editMeme(idx)
  renderMeme()
}

function onRemoveSavedMeme(idx) {
  removeSavedMeme(idx)
  renderSavedMemes()
}

function onSetFilter(keyword) {
  setFilter(keyword)
  document.querySelector(`#filter`).value = keyword
  renderKeywords()
  renderImages()
}

function onCleanFilter() {
  document.querySelector(`#filter`).value = ''
  setFilter('')
  renderImages()
}

function onToggleFonts() {
  document.querySelector('.font-screen').classList.toggle('show')
  document.querySelector('.fonts-container').classList.toggle('expanded')
}

function onSetFont(font) {
  setFont(font)
  renderMeme()
}

function onShare() {
  if (navigator.share) {
    const title = window.document.title
    const url = window.document.location.href
    navigator.share({
      title: `${title}`,
      url: `${url}`,
      text: 'Check out this meme generator!',
    })
  } else {
    onToggleShareModal()
  }
}

function onToggleShareModal() {
  document.querySelector('.shade-screen').classList.toggle('show')
  document.querySelector('.share-modal').classList.toggle('show')
}

function onAddIcon(icon) {
  const width = gElCanvas.width / 2
  const height = gElCanvas.height / 2
  addIcon(width, height, icon)
  renderMeme()
}

function onUploadImg() {
  deselect()
  console.log('gElCanvas:', gElCanvas)
  const imgDataUrl = gElCanvas.toDataURL('image/jpeg')
  console.log('imgDataUrl:', imgDataUrl)
  function onSuccess(uploadedImgUrl) {
    const url = encodeURIComponent(uploadedImgUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${url}`)
  }
  doUploadImg(imgDataUrl, onSuccess)
}

function doUploadImg(imgDataUrl, onSuccess) {
  const formData = new FormData()
  formData.append('img', imgDataUrl)

  const XHR = new XMLHttpRequest()
  XHR.onreadystatechange = () => {
    if (XHR.readyState !== XMLHttpRequest.DONE) return
    if (XHR.status !== 200) return console.error('Error uploading image')
    const { responseText: url } = XHR
    console.log('Got back live url:', url)
    onSuccess(url)
  }
  XHR.onerror = (req, ev) => {
    console.error(
      'Error connecting to server with request:',
      req,
      '\nGot response data:',
      ev
    )
  }
  XHR.open('POST', '//ca-upload.com/here/upload.php')
  XHR.send(formData)
}

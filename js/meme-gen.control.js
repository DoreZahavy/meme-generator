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
    console.log('init!');
    resizeCanvas()
    addListeners()
    gElGallery.classList.add('show')

    onCleanFilter()
    renderImages()

}

function renderImages() {
    const elGrid = document.querySelector('.grid-container')
    const images = getImages()
    var strHTMLs = images.map(image => `
    <img onclick="onOpenEditor(${image.id})" src="img/bgs/${image.id}.jpg" alt="">`)
    elGrid.innerHTML = strHTMLs.join('')
}

function addListeners() {
    addMouseListeners()
    addTouchListeners()
    window.addEventListener('resize', () => {
        resizeCanvas()
        onOpenGallery()
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
    if (calcDistance(pos.x, pos.y, gRotatePos) < 10) {
        setRotateMode(true)
    } else if (calcDistance(pos.x, pos.y, gResizePos) < 10) {
        setResizeMode(true)
    } else if (findLineIdx(pos)) {
        setDragMode(true)
        gLastPos = pos
    } else deselect()
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
    }
    else if (getIsDrag()) {
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
    document.querySelector('#line-txt').focus()
    setMeme(imgId)
    if (getMeme().lines.length === 0) addLine(gElCanvas.width / 2, 40)
    renderMeme()
}

function renderMeme() {
    const meme = getMeme()
    const img = new Image()
    img.src = `img/bgs/${meme.selectedImgId}.jpg`
    img.onload = () => {
        gElCanvas.height = (img.naturalHeight / img.naturalWidth) * gElCanvas.width
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
        meme.lines.forEach((line, idx) => { placeTxt(line, idx, meme.selectedLineIdx) })

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
    gCtx.strokeRect(- width / 2, - lineHeight / 2, width, lineHeight)
    // Resize indicator
    gCtx.fillRect(- width / 2 - 5, - line.fontSize / 2 - 3, 7, -7)

    const angle = Math.atan2(-width / 2, -line.fontSize / 2)
    const dist = calcDistance(width / 2, line.fontSize / 2, { x: 0, y: 0 })
    // Saving resize indicator location
    gResizePos = { x: line.x + dist * Math.sin(angle - line.rotate), y: line.y + dist * Math.cos(-angle + line.rotate) }

    gCtx.stroke()
    gCtx.beginPath()
    // Rotate indicator
    gCtx.arc(0, - lineHeight * 0.8, 4, Math.PI, 2 * Math.PI)
    gCtx.stroke()

    // Saving rotate indicator location
    gRotatePos = { x: line.x + lineHeight * 0.8 * Math.sin(line.rotate), y: line.y - lineHeight * 0.8 * Math.cos(line.rotate) }
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
    setTimeout(saveMeme, 1000)
}

function downloadCanvas(elLink) {
    const data = gElCanvas.toDataURL()

    elLink.href = data
    elLink.download = 'my-meme'

}

function measureTextWidth(lineIdx) {
    return gCtx.measureText(gMeme.lines[lineIdx].txt).width
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
    var strHTMLs = savedMemes.map((meme, idx) => `
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

function onSetFilter(category) {
    setFilter(category)
    renderImages()
}

function onCleanFilter() {
    document.querySelector(`#filter`).value = ''
    setFilter('')
    renderImages()
}



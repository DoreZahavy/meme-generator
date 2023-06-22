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
    // gElCanvas.addEventListener('click',draw())
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
    console.log('hiii');

    if (calcDistance(pos.x, pos.y, gRotatePos) < 10) {
        setRotateMode(true)
        console.log('rotate');
    } else if (calcDistance(pos.x, pos.y, gResizePos) < 10) {
        // gLastPos = gResizePos
        setResizeMode(true)
        console.log('resize');
    } else if (findLineIdx(pos)) {
        setDragMode(true)
        console.log('drag');
        gLastPos = pos
    }
    document.body.style.cursor = 'grabbing'
    renderMeme()

}

function onMove(ev) {
    const isRotate = getIsRotate()
    const isResize = getIsResize()
    const isDrag = getIsDrag()
    const pos = getEvPos(ev)

    if (isRotate) {
        // gCtx.save()
        rotateLine(pos.x, pos.y)
    } else if (isResize) {
        resizeLine(pos.x, pos.y, gResizePos)
        // gLastPos = pos
    }
    else if (isDrag) {
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
        // Prevent triggering the mouse ev
        ev.preventDefault()
        // Gets the first touch point
        ev = ev.changedTouches[0]
        // Calc the right pos according to the touch screen
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop,
        }
    }
    return pos
}

function resizeCanvas() {
    console.log('hi');
    const elContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elContainer.offsetWidth
    gElCanvas.height = elContainer.offsetHeight
}

function onOpenEditor(imgId) {
    gElGallery.classList.remove('show')
    gElEditor.classList.add('show')
    gElSavedMemes.classList.remove('show')
    resizeCanvas()
    setMeme(imgId)
    if (getMeme().lines.length === 0) addLine(gElCanvas.width / 2, 40)
    renderMeme()
}

function renderMeme() {
    const meme = getMeme()
    // console.log('meme.lines:', meme.lines)

    // console.log('meme:', meme)
    // const img = document.querySelector(`.img${meme.selectedImgId}`)
    const img = new Image()
    img.src = `img/bgs/${meme.selectedImgId}.jpg`
    img.onload = () => {
        gElCanvas.height = (img.naturalHeight / img.naturalWidth) * gElCanvas.width
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
        meme.lines.forEach((line, idx) => { placeTxt(line, idx, meme.selectedLineIdx) })

    }
}

function placeTxt(line, idx, selLineIdx) {

    // const line = lines[selectedLineIdx]

    let height = gElCanvas.height / 2
    // if(idx ===0)
    gCtx.lineWidth = line.outline
    gCtx.strokeStyle = line.colorStroke
    gCtx.fillStyle = line.colorFill
    gCtx.font = `${line.fontSize}px ${line.font}`
    gCtx.textAlign = 'center'
    gCtx.textBaseline = 'middle'
    // console.log('line.rotate:', line.rotate)



    gCtx.save()
    gCtx.translate(line.x,line.y)
    // gCtx.translate(gElCanvas.width/2,gElCanvas.height/2)
    gCtx.rotate(line.rotate )
    
    
    // gCtx.fillText(line.txt, line.x, line.y)
    // gCtx.strokeText(line.txt, line.x, line.y)
    gCtx.fillText(line.txt, 0, 0)
    gCtx.strokeText(line.txt, 0, 0)
    
    if (selLineIdx === idx) markSelectedLine(line)
    
    gCtx.restore()
    // console.log('gCtx.measureText(line.txt):', gCtx.measureText(line.txt).width)
}

function markSelectedLine(line) {
    const width = gCtx.measureText(line.txt).width * 1.2
    // console.log('width:', width)
    const lineHeight = line.fontSize * 1.2
    gCtx.strokeStyle = 'white'
    gCtx.lineWidth = 2
    // gCtx.strokeRect(line.x - width / 2, line.y - lineHeight / 2, width, lineHeight)
    gCtx.strokeRect( - width / 2,  - lineHeight / 2, width, lineHeight)

    // gCtx.fillRect(line.x - width / 2 - 5, line.y - line.fontSize / 2 - 3, 7, -7)
    gCtx.fillRect( - width / 2 - 5,  - line.fontSize / 2 - 3, 7, -7)

    const angle = Math.atan2(-width/2,-line.fontSize/2)
    console.log('angle:', angle)
    const dist = calcDistance(width/2,line.fontSize/2,{x:0 , y:0})
    console.log('dist:', dist)

    gCtx.arc(dist*Math.sin((angle)),   +dist*Math.cos((-angle)), 15, 0, 2 * Math.PI)
    // gResizePos = { x: line.x - (width / 2)*Math.sin(line.rotate-angle), y: line.y - (line.fontSize / 2)*Math.cos(line.rotate-angle) }
    
    gResizePos = { x: line.x +dist*Math.sin(angle-line.rotate), y: line.y +dist*Math.cos(-angle+line.rotate) }
    console.log('gResizePos:', gResizePos)

    gCtx.stroke()
    gCtx.beginPath()
    // gCtx.arc(line.x, line.y - lineHeight * 0.65, 4, Math.PI, 2 * Math.PI)
    gCtx.arc(0, - lineHeight * 0.8, 4, Math.PI, 2 * Math.PI)
    gCtx.stroke()
    
    // gRotatePos = { x: line.x, y: line.y - lineHeight * 0.65 }
    gRotatePos = { x:line.x+ lineHeight*0.8*Math.sin(line.rotate), y: line.y- lineHeight*0.8*Math.cos(line.rotate) }
}



function onAddLine() {
    const width = gElCanvas.width / 2
    const height = gElCanvas.height / 2
    addLine(width, height)
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
    saveMeme()
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
    console.log('color', color)
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
    console.log('line:', line)
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
        <img onclick="onEditMeme(${idx})" src='${meme.data}' alt="">`
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




















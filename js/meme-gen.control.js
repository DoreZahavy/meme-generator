'use strict'

const gElCanvas = document.querySelector('.meme-canvas')
const gCtx = gElCanvas.getContext('2d')
const gElGallery = document.querySelector('.image-gallery')
const gElEditor = document.querySelector('.meme-editor')

const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

var gLastPos

function onInit() {
    console.log('init!');
    resizeCanvas()
    addListeners()
    gElGallery.classList.add('show')
    
}

function addListeners() {
    addMouseListeners()
    addTouchListeners()
    window.addEventListener('resize', resizeCanvas)
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

    findLineIdx(pos)
    
    // const {line} = getMeme()

    // document.querySelector('.line-txt').value = getSelectedTxt()
    
    setLineDrag(true)

    gLastPos = pos

    document.body.style.cursor = 'grabbing'
    renderMeme()
  
}

function onMove(ev) {
    const  isDrag  = getIsDrag()
    if (!isDrag) return
    // console.log('Moving the line')
  
    const pos = getEvPos(ev)
    // Calc the delta, the diff we moved
    const dx = pos.x - gLastPos.x
    const dy = pos.y - gLastPos.y
    moveLine(dx, dy)
    // Save the last pos, we remember where we`ve been and move accordingly
    gLastPos = pos
    // The canvas is render again after every move
    renderMeme()
}

function onUp() {

    setLineDrag(false)
    
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
    resizeCanvas()
    setMeme(imgId)
    addLine(gElCanvas.width/2, 40)
    renderMeme(imgId)
}

function renderMeme() {
    const meme = getMeme()
    
    // console.log('meme:', meme)
    // const img = document.querySelector(`.img${meme.selectedImgId}`)
    const img = new Image()
    img.src = `img/bgs/${meme.selectedImgId}.jpg`
    img.onload = () => {
        gElCanvas.height = (img.naturalHeight / img.naturalWidth) * gElCanvas.width
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
        meme.lines.forEach((line,idx) =>{placeTxt(line,idx)})
        
    }
}

function placeTxt(line,idx) {

    // const line = lines[selectedLineIdx]
    
    let height = gElCanvas.height/2
    // if(idx ===0)

    gCtx.lineWidth = 2
    gCtx.strokeStyle = line.colorStroke
    gCtx.fillStyle = line.colorFill
    gCtx.font =  `${line.fontSize}px ${line.font}`
    gCtx.textAlign = 'center'
    gCtx.textBaseline = 'middle'
    gCtx.fillText(line.txt, line.x, line.y)
    gCtx.strokeText(line.txt, line.x, line.y)
    // console.log('gCtx.measureText(line.txt):', gCtx.measureText(line.txt).width)
}

function onAddLine(){
    const width = gElCanvas.width/2
    const height = gElCanvas.height/2
    addLine(width,height)
    renderMeme()
}

function onTextInput(txt){
    setLineTxt(txt)
    renderMeme()
}

function onSaveMeme(){
    saveMeme()
}

function downloadCanvas(elLink) {

    const data = gElCanvas.toDataURL()

    elLink.href = data
    elLink.download = 'my-meme'

}

function measureTextWidth(lineIdx){
    return gCtx.measureText(gMeme.lines[lineIdx].txt).width
}

function onSetFontSize(sizeDiff){
    setFontSize(sizeDiff)
    renderMeme()
}

function onSetColorStroke(color){
    console.log('color',color)
    setColorStroke(color)
    renderMeme()
}

function onSetColorFill(color){
    setColorFill(color)
    renderMeme()
}

function setSelectedLine(line){
    console.log('line:', line)
    document.querySelector('#line-txt').value = line.txt
    document.querySelector('#colorStroke').value = line.colorStroke
    document.querySelector('#colorFill').value = line.colorFill

}



















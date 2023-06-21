'use strict'

const gElCanvas = document.querySelector('.meme-canvas')
const gCtx = gElCanvas.getContext('2d')
const gElGallery = document.querySelector('.image-gallery')
const gElEditor = document.querySelector('.meme-editor')

const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

function onInit(){
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
    // const pos = getEvPos(ev)
    // gLastPos = pos
    // setIsPainting(true)
    // console.log('pos:', pos)
    // if (!getTool().brush) draw(pos)
}

function onMove(ev) {
    // if (!getIsPainting() || !getTool().brush) return

    // const pos = getEvPos(ev)
    // draw(pos)
    // gLastPos = pos
}

function onUp() {
    // setIsPainting(false)
    // if (getTool().brush) gLineCount = 0
    // document.body.style.cursor = 'grab'
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

function renderImg(img) {
    console.log('img:', img)
    // Draw the img on the canvas
    gElCanvas.height = (img.naturalHeight / img.naturalWidth) * gElCanvas.width
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
}

function resizeCanvas() {
    console.log('hi');
    const elContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elContainer.offsetWidth
    gElCanvas.height = elContainer.offsetHeight
}

function onOpenEditor(img,imgId){
    console.log('img:', img)
    gElGallery.classList.remove('show')
    gElEditor.classList.add('show')
    resizeCanvas()
    setMeme(imgId)
    renderMeme(img)
    // renderImg(img)
}

function renderMeme(img){
    const meme = getMeme()
    gElCanvas.height = (img.naturalHeight / img.naturalWidth) * gElCanvas.width
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
}
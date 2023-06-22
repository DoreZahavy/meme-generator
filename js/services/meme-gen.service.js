'use strict'

var gImgs = [
    { id: 1, url: 'img/1.jpg', keywords: ['politics', ''] },
    { id: 2, url: 'img/2.jpg', keywords: ['friendship', 'animals'] },
    { id: 3, url: 'img/3.jpg', keywords: ['friendship', 'animals'] },
    { id: 4, url: 'img/4.jpg', keywords: ['animals', ''] },
    { id: 5, url: 'img/5.jpg', keywords: ['kids', ''] },
    { id: 6, url: 'img/6.jpg', keywords: ['crazy', ''] },
    { id: 7, url: 'img/7.jpg', keywords: ['kids', ''] },
    { id: 8, url: 'img/8.jpg', keywords: ['movies', 'cool'] },
    { id: 9, url: 'img/9.jpg', keywords: ['kids', 'funny'] },
    { id: 10, url: 'img/10.jpg', keywords: ['politics', 'funny'] },
    { id: 11, url: 'img/11.jpg', keywords: ['party', 'friendship'] },
    { id: 12, url: 'img/12.jpg', keywords: ['', ''] },
    { id: 13, url: 'img/13.jpg', keywords: ['movies', 'cool'] },
    { id: 14, url: 'img/14.jpg', keywords: ['movies', 'cool'] },
    { id: 15, url: 'img/15.jpg', keywords: ['movies', ''] },
    { id: 16, url: 'img/16.jpg', keywords: ['movies', 'funny'] },
    { id: 17, url: 'img/17.jpg', keywords: ['politics', 'evil'] },
    { id: 18, url: 'img/18.jpg', keywords: ['movies', 'friendship'] },
    { id: 19, url: 'img/18.jpg', keywords: ['', ''] },
    { id: 20, url: 'img/18.jpg', keywords: ['movies', 'party'] },
    { id: 21, url: 'img/18.jpg', keywords: ['movies', 'evil'] },
    { id: 22, url: 'img/18.jpg', keywords: ['friendship', 'party'] },
    { id: 23, url: 'img/18.jpg', keywords: ['politics', 'cool'] },
    { id: 24, url: 'img/18.jpg', keywords: ['animals', ''] },
    { id: 25, url: 'img/18.jpg', keywords: ['party', ''] }
]

const STORAGE_KEY_MEMES = 'savedMemesDB'

var gSavedMemes = _loadMemes()

var gMeme = {
    selectedImgId: 0,
    selectedLineIdx: 0,
    lines: []
}

function getSavedMemes() {
    return gSavedMemes
}

var gMode = {
    isRotate: false,
    isDrag: false,
    isResize: false
}

var gFilter

// not in use (yet)
var gKeywordSearchCountMap = { 'funny': 0, 'cat': 0, 'baby': 0 }

function setMeme(imgId) {
    gMeme.selectedImgId = imgId
}

function getMeme() {
    return gMeme
}

function getImages() {
    if (!gFilter) return gImgs
    else return gImgs.filter(img => img.keywords.includes(gFilter))
}

function setLineTxt(txt) {
    gMeme.lines[gMeme.selectedLineIdx].txt = txt
}

function addLine(x, y) {
    if (gMeme.lines.length === 1) y = (y * 2) - 40
    gMeme.lines.push(_createLine(x, y))

    selectLine(gMeme.lines.length - 1)
}

function removeLine() {
    gMeme.lines.splice(gMeme.selectedLineIdx, 1)
}

function _loadMemes() {
    let memes = loadFromStorage(STORAGE_KEY_MEMES)
    if (!memes || memes.length === 0) memes = []
    return memes
}

function saveMeme() {
    gMeme.data = gElCanvas.toDataURL()
    gSavedMemes.unshift(gMeme)
    saveSavedMemes()
}

function saveSavedMemes() {
    saveToStorage(STORAGE_KEY_MEMES, gSavedMemes)
}

function _createLine(x, y) {

    return {
        txt: 'text here',
        colorFill: '#fefefe',
        colorStroke: '#010101',
        font: 'impact1',
        fontSize: 40,
        outline: 2,
        rotate: 0,
        x,
        y,
        data: ''
    }
}

function findLineIdx({ x, y }) {

    const lineIdx = gMeme.lines.findIndex((line, lineIdx) => {
        const txtWidth = measureTextWidth(lineIdx)
        return x >= line.x - txtWidth / 2 && x <= line.x + txtWidth / 2
            && y >= line.y - line.fontSize / 2 && y <= line.y + line.fontSize / 2
    })
    if (lineIdx !== -1) {
        selectLine(lineIdx)
        return true
    }
}

function selectLine(lineIdx) {
    gMeme.selectedLineIdx = lineIdx
    setSelectedLine(gMeme.lines[gMeme.selectedLineIdx])
}

function setDragMode(isDrag) {
    gMode.isDrag = isDrag
}

function setResizeMode(isResize) {
    gMode.isResize = isResize
}

function setRotateMode(isRotate) {
    gMode.isRotate = isRotate
}

function getIsDrag() {
    return gMode.isDrag
}

function getIsResize() {
    return gMode.isResize
}

function getIsRotate() {
    return gMode.isRotate
}

function moveLine(dx, dy) {
    gMeme.lines[gMeme.selectedLineIdx].x += dx
    gMeme.lines[gMeme.selectedLineIdx].y += dy
}

function rotateLine(x, y) {
    const line = gMeme.lines[gMeme.selectedLineIdx]
    line.rotate = Math.atan2(x - line.x, line.y - y,)
}

function resizeLine(x, y, resizePos) {
    const line = gMeme.lines[gMeme.selectedLineIdx]
    const dx = x - resizePos.x
    const dy = y - resizePos.y

    const prevFSize = line.fontSize
    // Measuring change in both axis and averaging
    const yFSize = line.fontSize - dy
    const xFSize = line.fontSize *( 1 - (2 * dx) / measureTextWidth(gMeme.selectedLineIdx))

    const newSize = (yFSize + xFSize) / 2
    // Limiting font size
    if (newSize > 80) line.fontSize = 80
    else if (newSize < 25) line.fontSize = 25
    else line.fontSize = newSize
}

function getSelectedTxt() {
    return gMeme.lines[gMeme.selectedLineIdx].txt
}

function setFontSize(sizeDiff) {
    const line = gMeme.lines[gMeme.selectedLineIdx]
    line.fontSize += sizeDiff
    if (line.fontSize >= 80 || line.fontSize <= 20) line.fontSize -= sizeDiff
}

function setColorStroke(color) {
    gMeme.lines[gMeme.selectedLineIdx].colorStroke = color
}

function setColorFill(color) {
    gMeme.lines[gMeme.selectedLineIdx].colorFill = color
}

function toggleOutline() {
    const line = gMeme.lines[gMeme.selectedLineIdx]
    line.outline = (line.outline === 1) ? 2 : 1
}

function editMeme(idx) {
    gMeme = gSavedMemes[idx]
}

function removeSavedMeme(idx) {
    gSavedMemes.splice(idx, 1)
    saveSavedMemes()
}

function deselect() {
    gMeme.selectedLineIdx = -1
}

function setFilter(category) {
    gFilter = category
}
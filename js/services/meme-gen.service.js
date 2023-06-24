'use strict'

var gImgs = [
    { id: 1, url: 'img/1.jpg', keywords: ['politics', ''] },
    { id: 2, url: 'img/2.jpg', keywords: ['friendship', 'animals'] },
    { id: 3, url: 'img/3.jpg', keywords: ['friendship', 'animals'] },
    { id: 4, url: 'img/4.jpg', keywords: ['animals', ''] },
    { id: 5, url: 'img/5.jpg', keywords: ['kids', ''] },
    { id: 6, url: 'img/6.jpg', keywords: ['crazy', ''] },
    { id: 7, url: 'img/7.jpg', keywords: ['kids', ''] },
    { id: 8, url: 'img/8.jpg', keywords: ['movies', ''] },
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
const STORAGE_KEY_COUNT_MAP = 'countMapDB'

var gSavedMemes = _loadMemes()

var gMeme = {
    selectedImgId: 0,
    selectedLineIdx: 0,
    lines: [],
    uploadData: ''
}


var gMode = {
    isRotate: false,
    isDrag: false,
    isResize: false
}

var gFilter

var gKeywordSearchCountMap = _loadCountMap()

// const ICONS_PAGE_SIZE = 5
var gIconIdx = 0
var gIcons = ['😀', '🎈', '✨', '🕶', '🎩', '🎵', '💰', '🌌', '❄', '🔥', '🌠', '🍕', '🍺', '🤣', '😍', '🤑', '😢', '☠', '🐾', '🐢', '🐍']

function getSavedMemes() {
    return gSavedMemes
}

function getIcons() {
    var iconIdx = gIconIdx
    var icons = [gIcons[gIconIdx]]
    for (var i = 0; i < 4; i++) {
        iconIdx++

        if (iconIdx >= gIcons.length) iconIdx = 0
        icons[i + 1] = gIcons[iconIdx]
    }



    //  gIcons.slice(gIconIdx, gIconIdx+5)
    return icons
}

function _loadCountMap() {
    let countMap = loadFromStorage(STORAGE_KEY_COUNT_MAP)
    if (!countMap) countMap = { 'animals': 17, 'politics': 45, 'friendship': 39, 'kids': 58, 'movies': 21, 'cool': 23, 'funny': 43, 'party': 64, 'crazy': 53, 'evil': 40 }
    return countMap
}


function getKeywordCountMap() {
    return gKeywordSearchCountMap
}

function findMaxKeyword() {
    var max = -Infinity
    for (const keyword in gKeywordSearchCountMap) {
        if (gKeywordSearchCountMap[keyword] > max)
            max = gKeywordSearchCountMap[keyword]
    }
    return max
}

function findMinKeyword() {
    var min = Infinity
    for (const keyword in gKeywordSearchCountMap) {
        if (gKeywordSearchCountMap[keyword] < min)
            min = gKeywordSearchCountMap[keyword]
    }
    return min
}


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
    if (gMeme.selectedLineIdx === -1) return
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
    // Measuring change in both axes and averaging
    const yFSize = line.fontSize - dy
    const xFSize = line.fontSize * (1 - (2 * dx) / measureTextWidth(gMeme.selectedLineIdx))
    const newSize = (yFSize + xFSize) / 2

    // Limiting font size
    if (newSize > 100) line.fontSize = 100
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

function setFont(font) {
    gMeme.lines[gMeme.selectedLineIdx].font = font.toLowerCase()
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

function setFilter(keyword) {
    gKeywordSearchCountMap[keyword]++
    gFilter = keyword
    saveToStorage(STORAGE_KEY_COUNT_MAP, gKeywordSearchCountMap)
}

function setImageData(data) {
    gMeme.uploadData = data
}

function addIcon(x, y, icon) {

    gMeme.lines.push(_createIcon(x, y, icon))

    selectLine(gMeme.lines.length - 1)
}

function _createIcon(x, y, icon) {
    return {
        txt: icon,
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

function setCarouselIdx(iconIdx) {
    gIconIdx += iconIdx
    if (gIconIdx >= gIcons.length) gIconIdx = 0
    if (gIconIdx < 0) gIconIdx = gIcons.length - 1
}
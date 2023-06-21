'use strict'

var gImgs = [
    { id: 1, url: 'img/1.jpg', keywords: ['politics', ''] },
    { id: 2, url: 'img/2.jpg', keywords: ['friends', 'animals'] },
    { id: 3, url: 'img/3.jpg', keywords: ['friends', 'animals'] },
    { id: 4, url: 'img/4.jpg', keywords: ['animals', 'cats'] },
    { id: 5, url: 'img/5.jpg', keywords: ['kids', 'cat'] },
    { id: 6, url: 'img/6.jpg', keywords: ['science', 'crazy'] },
    { id: 7, url: 'img/7.jpg', keywords: ['kids', ''] },
    { id: 8, url: 'img/8.jpg', keywords: ['movie', ''] },
    { id: 9, url: 'img/9.jpg', keywords: ['kids', 'funny'] },
    { id: 10, url: 'img/10.jpg', keywords: ['politics', 'funny'] },
    { id: 11, url: 'img/11.jpg', keywords: ['', 'friends'] },
    { id: 12, url: 'img/12.jpg', keywords: ['', ''] },
    { id: 13, url: 'img/13.jpg', keywords: ['movies', 'cool'] },
    { id: 14, url: 'img/14.jpg', keywords: ['movies', 'cool'] },
    { id: 15, url: 'img/15.jpg', keywords: ['movies', ''] },
    { id: 16, url: 'img/16.jpg', keywords: ['movies', 'funny'] },
    { id: 17, url: 'img/17.jpg', keywords: ['politics', 'cool'] },
    { id: 18, url: 'img/18.jpg', keywords: ['movies', 'friends'] }
]

var gSavedMemes = []

var gMeme = {
    selectedImgId: 0,
    selectedLineIdx: 0,
    lines: [
        {
            txt: 'text here',
            size: 20,
            colorFill: 'white',
            colorStroke: 'black',
            font: 'impact',
            fontSize: 40
        }
    ]
}

var gKeywordSearchCountMap = { 'funny': 0, 'cat': 0, 'baby': 0 }


function setMeme(imgId){
gMeme.selectedImgId = imgId
}

function getMeme(){
    return gMeme
}

function setLineTxt(txt){
    gMeme.lines[gMeme.selectedLineIdx].txt = txt
    console.log('txt:', txt)
    console.log('gMeme.lines[gMeme.selectedLineIdx].txt:', gMeme.lines[gMeme.selectedLineIdx].txt)
}
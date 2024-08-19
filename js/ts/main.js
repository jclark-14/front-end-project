"use strict";
const API_KEY = 'AIzaSyDFMMKvQu9eI1apQkQDi__onjn2vhhV-hU';
const $submitSearch = document.querySelector('#submit');
const $landing = document.querySelector('#landing');
const $formInputs = document.querySelectorAll('select');
const $main = document.querySelector('main');
const $iFrameLg = document.querySelector('.lg-screen');
const $iFrameMobile = document.querySelector('.mobile');
const $img = document.querySelectorAll('img');
const $dialog = document.querySelector('dialog');
const $body = document.querySelector('body');
const $form = document.querySelector('form');
const $search = document.querySelector('#search');
const $favorites = document.querySelector('#favorites');
const $resultsNav = document.querySelector('#results');
const $xIcon = document.querySelector('.iconX');
const $results = document.querySelector('#results-container');
const $videosDiv = document.querySelector('.videos-div');
const $pNoFavorites = document.querySelector('.pfav');
const $subHeading = document.getElementById('subheading');
const $modalHeart = document.getElementById('modal-outline-heart');
// const $modalHeartSolid = document.getElementById('modal-solid-heart');
if (!$submitSearch ||
    !$iFrameLg ||
    !$iFrameMobile ||
    !$img ||
    !$dialog ||
    !$landing ||
    !$formInputs ||
    !$main ||
    !$form ||
    !$body ||
    !$xIcon ||
    !$search ||
    !$results ||
    !$favorites ||
    !$videosDiv ||
    !$pNoFavorites ||
    !$resultsNav ||
    !$subHeading ||
    !$modalHeart
// !$modalHeartSolid
)
    throw new Error('HTML query failed');
let url;
let render;
const favorite = true || false;
function createUrl() {
    const inputs = {
        level: $formInputs[0].value,
        category: $formInputs[1].value,
        length: $formInputs[2].value,
        focus: $formInputs[3].value,
    };
    const baseKeywords = [
        'yoga',
        'exercise',
        'sarah|adriene|charlie|annanas|madfit',
    ];
    const keywords = [...baseKeywords];
    if (inputs.level)
        keywords.push(inputs.level);
    if (inputs.category)
        keywords.push(inputs.category);
    if (inputs.length)
        keywords.push(inputs.length);
    if (inputs.focus)
        keywords.push(inputs.focus);
    const query = keywords
        .map((keyword) => encodeURIComponent(keyword))
        .join('+');
    url = `https://www.googleapis.com/youtube/v3/search?part=snippet&videoEmbeddable=true&type=video&q=${query}&maxResults=6&key=${API_KEY}`;
}
async function searchYouTube() {
    try {
        createUrl();
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        data.searchArr.length = 0;
        const videos = await response.json();
        videos.items.forEach((item) => {
            const id = item.id.videoId;
            const title = item.snippet.title;
            const description = item.snippet.description;
            const thumbnail = item.snippet.thumbnails.high.url;
            const channel = item.snippet.channelTitle;
            const channelId = item.snippet.channelId;
            const video = {
                id,
                title,
                description,
                thumbnail,
                channel,
                channelId,
                favorite,
            };
            data.searchArr.push(video);
        });
        for (let i = 0; i < data.searchArr.length; i++) {
            const videoId = data.searchArr[i].id;
            const matched = data.favoritesArr.find((element) => element.id === videoId);
            if (matched) {
                data.searchArr[i].favorite = true;
            }
            else if (!matched) {
                data.searchArr[i].favorite = false;
            }
        }
        writeJSON();
        renderVideos(render);
        viewResults();
    }
    catch (error) {
        console.error('Error:', error);
    }
}
$body.addEventListener('click', (event) => {
    const $thumbnail = document.querySelectorAll('.thumbnail');
    const eventTarget = event.target;
    readJSON();
    if (eventTarget === $submitSearch) {
        event.preventDefault();
        render = 'search';
        searchYouTube();
        $form?.reset();
    }
    if (eventTarget === $xIcon) {
        $dialog.close();
        $iFrameLg.setAttribute('src', '');
        $iFrameMobile.setAttribute('src', '');
    }
    if ($thumbnail) {
        for (let i = 0; i < $thumbnail.length; i++) {
            if (eventTarget === $thumbnail[i]) {
                $dialog.showModal();
                const videoId = eventTarget.dataset.id;
                $modalHeart.setAttribute('data-id', videoId);
                const formattedStr = `https://www.youtube.com/embed/${videoId}`;
                $iFrameLg.setAttribute('src', formattedStr);
                $iFrameMobile.setAttribute('src', formattedStr);
                let video = data.favoritesArr.find((element) => element.id === eventTarget.dataset.id);
                if (!video) {
                    video = data.searchArr.find((element) => element.id === eventTarget.dataset.id);
                }
                if (video?.favorite) {
                    $modalHeart.setAttribute('class', 'fa-solid fa-heart fa-xl modal-heart-outline heart absolute left-2 top-10');
                }
                else if (!video?.favorite) {
                    $modalHeart.setAttribute('class', 'fa-regular fa-heart fa-xl modal-heart-outline heart absolute left-2 top-10');
                }
            }
        }
    }
    if (eventTarget.matches('.heart')) {
        toggleFavorite(eventTarget);
        toggleHeart(eventTarget);
    }
    if (eventTarget === $favorites) {
        viewFavorites();
        render = 'favorites';
        renderVideos(render);
    }
    if (eventTarget === $search) {
        render = 'search';
        viewLanding();
    }
    if (eventTarget === $resultsNav) {
        render = 'search';
        renderVideos(render);
        viewResults();
    }
});
$dialog.addEventListener('dblclick', (event) => {
    const eventTarget = event.target;
    if (eventTarget === $dialog) {
        $dialog.close();
        $iFrameLg.setAttribute('src', '');
        $iFrameMobile.setAttribute('src', '');
    }
});
document.addEventListener('DOMContentLoaded', () => {
    readJSON();
    if (data.viewIndex === 2) {
        render = 'search';
    }
    else if (data.viewIndex === 3) {
        render = 'favorites';
    }
    renderVideos(render);
    if (data.viewIndex === 1) {
        viewLanding();
    }
    else if (data.viewIndex === 2) {
        viewResults();
    }
    else if (data.viewIndex === 3) {
        viewFavorites();
    }
});
function viewLanding() {
    $landing?.setAttribute('class', 'container md:pt-14 px-4 md:px-0 pt-8 mx-auto flex flex-wrap md:flex-nowrap max-w-screen-lg');
    $results?.setAttribute('class', 'container hidden md:hidden');
    data.viewIndex = 1;
    writeJSON();
}
function viewResults() {
    $results?.setAttribute('class', 'results-container');
    $landing?.setAttribute('class', 'hidden md:hidden container md:pt-14 px-4 md:px-0 pt-8 mx-auto flex flex-wrap md:flex-nowrap max-w-screen-lg');
    if (data.searchArr[0]) {
        $pNoFavorites?.setAttribute('class', 'hidden md:hidden text-lg text-center w-full mt-10');
    }
    else if (!data.searchArr[0]) {
        $pNoFavorites?.setAttribute('class', 'text-lg text-center w-full mt-10');
    }
    if ($pNoFavorites)
        $pNoFavorites.innerHTML = 'No results found.';
    if ($subHeading)
        $subHeading.textContent = 'Results';
    data.viewIndex = 2;
    writeJSON();
}
function viewFavorites() {
    $results?.setAttribute('class', 'results-container');
    $landing?.setAttribute('class', 'hidden md:hidden container md:pt-14 px-4 md:px-0 pt-8 mx-auto flex flex-wrap md:flex-nowrap max-w-screen-lg');
    if (data.favoritesArr[0]) {
        $pNoFavorites?.setAttribute('class', 'hidden md:hidden text-lg text-center w-full mt-10');
    }
    else if (!data.favoritesArr[0] && $pNoFavorites) {
        $pNoFavorites.setAttribute('class', ' text-lg text-center w-full mt-10');
        $pNoFavorites.textContent = 'No videos saved to favorites.';
    }
    if ($subHeading)
        $subHeading.textContent = 'Favorites';
    data.viewIndex = 3;
    writeJSON();
}
function toggleFavorite(eventTarget) {
    readJSON();
    if (eventTarget.matches('.heart')) {
        let video = data.searchArr.find((video) => video.id === eventTarget.dataset.id);
        if (!video)
            video = data.favoritesArr.find((video) => video.id === eventTarget.dataset.id);
        if (video.favorite === true) {
            video.favorite = false;
            data.favoritesArr.splice(data.favoritesArr.indexOf(video), 1);
        }
        else if (video.favorite === false) {
            video.favorite = true;
            data.favoritesArr.push(video);
        }
    }
    writeJSON();
}
function toggleHeart(eventTarget) {
    let video = data.searchArr.find((element) => element.id === eventTarget.dataset.id);
    if (!video) {
        video = data.favoritesArr.find((element) => element.id === eventTarget.dataset.id);
    }
    if (eventTarget === $modalHeart && video?.favorite === false) {
        $modalHeart.setAttribute('class', 'fa-regular fa-heart fa-xl modal-heart-outline heart absolute left-2 top-10');
    }
    else if (eventTarget === $modalHeart && video?.favorite === true) {
        $modalHeart.setAttribute('class', 'fa-solid fa-heart fa-xl modal-heart-outline heart absolute left-2 top-10');
    }
    else if (video?.favorite === false) {
        eventTarget.setAttribute('class', 'fa-regular fa-heart fa-lg float-right heart pr-2 outline-heart');
    }
    else if (video?.favorite === true) {
        eventTarget.setAttribute('class', 'fa-solid fa-heart fa-lg float-right pr-2 heart solid-heart');
    }
}
function renderVideos(render) {
    readJSON();
    const $videoCont = document.querySelector('.vidContainer');
    if ($videoCont) {
        $videoCont.remove();
    }
    let renderVid = [];
    if (render === 'search') {
        renderVid = data.searchArr;
    }
    else if (render === 'favorites') {
        renderVid = data.favoritesArr;
    }
    const $vidContainer = $videosDiv.appendChild(document.createElement('div'));
    $vidContainer.setAttribute('class', 'vidContainer mx-auto flex flex-wrap md:justify-between justify-center w-full');
    for (let i = 0; i < renderVid.length; i++) {
        const $videoContainer = $vidContainer.appendChild(document.createElement('div'));
        if (!$videoContainer)
            throw new Error('$videoContainer creation error');
        $videoContainer.setAttribute('class', 'video-div basis-1/3 mb-8');
        const $videoAnchor = $videoContainer.appendChild(document.createElement('a'));
        if (!$videoAnchor)
            throw new Error('$videoAnchor creation error');
        $videoAnchor.setAttribute('href', '#');
        $videoAnchor.setAttribute('class', 'video');
        const $thumbnail = $videoAnchor.appendChild(document.createElement('img'));
        if (!$thumbnail)
            throw new Error('$thumbnail creation error');
        $thumbnail.setAttribute('class', 'h-fit rounded-sm w-80 thumbnail');
        $thumbnail.setAttribute('src', renderVid[i].thumbnail);
        $thumbnail.setAttribute('data-id', renderVid[i].id);
        const $videoText = $videoContainer.appendChild(document.createElement('div'));
        if (!$videoText)
            throw new Error('unable to create $videoText');
        $videoText.setAttribute('class', 'video-text w-80 pl-1 pt-1');
        const $channelHeartsDiv = $videoText.appendChild(document.createElement('p'));
        if (!$channelHeartsDiv)
            throw new Error('unable to create $hearts');
        $channelHeartsDiv.setAttribute('class', 'flex justify-between items-center');
        const $channelAnchor = $channelHeartsDiv.appendChild(document.createElement('a'));
        if (!$channelAnchor)
            throw new Error('unable to create $channelAnchor');
        $channelAnchor?.setAttribute('href', `https://www.youtube.com/channel/${renderVid[i].channelId}`);
        $channelAnchor.setAttribute('class', 'channelAnchor');
        $channelAnchor.setAttribute('target', '_blank');
        const $heartAnchor = $channelHeartsDiv.appendChild(document.createElement('a'));
        if (!$heartAnchor)
            throw new Error('$heartAnchor not present');
        $heartAnchor.setAttribute('href', '#');
        const $heartSolid = $heartAnchor.appendChild(document.createElement('i'));
        const $heartOutline = $heartAnchor.appendChild(document.createElement('i'));
        if (!$heartSolid || !$heartOutline)
            throw new Error('$heart not created');
        if (renderVid[i].favorite) {
            $heartSolid.setAttribute('class', 'fa-solid fa-heart fa-lg float-right heart pr-2 solid-heart');
            $heartOutline.setAttribute('class', 'fa-regular fa-heart fa-lg float-right pr-2 heart md:hidden hidden outline-heart');
        }
        else if (!renderVid[i].favorite) {
            $heartSolid.setAttribute('class', 'fa-solid fa-heart fa-lg float-right heart pr-2 solid-heart md:hidden hidden');
            $heartOutline.setAttribute('class', 'fa-regular fa-heart fa-lg float-right heart pr-2 outline-heart');
        }
        $heartSolid.setAttribute('style', 'color: #403768');
        $heartSolid.setAttribute('data-id', renderVid[i].id);
        $heartOutline.setAttribute('style', 'color: #403768');
        $heartOutline.setAttribute('data-id', renderVid[i].id);
        const $channel = $channelAnchor.appendChild(document.createElement('span'));
        if (!$channel)
            throw new Error('unable to create $channel');
        $channel.setAttribute('class', 'font-medium text-lg underline channel');
        $channel.innerHTML = renderVid[i].channel;
        const $title = $videoText.appendChild(document.createElement('p'));
        if (!$title)
            throw new Error('unable to create $title');
        $title.setAttribute('class', 'font-normal text-md pr-4');
        $title.innerHTML = ' ' + renderVid[i].title;
    }
    return $videosDiv;
}

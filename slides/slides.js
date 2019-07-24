let slides = [];
let slideIndex = 0;
let subslide = 0;
let finished = false;

function getDescendants(elem) {
    return $($(elem).find("[data-show],[data-hide]"));
}

function uiUpdate() {
    const slideName = slides[slideIndex].elem.attributes['data-slide'].value;
    const totalSub = slides[slideIndex].length - 1;
    const slideProgress = (totalSub >= 0) ? `(${subslide+1}/${totalSub+1})` : '';
    $('#slide').text(slideName + ' ' + slideProgress);
}

function resetSlide(slide) {
    if (!slide) return;
    const elem = slide.elem;
    getDescendants(elem).hide();
}

// Move from one slide to another.
function toSlide(n) {
    resetSlide(slides[slideIndex]);
    $(slides[slideIndex].elem).hide();

    // Change slide.
    slideIndex = n;
    resetSlide(slides[slideIndex]);
    if (slides[slideIndex]) $(slides[slideIndex].elem).show();

    // Update UI.
    uiUpdate();

    subslide = 0;
    finished = false;
    next();
}

function slidePrompt() {
    let res = prompt("Which slide?");
    let slideNum = parseInt(res, 10);
    if (slideNum >= 0 && slideNum < slides.length) toSlide(slideNum);
}

// Show everything for the current slide/subslide, then increment.
// If there isn't anything left to do, move to the next slide.
function next() {
    if (finished || !slides[slideIndex]) return;
    uiUpdate();
    const currentAnimations = slides[slideIndex];
    if (subslide >= currentAnimations.length) {
        // If we're at the end of the presentation, hooray!
        // Set finished and do no more.
        if (slideIndex >= slides.length - 1) {
            finished = true;
            return;
        }
        // Else we move on.
        toSlide(slideIndex+1);
        return;
    }
    if (currentAnimations) {
        $(currentAnimations.shows[subslide]).show();
        $(currentAnimations.hides[subslide]).hide();
    }
    subslide++;
}

function addAtIndex(list, elem, index) {
    if (list[index]) {
        list[index].push(elem);
    } else {
        list[index] = [elem];
    }
    return list;
}

window.onload = () => {
    // Get all the slides on this page.
    let slidesList = [];
    $('[data-slide]').each((_, elem) => {
        const slide = elem.attributes['data-slide'];
        if (slide && $.inArray(elem, slidesList) < 0) {
            slidesList.push(elem);
        }
    });
    // Set up a list of timings for each slide.
    slides = slidesList.map((elem) => {
        $(elem).hide();
        let shows = [];
        let hides = [];
        const descendants = getDescendants(elem);
        for (const desc of descendants) {
            // Look for data-show. If no show, put it to show at zero.
            $(desc).hide();
            const attrs = desc.attributes;
            if (attrs['data-show']) {
                const val = parseInt(attrs['data-show'].value);
                shows = addAtIndex(shows, desc, val);
            } else {
                shows = addAtIndex(shows, desc, 0);
            }
            // Look for data-hide in a similar vein.
            if (attrs['data-hide']) {
                const val = parseInt(attrs['data-hide'].value);
                hides = addAtIndex(hides, desc, val);
            }
        }
        const length = Math.max(shows.length, hides.length);
        for (let i=0; i<length; i++) {
            if (!shows[i]) shows[i] = [];
            if (!hides[i]) hides[i] = [];
        }
        return {elem, shows, hides, length};
    });
    // Show our opening slide.
    $(slides[0].elem).show();
    uiUpdate();
    next();
    $('body').keypress((e) => {
        if (e.which == 13) next();
    })
}
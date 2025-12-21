// Map names utility
export const MAP_NAMES = {
    1: 'Erangle',
    2: 'Miramar',
    3: 'Rondo',
    4: 'Sanhok',
    5: 'Other'
};

export const getMapName = (matchNumber) => {
    return MAP_NAMES[matchNumber] || 'Unknown';
};

export const MAP_IMAGES = {
    1: '/images/maps/erangel.png',
    2: '/images/maps/miramar.png',
    3: '/images/maps/rondo.png',
    4: '/images/maps/sanhok.png',
    5: '/images/maps/other.png'
};

export const getMapImage = (matchNumber) => {
    return MAP_IMAGES[matchNumber] || MAP_IMAGES[5];
};

export const MAP_THUMBNAILS = {
    1: '/images/thumbnails/thumb_erangel_1766320272474.png',
    2: '/images/thumbnails/thumb_miramar_1766320291167.png',
    3: '/images/thumbnails/thumb_rondo_1766320342029.png',
    4: '/images/thumbnails/thumb_sanhok_1766320309872.png',
    5: '/images/thumbnails/thumb_other_1766320395265.png',
    6: '/images/thumbnails/thumb_vikendi_1766320326215.png'
};

export const getMapThumbnail = (matchNumber) => {
    return MAP_THUMBNAILS[matchNumber] || MAP_THUMBNAILS[5];
};

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

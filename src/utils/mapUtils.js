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

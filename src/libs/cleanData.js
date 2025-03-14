
export const cleanData = (data) => {
    const cleanedData = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            if (typeof data[key] === 'string') {
                cleanedData[key] = data[key].trim();
            } else {
                cleanedData[key] = data[key];
            }
        }
    }
    return cleanedData;
}



export const numberToDataSize = (num: number | null | undefined): string => {
	if (num === null || num === undefined) {
		return '0 B';
	}

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = num;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;

};
import { composeStaticUrl, authenticatedImageFetch } from '@/utilities/apiClient';

export const toAbsoluteImageUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }

  return composeStaticUrl(url);
};

export const isProtectedImageUrl = (url: string): boolean => url.includes('/api/image/');

export const revokeBlobUrl = (url: string) => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

export const revokeBlobUrls = (urls: string[]) => {
  urls.forEach(revokeBlobUrl);
};

export const resolveImageSrc = async (url?: string): Promise<string> => {
  if (!url) {
    return '';
  }

  const requestUrl = toAbsoluteImageUrl(url);

  if (!isProtectedImageUrl(requestUrl)) {
    return requestUrl;
  }

  try {
    const response = await authenticatedImageFetch(requestUrl);
    if (!response.ok) {
      return '';
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return '';
  }
};

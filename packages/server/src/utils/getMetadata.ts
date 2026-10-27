import ogs from 'open-graph-scraper';

export async function getMetadata(url: string) {
    const options = {
        url,
        timeout: 10000,
        fetchOptions: {
            headers: {
                // This header is vital to prevent Mango/Notino from blocking the request
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            },
        },
    };

    try {
        const { result } = await ogs(options);
        return {
            // We grab the first available image URL
            image: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || null,
        };
    } catch (error) {
        console.error('Error fetching metadata:', error);
        return { image: null };
    }
}
// src/lib/literature.ts
'use server';

export interface LiteratureItem {
    id: string;
    name: string;
    type: 'Story Book' | 'Magazine' | 'Journal' | 'Report';
    embed_url: string;
    cover_page_url?: string;
}

const API_URL = 'https://api.jsonsilo.com/public/f8162a92-bce8-41da-b535-54924b5af7b7';

async function fetchData(): Promise<{ ltt: Omit<LiteratureItem, 'id'>[] } | null> {
    try {
        const response = await fetch(API_URL, { next: { revalidate: 3600 } });
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching data from API:", error);
        return null;
    }
}

export async function fetchLiterature(): Promise<LiteratureItem[]> {
    const responseData = await fetchData();
    if (!responseData || !responseData.ltt) return [];

    const data: Omit<LiteratureItem, 'id'>[] = responseData.ltt;
    return data.map((item) => {
        return {
            ...item,
            id: item.name.toLowerCase().replace(/\s+/g, '-'),
        };
    });
}

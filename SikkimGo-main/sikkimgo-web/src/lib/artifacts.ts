// src/lib/artifacts.ts
'use server';

export interface Artifact {
    id: string;
    name: string;
    desc: string;
    url: string;
}

const API_URL = 'https://api.jsonsilo.com/public/f8162a92-bce8-41da-b535-54924b5af7b7';

async function fetchData(): Promise<{ atf: Omit<Artifact, 'id'>[] } | null> {
    try {
        const response = await fetch(API_URL, { next: { revalidate: 3600 } });
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching artifact data from API:", error);
        return null;
    }
}

export async function fetchArtifacts(): Promise<Artifact[]> {
    const responseData = await fetchData();
    if (!responseData || !responseData.atf) return [];

    const data: Omit<Artifact, 'id'>[] = responseData.atf;
    return data.map((item) => {
        return {
            ...item,
            id: item.name.toLowerCase().replace(/\s+/g, '-'),
        };
    });
}

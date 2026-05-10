export interface Lake {
  id: string;
  name: string;
  img: string;
  desc: string;
}

const API_URL = 'https://api.jsonsilo.com/public/f8162a92-bce8-41da-b535-54924b5af7b7';

async function fetchData() {
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

export async function fetchLakes(): Promise<Lake[]> {
    const responseData = await fetchData();
    if (!responseData || !responseData.lakes) return [];

    const data: Omit<Lake, 'id'>[] = responseData.lakes;
    return data.map((lake) => {
        return {
            ...lake,
            id: lake.name.toLowerCase().replace(/\s+/g, '-'),
        };
    });
}

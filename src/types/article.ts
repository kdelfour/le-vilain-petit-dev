export interface Article {
    slug: string;
    data: {
        pubDate: string;
        cover: string;
        title: string;
        description: string;
    };
}
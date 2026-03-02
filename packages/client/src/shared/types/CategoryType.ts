
export type Category = {
    id: number;
    name: string;
    userId?: number;
};

export enum CategoryName {
    OTHER = "Other",
    BOOKS = "Books",
    FILMS = "Films",
    CLOTHES = "Clothes",
    BEAUTY = "Beauty",
}

export const CATEGORY_ID: Record<CategoryName, number> = {
    [CategoryName.OTHER]:   1,
    [CategoryName.BOOKS]:   2,
    [CategoryName.FILMS]:   3,
    [CategoryName.CLOTHES]: 4,
    [CategoryName.BEAUTY]:  5,
};
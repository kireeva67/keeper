
export type Category = {
    id: number;
    name: string;
    color: string;
    userId?: number;
    _count?: { products: number };
};

export enum CategoryName {
    OTHER = "Other",
    BOOKS = "Books",
    FILMS = "Films",
    CLOTHES = "Clothes",
    BEAUTY = "Beauty",
    STUDY = "Study",
    WORK = "Work",
    PRESENTS = "Presents",
    SPORT = "Sport",
    ACCESSORIES = "Accessories",
    ELECTRONICS = "Electronics",
}

export const CATEGORY_ID: Record<CategoryName, number> = {
    [CategoryName.OTHER]: 1,
    [CategoryName.BOOKS]: 2,
    [CategoryName.FILMS]: 3,
    [CategoryName.CLOTHES]: 4,
    [CategoryName.BEAUTY]: 5,
    [CategoryName.STUDY]: 6,
    [CategoryName.WORK]: 7,
    [CategoryName.PRESENTS]: 8,
    [CategoryName.SPORT]: 9,
    [CategoryName.ACCESSORIES]: 10,
    [CategoryName.ELECTRONICS]: 11,
};
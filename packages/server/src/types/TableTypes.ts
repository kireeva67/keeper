export type TTableUserData = {
    id: number;
    email: string;
    password: string;
    hasPassword: boolean;
}

export type TTableProductData = {
    title: string;
    description?: string;
    url: string;
    imageUrl?: string | null;
    categoryId: number;
}

export type TTableCategoryData = {
    name: string;
    color: string;
}
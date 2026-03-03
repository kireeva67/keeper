import { useEffect, useState } from "react";
import type { Category } from "../../../shared/types/CategoryType";
import { getCategoriesForUser } from "./getCategories";

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await getCategoriesForUser();
                setCategories(categories);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const addCategory = (category: Category) => {
        setCategories(prev => [...prev, category]);
    };

    return { categories, addCategory };
}
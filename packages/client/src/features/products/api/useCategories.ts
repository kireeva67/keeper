import { useEffect, useState } from "react";
import { CATEGORY_ID, type Category } from "../../../shared/types/CategoryType";
import { getCategoriesForUser } from "./getCategories";
import { http } from "../../../shared/api/http";

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);

    const deleteCategory = async (id: number) => {
        const success = await http(`/api/categories/${id}`, { method: "DELETE" });
        if (success) {
            setCategories(prev => prev.filter(c => c.id !== id));
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await getCategoriesForUser();
                setCategories(categories);
            } catch {
                // 401 handled globally via onUnauthorized redirect
            }
        };
        fetchCategories();
    }, []);

    const addCategory = (category: Category) => {
        setCategories(prev => [...prev, category]);
    };

    const otherCategory = () => {
        return categories.find(c => c.id === CATEGORY_ID.Other);
    }

    const customCategories = categories.filter(c => c.userId);

    return { categories, addCategory, customCategories, deleteCategory, otherCategory };
}
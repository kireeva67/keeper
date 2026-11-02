import { ValidationError } from "../error/ValidationError";

// Keep the limits in sync with FieldLimits in packages/client.
export class FieldValidator {
    static readonly titleMaxLength = 120;
    static readonly descriptionMaxLength = 500;
    static readonly categoryNameMaxLength = 24;

    static assertProductFields(body: { title?: unknown; description?: unknown }) {
        this.assertRequiredText(body.title, 'Title', this.titleMaxLength);
        if (body.description != null) {
            this.assertText(body.description, 'Description', this.descriptionMaxLength);
        }
    }

    static assertCategoryFields(body: { name?: unknown }) {
        this.assertRequiredText(body.name, 'Category name', this.categoryNameMaxLength);
    }

    private static assertRequiredText(value: unknown, label: string, maxLength: number) {
        if (value == null) {
            throw new ValidationError(`${label} is required.`);
        }
        this.assertText(value, label, maxLength);
        if (!(value as string).trim()) {
            throw new ValidationError(`${label} is required.`);
        }
    }

    private static assertText(value: unknown, label: string, maxLength: number) {
        if (typeof value !== 'string') {
            throw new ValidationError(`${label} must be text.`);
        }
        if (value.length > maxLength) {
            throw new ValidationError(`${label} must be at most ${maxLength} characters.`);
        }
    }
}

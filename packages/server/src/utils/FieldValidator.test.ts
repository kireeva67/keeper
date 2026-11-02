import { FieldValidator } from "./FieldValidator";
import { ValidationError } from "../error/ValidationError";

describe('FieldValidator.assertProductFields', () => {
    it('accepts a title and description at the limits', () => {
        expect(() => FieldValidator.assertProductFields({
            title: 'a'.repeat(120),
            description: 'b'.repeat(500),
        })).not.toThrow();
    });

    it('accepts a missing or null description', () => {
        expect(() => FieldValidator.assertProductFields({ title: 'Lamp' })).not.toThrow();
        expect(() => FieldValidator.assertProductFields({ title: 'Lamp', description: null })).not.toThrow();
    });

    it('rejects a title over 120 characters', () => {
        expect(() => FieldValidator.assertProductFields({ title: 'a'.repeat(121) }))
            .toThrow(new ValidationError('Title must be at most 120 characters.'));
    });

    it('rejects a description over 500 characters', () => {
        expect(() => FieldValidator.assertProductFields({ title: 'Lamp', description: 'b'.repeat(501) }))
            .toThrow(new ValidationError('Description must be at most 500 characters.'));
    });

    it('rejects a missing or blank title', () => {
        expect(() => FieldValidator.assertProductFields({}))
            .toThrow(new ValidationError('Title is required.'));
        expect(() => FieldValidator.assertProductFields({ title: '   ' }))
            .toThrow(new ValidationError('Title is required.'));
    });

    it('rejects non-string values', () => {
        expect(() => FieldValidator.assertProductFields({ title: 42 }))
            .toThrow(new ValidationError('Title must be text.'));
        expect(() => FieldValidator.assertProductFields({ title: 'Lamp', description: ['x'] }))
            .toThrow(new ValidationError('Description must be text.'));
    });
});

describe('FieldValidator.assertCategoryFields', () => {
    it('accepts a name at the limit', () => {
        expect(() => FieldValidator.assertCategoryFields({ name: 'c'.repeat(24) })).not.toThrow();
    });

    it('rejects a name over 24 characters', () => {
        expect(() => FieldValidator.assertCategoryFields({ name: 'c'.repeat(25) }))
            .toThrow(new ValidationError('Category name must be at most 24 characters.'));
    });

    it('rejects a missing or blank name', () => {
        expect(() => FieldValidator.assertCategoryFields({}))
            .toThrow(new ValidationError('Category name is required.'));
        expect(() => FieldValidator.assertCategoryFields({ name: ' ' }))
            .toThrow(new ValidationError('Category name is required.'));
    });
});

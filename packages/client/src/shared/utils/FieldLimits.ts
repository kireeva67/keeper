// Keep in sync with FieldValidator in packages/server, which enforces the same limits.
export class FieldLimits {
    static readonly titleMaxLength = 120;
    static readonly descriptionMaxLength = 500;
    static readonly categoryNameMaxLength = 24;
}

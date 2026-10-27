import { prismaController } from "./PrismaController";
import { prisma } from "./prisma";
import { ValidationError } from "../error/ValidationError";

vi.mock("./prisma", () => ({
    prisma: {
        category: { findFirst: vi.fn(), delete: vi.fn() },
        product: { create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
        $transaction: vi.fn(),
    },
}));

const OTHER_ID = 42; // deliberately not 1: the id must come from the lookup

beforeEach(() => {
    vi.clearAllMocks();
});

describe('default category lookup', () => {
    it('createProduct without categoryId uses the system "Other" category found by name', async () => {
        vi.mocked(prisma.category.findFirst)
            .mockResolvedValueOnce({ id: OTHER_ID } as any)   // default lookup
            .mockResolvedValueOnce({ id: OTHER_ID } as any);  // availability check
        await prismaController.createProduct('a@x.com', { title: 't', url: 'http://t' });
        expect(prisma.category.findFirst).toHaveBeenNthCalledWith(1, {
            where: { name: 'Other', userId: null },
            select: { id: true },
        });
        expect(prisma.product.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ category: { connect: { id: OTHER_ID } } }),
        }));
    });

    it('createProduct fails clearly when the "Other" category is missing', async () => {
        vi.mocked(prisma.category.findFirst).mockResolvedValueOnce(null);
        await expect(prismaController.createProduct('a@x.com', { title: 't', url: 'http://t' }))
            .rejects.toThrow('System category "Other" is missing.');
        expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('createProduct with a categoryId skips the default lookup', async () => {
        vi.mocked(prisma.category.findFirst).mockResolvedValueOnce({ id: 5 } as any);
        await prismaController.createProduct('a@x.com', { title: 't', url: 'http://t', categoryId: 5 });
        expect(prisma.category.findFirst).toHaveBeenCalledTimes(1);
    });

    it('deleteCategory moves products to the "Other" category found by name', async () => {
        vi.mocked(prisma.category.findFirst)
            .mockResolvedValueOnce({ id: 9 } as any)          // ownership check
            .mockResolvedValueOnce({ id: OTHER_ID } as any);  // default lookup
        await prismaController.deleteCategory(9, 'a@x.com');
        expect(prisma.product.updateMany).toHaveBeenCalledWith({
            where: { categoryId: 9, user: { email: 'a@x.com' } },
            data: { categoryId: OTHER_ID },
        });
    });
});

describe('non-numeric categoryId', () => {
    it.each(['5', 1.5, true, {}])('createProduct rejects %j without querying', async (categoryId) => {
        await expect(prismaController.createProduct('a@x.com', { title: 't', url: 'http://t', categoryId: categoryId as any }))
            .rejects.toThrow(new ValidationError('Invalid category.'));
        expect(prisma.category.findFirst).not.toHaveBeenCalled();
        expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('updateProduct rejects a string categoryId', async () => {
        await expect(prismaController.updateProduct(1, 'a@x.com', { title: 't', url: 'http://t', categoryId: '5' as any }))
            .rejects.toThrow(new ValidationError('Invalid category.'));
        expect(prisma.product.update).not.toHaveBeenCalled();
    });
});

describe('updateProduct', () => {
    it('rejects a missing categoryId', async () => {
        await expect(prismaController.updateProduct(1, 'a@x.com', { title: 't', url: 'http://t' }))
            .rejects.toBeInstanceOf(ValidationError);
        expect(prisma.product.update).not.toHaveBeenCalled();
    });

    it('rejects a null categoryId', async () => {
        await expect(prismaController.updateProduct(1, 'a@x.com', { title: 't', url: 'http://t', categoryId: null as any }))
            .rejects.toBeInstanceOf(ValidationError);
    });
});

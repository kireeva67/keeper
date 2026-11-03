import { act, fireEvent, renderHook, screen } from "@testing-library/react";
import { SnackbarProvider } from "./SnackbarProvider";
import { useSnackbar, type UndoOffer } from "./useSnackbar";

let snackbar: ReturnType<typeof useSnackbar>;

const renderProvider = () => {
    snackbar = renderHook(() => useSnackbar(), { wrapper: SnackbarProvider }).result.current;
};

const offerUndo = (): UndoOffer => {
    const offer = { onUndo: vi.fn(), onDismiss: vi.fn() };
    act(() => snackbar.showUndo("Item deleted", offer));
    return offer;
};

const setVisibility = (state: DocumentVisibilityState) => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => state });
    act(() => { document.dispatchEvent(new Event("visibilitychange")); });
};

describe("SnackbarProvider undo offer", () => {
    afterEach(() => {
        vi.useRealTimers();
        setVisibility("visible");
    });

    it("Undo calls onUndo and never onDismiss", () => {
        renderProvider();
        const offer = offerUndo();

        fireEvent.click(screen.getByRole("button", { name: "Undo" }));

        expect(offer.onUndo).toHaveBeenCalledTimes(1);
        expect(offer.onDismiss).not.toHaveBeenCalled();
    });

    it("the offer is dismissed once after 5 seconds", () => {
        vi.useFakeTimers();
        renderProvider();
        const offer = offerUndo();

        act(() => vi.advanceTimersByTime(4900));
        expect(offer.onDismiss).not.toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(200));

        expect(offer.onDismiss).toHaveBeenCalledTimes(1);
        expect(offer.onUndo).not.toHaveBeenCalled();
    });

    it("a newer message dismisses the open offer", () => {
        renderProvider();
        const first = offerUndo();
        const second = offerUndo();

        expect(first.onDismiss).toHaveBeenCalledTimes(1);
        expect(second.onDismiss).not.toHaveBeenCalled();

        act(() => snackbar.showError("Something failed"));
        expect(second.onDismiss).toHaveBeenCalledTimes(1);
    });

    it("hiding the page dismisses the open offer", () => {
        renderProvider();
        const offer = offerUndo();

        setVisibility("hidden");

        expect(offer.onDismiss).toHaveBeenCalledTimes(1);
    });
});

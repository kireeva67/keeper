export class HttpError extends Error {
    protected _status: number;
    constructor(status: number, message?: string) {
        super(message ?? `HTTP ${status}`);
        this._status = status;
    }

    get status() {
        return this._status;
    }

}
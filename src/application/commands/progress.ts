export class Progress {
  private _step = 0;

  constructor(
    private readonly _total: number,
    private readonly onProgress?: (
      step: number,
      total: number,
      message: string,
      log?: string,
    ) => void,
  ) {}

  next(message: string): number {
    this._step++;
    this.onProgress?.(this._step, this._total, message);
    return this._step;
  }

  current(message: string): number {
    this.onProgress?.(this._step, this._total, message);
    return this._step;
  }

  get step(): number {
    return this._step;
  }

  get total(): number {
    return this._total;
  }
}

/**
 * 左パネルサイズを表す Value Object（パーセンテージ）。
 *
 * Main / Renderer 両プロセスから参照可能な共有ドメインモデル。
 *
 * 不変条件:
 * - 有限の数値であること（NaN, Infinity は不可）
 * - MIN 以上 MAX 以下の範囲に収まること
 *
 * バリデーション失敗時は範囲内にクランプ（丸め）する。
 * 数値以外の値が渡された場合はデフォルト値にフォールバックする。
 */
export class LeftPanelSize {
  /** 左パネルの最小サイズ (%) */
  static readonly MIN = 10;

  /** 左パネルの最大サイズ (%) */
  static readonly MAX = 30;

  /** 左パネルのデフォルトサイズ (%) */
  static readonly DEFAULT = 20;

  private constructor(private readonly value: number) {}

  /**
   * 任意の値から LeftPanelSize を生成する。
   *
   * - 数値でない / 有限でない場合 → デフォルト値
   * - MIN 未満の場合 → MIN にクランプ
   * - MAX 超過の場合 → MAX にクランプ
   */
  static create(value: unknown): LeftPanelSize {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return new LeftPanelSize(LeftPanelSize.DEFAULT);
    }

    const clamped = Math.max(LeftPanelSize.MIN, Math.min(LeftPanelSize.MAX, value));
    return new LeftPanelSize(clamped);
  }

  /** ストア保存用のプリミティブ値を返す */
  toPrimitive(): number {
    return this.value;
  }

  equals(other: LeftPanelSize): boolean {
    return this.value === other.value;
  }
}

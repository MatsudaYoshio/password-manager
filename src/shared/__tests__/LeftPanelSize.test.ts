import { LeftPanelSize } from '../domain/LeftPanelSize';

describe('LeftPanelSize', () => {
  describe('create', () => {
    it('creates_with_a_value_within_valid_range', () => {
      // Given
      const value = 20;

      // When
      const sut = LeftPanelSize.create(value);

      // Then
      expect(sut.toPrimitive()).toBe(20);
    });

    it('creates_with_MIN_boundary_value', () => {
      // Given
      const value = LeftPanelSize.MIN;

      // When
      const sut = LeftPanelSize.create(value);

      // Then
      expect(sut.toPrimitive()).toBe(10);
    });

    it('creates_with_MAX_boundary_value', () => {
      // Given
      const value = LeftPanelSize.MAX;

      // When
      const sut = LeftPanelSize.create(value);

      // Then
      expect(sut.toPrimitive()).toBe(30);
    });

    it('creates_with_a_decimal_value_within_range', () => {
      // Given
      const value = 15.5;

      // When
      const sut = LeftPanelSize.create(value);

      // Then
      expect(sut.toPrimitive()).toBe(15.5);
    });

    it('clamps_to_MIN_when_value_is_below_range', () => {
      // Given
      const value = 5;

      // When
      const sut = LeftPanelSize.create(value);

      // Then
      expect(sut.toPrimitive()).toBe(LeftPanelSize.MIN);
    });

    it('clamps_to_MIN_when_value_is_negative', () => {
      // Given
      const value = -100;

      // When
      const sut = LeftPanelSize.create(value);

      // Then
      expect(sut.toPrimitive()).toBe(LeftPanelSize.MIN);
    });

    it('clamps_to_MAX_when_value_exceeds_range', () => {
      // Given
      const value = 50;

      // When
      const sut = LeftPanelSize.create(value);

      // Then
      expect(sut.toPrimitive()).toBe(LeftPanelSize.MAX);
    });

    it('falls_back_to_DEFAULT_when_value_is_NaN', () => {
      // Given
      const value = NaN;

      // When
      const sut = LeftPanelSize.create(value);

      // Then
      expect(sut.toPrimitive()).toBe(LeftPanelSize.DEFAULT);
    });

    it('falls_back_to_DEFAULT_when_value_is_Infinity', () => {
      // Given
      const value = Infinity;

      // When
      const sut = LeftPanelSize.create(value);

      // Then
      expect(sut.toPrimitive()).toBe(LeftPanelSize.DEFAULT);
    });

    it('falls_back_to_DEFAULT_when_value_is_negative_Infinity', () => {
      // Given
      const value = -Infinity;

      // When
      const sut = LeftPanelSize.create(value);

      // Then
      expect(sut.toPrimitive()).toBe(LeftPanelSize.DEFAULT);
    });

    it('falls_back_to_DEFAULT_when_value_is_a_string', () => {
      // Given
      const value = '20';

      // When
      const sut = LeftPanelSize.create(value);

      // Then
      expect(sut.toPrimitive()).toBe(LeftPanelSize.DEFAULT);
    });

    it('falls_back_to_DEFAULT_when_value_is_null', () => {
      // When
      const sut = LeftPanelSize.create(null);

      // Then
      expect(sut.toPrimitive()).toBe(LeftPanelSize.DEFAULT);
    });

    it('falls_back_to_DEFAULT_when_value_is_undefined', () => {
      // When
      const sut = LeftPanelSize.create(undefined);

      // Then
      expect(sut.toPrimitive()).toBe(LeftPanelSize.DEFAULT);
    });

    it('falls_back_to_DEFAULT_when_value_is_a_boolean', () => {
      // When
      const sut = LeftPanelSize.create(true);

      // Then
      expect(sut.toPrimitive()).toBe(LeftPanelSize.DEFAULT);
    });
  });

  describe('equals', () => {
    it('returns_true_for_equal_values', () => {
      // Given
      const a = LeftPanelSize.create(20);
      const b = LeftPanelSize.create(20);

      // When & Then
      expect(a.equals(b)).toBe(true);
    });

    it('returns_false_for_different_values', () => {
      // Given
      const a = LeftPanelSize.create(15);
      const b = LeftPanelSize.create(25);

      // When & Then
      expect(a.equals(b)).toBe(false);
    });
  });
});

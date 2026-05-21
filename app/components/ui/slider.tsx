"use client";

import { Slider as HeroSlider } from "@heroui/react";

type SliderProps = {
  value?: number | number[];
  defaultValue?: number | number[];
  onValueChange?: (value: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
};

export function Slider({ value, defaultValue, onValueChange, min, max, step, disabled, className }: SliderProps) {
  return (
    <HeroSlider
      value={value}
      defaultValue={defaultValue}
      onChange={(v) => onValueChange?.(v)}
      minValue={min}
      maxValue={max}
      step={step}
      isDisabled={disabled}
      className={className}
    >
      <HeroSlider.Track>
        <HeroSlider.Fill />
        <HeroSlider.Thumb />
      </HeroSlider.Track>
    </HeroSlider>
  );
}

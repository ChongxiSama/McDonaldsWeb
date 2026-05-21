"use client";

import { Switch as HeroSwitch } from "@heroui/react";
import type { SwitchProps as HeroSwitchProps } from "@heroui/react";

type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: HeroSwitchProps["size"];
  className?: string;
};

export function Switch({ checked, defaultChecked, onCheckedChange, disabled, size, className }: SwitchProps) {
  return (
    <HeroSwitch
      isSelected={checked}
      defaultSelected={defaultChecked}
      onChange={onCheckedChange}
      isDisabled={disabled}
      size={size}
      className={className}
    >
      <HeroSwitch.Control>
        <HeroSwitch.Thumb />
      </HeroSwitch.Control>
    </HeroSwitch>
  );
}

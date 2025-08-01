"use client";
import React from 'react';

interface ActionButtonProps {
  icon: React.ReactNode;
  tooltipText: string;
  onClick: () => void;
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  tooltipText,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group p-1 hover:bg-[#022e79] rounded transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      title={tooltipText}
    >
      {icon}
    </button>
  );
};

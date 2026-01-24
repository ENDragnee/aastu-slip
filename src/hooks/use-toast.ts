"use client";

import * as React from "react";
import { toast as sonnerToast } from "sonner";

// Define the interface for the Action component props
interface ToastActionProps {
  children: string; // Sonner needs a string for the label
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

// Define the action element type to allow property access
type ToastActionElement = React.ReactElement<ToastActionProps>;

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  action?: ToastActionElement;
};

function toast({ title, description, variant, action, ...props }: ToastProps) {
  const toastFn = variant === "destructive" ? sonnerToast.error : sonnerToast;

  // Safely extract label and onClick from the action element if it exists
  const actionOptions = action
    ? {
        label: action.props.children,
        onClick: action.props.onClick,
      }
    : undefined;

  const id = toastFn(title, {
    description: description,
    action: actionOptions,
    ...props,
  });

  return {
    id,
    dismiss: () => sonnerToast.dismiss(id),
    update: (props: ToastProps) => toast({ ...props }),
  };
}

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
    toasts: [],
  };
}

export { useToast, toast };

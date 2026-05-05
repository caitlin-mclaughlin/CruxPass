import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/Dialog";
import { useState } from "react";
import { Ban, Save, Trash2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const destructive = confirmVariant === 'danger';

  const destructiveStyle = 'bg-accent hover:bg-accentHighlight';

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription> 
        </DialogHeader>

          {/* Actions */}
          <DialogFooter>
            <Button
              className={`${destructive
                ? ''
                : destructiveStyle
              }`}
              onClick={onCancel}
            >
              <Ban size={18}/>
              <span className="relative top-[1px]">{cancelText}</span>
            </Button>

            <Button
              className={`${destructive
                ? destructiveStyle
                : ''
              }`}
              onClick={onConfirm}
            >
              {destructive ? (
                <Trash2 size={18}/>
              ) : (
                <Save size={18} />
              )}
              <span className="relative top-[1px]">{confirmText}</span>
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

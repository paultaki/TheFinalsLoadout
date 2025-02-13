import React from 'react';
import { motion } from 'framer-motion';
import { useLoadoutStore } from '../../store/loadoutStore';
import { Copy, Check } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription
} from '@/components/ui/alert-dialog';

export const LoadoutCopy = () => {
  const { selectedLoadout } = useLoadoutStore();
  const [copied, setCopied] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);

  const handleCopy = async () => {
    if (!selectedLoadout) return;

    const text = `Class: ${selectedLoadout.class}
Weapon: ${selectedLoadout.weapon}
Specialization: ${selectedLoadout.specialization}
Gadget 1: ${selectedLoadout.gadgets[0]}
Gadget 2: ${selectedLoadout.gadgets[1]}
Gadget 3: ${selectedLoadout.gadgets[2]}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setShowDialog(true);
      setTimeout(() => {
        setCopied(false);
        setShowDialog(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!selectedLoadout) return null;

  return (
    <>
      <motion.button
        onClick={handleCopy}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700
                   transition-colors flex items-center gap-2 shadow-lg"
      >
        {copied ? <Check size={20} /> : <Copy size={20} />}
        {copied ? 'Copied!' : 'Copy Loadout'}
      </motion.button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Loadout Copied!</AlertDialogTitle>
          <AlertDialogDescription>
            Your loadout has been copied to the clipboard.
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
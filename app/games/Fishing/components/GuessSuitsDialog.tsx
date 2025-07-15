import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";
import { getSuitFullName, getSuitSymbol } from "~/utils/cardUtils";
import type { CardType } from "../types";

interface GuessSuitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAsk: {
    targetPlayerId: string;
    targetPlayerName: string;
    requestedRank: string;
    shownCards: CardType[];
  } | null;
  guessedSuits: string[];
  handleSuitToggle: (suit: string) => void;
  handleGuessSuits: () => void;
}



export default function GuessSuitsDialog({
  open,
  onOpenChange,
  currentAsk,
  guessedSuits,
  handleSuitToggle,
  handleGuessSuits,
}: GuessSuitsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-700 to-slate-600 border-white/20 max-w-sm sm:max-w-md md:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-white text-lg sm:text-xl">Guess the suits!</DialogTitle>
        </DialogHeader>
        {currentAsk && currentAsk.shownCards.length > 0 && (
          <>
            <p className="text-white/90 mb-4 sm:mb-6 text-center text-sm sm:text-base">
              {currentAsk.targetPlayerName} has {currentAsk.shownCards.length} {currentAsk.requestedRank}(s). Select the suits you think they are:
            </p>
            <p className="text-red-300 mb-4 text-center text-xs">
              ⚠️ Warning: Canceling will count as a wrong guess and end your turn!
            </p>
            <div className="mb-4 sm:mb-6 flex gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center">
              {["S", "H", "D", "C"].map(suit => (
                <motion.button
                  key={suit}
                  onClick={() => handleSuitToggle(suit)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl border-2 text-lg sm:text-xl md:text-2xl font-bold transition-all duration-200 ${
                    guessedSuits.includes(suit)
                      ? 'bg-blue-500 border-blue-400 text-white shadow-lg'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span>{getSuitSymbol(suit)}</span>
                    <span className="text-xs mt-1">{getSuitFullName(suit)}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30 w-full sm:w-auto"
          >
            Cancel (Wrong Guess)
          </Button>
          <Button 
            onClick={handleGuessSuits}
            className="bg-blue-500 text-white hover:bg-blue-600 font-bold w-full sm:w-auto"
          >
            Submit Guess
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
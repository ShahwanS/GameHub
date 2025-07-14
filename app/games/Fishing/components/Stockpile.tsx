import React from "react";
import Card from "../Card";
import type { CardType } from "../types";

interface StockpileProps {
  sets: CardType[][];
  points: number;
  isSelf?: boolean;
  className?: string;
}

export default function Stockpile({ sets, points, isSelf = false, className = "" }: StockpileProps) {
  return (
    <div
      className={
        (isSelf
          ? "w-full sm:w-56 min-w-[200px] sm:min-w-[224px] flex flex-col bg-gradient-to-br from-yellow-100/70 to-yellow-200/60 rounded-2xl p-3 sm:p-4 border border-yellow-300/40 shadow-xl items-center "
          : "bg-gradient-to-br from-yellow-100/60 to-yellow-200/40 rounded-xl p-2 border border-yellow-300/30 mb-2 w-full flex flex-col items-center ") +
        className
      }
    >
      <div className={isSelf ? "flex flex-col gap-3 w-full items-center" : "w-full flex flex-col items-center"}>
        {sets.length === 0 && isSelf && (
          <div className="text-yellow-700/60 text-sm sm:text-base text-center py-4 sm:py-6">No completed sets yet</div>
        )}
        {sets.map((set, i) => (
          <div key={i} className={isSelf ? "flex gap-1 justify-center w-full" : "flex gap-0.5 justify-center w-full mb-1"}>
            {set.map((card, j) => (
              <Card
                key={j}
                rank={card.rank as any}
                suit={card.suit as any}
                compact={true}
                style={isSelf ? { width: 28, height: 28, fontSize: 13 } : { width: 20, height: 20, fontSize: 10 }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className={isSelf ? "mt-2 sm:mt-3 flex flex-row items-center gap-1 sm:gap-2 text-yellow-800 font-bold text-sm sm:text-base" : "flex flex-row items-center gap-1 text-yellow-800 font-bold text-xs"}>
        <span>{points}</span>
        <span className={isSelf ? "text-yellow-700 font-semibold text-xs sm:text-sm" : "text-yellow-700 font-semibold text-[11px]"}>Points</span>
      </div>
    </div>
  );
} 
import React, { useState, useEffect } from "react";
import { useQuizStore } from "../state/quizStore";
import type { Question } from "../types/quiz.types";
import { isEqual } from "lodash";

const DragDrop = ({ question }: { question: Question }) => {
  const items = question.draggableItems || [];
  const zones = question.dropZones || [];
  const responses = useQuizStore((s) => s.responses);
  const defaultPositions = Object.fromEntries(
    (zones as Array<{ id: string }>).map((z) => [z.id, null])
  );
  const prev =
    responses.find((r) => r.questionId === question.id)?.response ??
    defaultPositions;
  const [positions, setPositions] = useState<{
    [zoneId: string]: string | null;
  }>(prev as { [zoneId: string]: string | null });
  useEffect(() => {
    if (!isEqual(positions, prev)) {
      setPositions(prev as { [zoneId: string]: string | null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev, question.id]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const setResponse = useQuizStore((s) => s.setResponse);
  function handleItemClick(itemId: string) {
    setSelectedItem(itemId);
  }
  function handleZoneClick(zoneId: string) {
    if (!selectedItem) return;
    const next = { ...positions };
    // Remove from any previous zone
    Object.keys(next).forEach((zid) => {
      if (next[zid] === selectedItem) next[zid] = null;
    });
    next[zoneId] = selectedItem;
    setPositions(next);
    setSelectedItem(null);
    setResponse({ questionId: question.id, response: next });
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="font-heading text-2xl font-bold mb-2 pb-4 border-b border-muted-foreground/20">
        {question.question}
      </div>
      <div className="bg-muted/60 rounded-xl p-6 shadow-lg flex flex-col gap-6">
        <div className="flex gap-4 flex-wrap">
          {(
            items as Array<{ id: string; text?: string; content?: string }>
          ).map((item) => (
            <div
              key={item.id}
              className={`rounded-lg bg-white/10 px-4 py-2 shadow cursor-pointer ${
                selectedItem === item.id
                  ? "ring-2 ring-(--primary-accent)"
                  : ""
              }`}
              onClick={() => handleItemClick(item.id)}
            >
              {item.text || item.content}
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 flex-wrap">
          {(
            zones as Array<{ id: string; text?: string; content?: string }>
          ).map((zone) => (
            <div
              key={zone.id}
              className={`rounded-lg bg-white/5 border-2 border-dashed border-(--primary-accent) w-32 h-16 flex items-center justify-center cursor-pointer ${
                positions[zone.id] ? "bg-(--primary-accent)/20" : ""
              }`}
              onClick={() => handleZoneClick(zone.id)}
            >
              {positions[zone.id]
                ? (
                    items as Array<{
                      id: string;
                      text?: string;
                      content?: string;
                    }>
                  ).find((it) => it.id === positions[zone.id])?.text ||
                  (
                    items as Array<{
                      id: string;
                      text?: string;
                      content?: string;
                    }>
                  ).find((it) => it.id === positions[zone.id])?.content
                : zone.text || zone.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DragDrop;

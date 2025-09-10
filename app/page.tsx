"use client";

import React, { useState, useMemo } from "react";

type PillarKey = "energy" | "health" | "focus" | "connection";

interface Pillar {
  key: PillarKey;
  label: string;
  clarifierQuestion: string;
  clarifiers: string[];
  questions: string[];
}

interface OutcomeSingle {
  step: "clarifier" | "outcome";
  type: "single" | "final";
  pillar: PillarKey;
  label: string;
  chosen?: string;
  text?: string;
}

interface OutcomeTie {
  step: "clarifier";
  type: "tie";
  keys: PillarKey[];
  labels: string[];
}

type Outcome = OutcomeSingle | OutcomeTie | null;

export default function ScorecardDemo() {
  const pillars: Pillar[] = useMemo(() => [
    {
      key: "energy",
      label: "Energy",
      clarifierQuestion: "When it comes to your energy, what support would help you most right now?",
      clarifiers: ["Better sleep & recovery", "Managing stress & pressure", "Boosting daily energy levels"],
      questions: [
        "I get sufficient, good-quality sleep to feel rested for work.",
        "I recover well from fatigue between workdays.",
        "I feel I have enough daily energy to sustain my performance.",
        "I am able to manage stress in a way that doesn’t overwhelm my well-being or performance.",
        "I feel resilient and optimistic when facing daily challenges (thriving).",
      ],
    },
    {
      key: "health",
      label: "Health",
      clarifierQuestion: "What support would make the biggest difference to your health right now?",
      clarifiers: ["Building strength & capacity", "Losing weight/improving body composition", "Creating consistency with healthy habits"],
      questions: [
        "I maintain regular physical activity that supports my health and performance.",
        "My strength levels allow me to handle the physical demands of life and work.",
        "I feel physically resilient and capable of sustaining effort over time.",
        "I am making progress toward my weight management or body composition goals.",
        "I feel proud of my progress and motivated to continue improving my health (thriving).",
      ],
    },
    {
      key: "focus",
      label: "Focus",
      clarifierQuestion: "What support would help you perform at your best right now?",
      clarifiers: ["Reducing distractions", "Getting clearer on priorities", "Finding motivation/flow"],
      questions: [
        "I can focus deeply on important tasks without frequent distraction.",
        "I regularly experience periods of flow or high concentration at work.",
        "I spend most of my time on tasks that feel meaningful and aligned with my role.",
        "I feel motivated and excited when working on important tasks (thriving).",
      ],
    },
    {
      key: "connection",
      label: "Connection",
      clarifierQuestion: "What kind of support would help you feel more connected at work?",
      clarifiers: ["Stronger sense of belonging with colleagues", "Greater sense of purpose in my work", "More support from leadership/organization"],
      questions: [
        "I feel a strong sense of belonging and connection with my colleagues or team.",
        "My work feels purposeful and contributes to a shared goal.",
        "I believe my organisation genuinely cares about my well-being and long-term success.",
        "I feel energised and inspired by the people I work with (thriving).",
      ],
    },
  ], []);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [currentPillarIndex, setCurrentPillarIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<PillarKey, number[]>>(() => {
    const obj: Record<PillarKey, number[]> = {} as Record<PillarKey, number[]>;
    pillars.forEach((p) => {
      obj[p.key] = new Array(p.questions.length).fill(5);
    });
    return obj;
  });

  const [clarifierOptions, setClarifierOptions] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<Outcome>(null);

  function setAnswer(pillarKey: PillarKey, idx: number, value: number) {
    setAnswers((prev) => ({
      ...prev,
      [pillarKey]: prev[pillarKey].map((v, i) => (i === idx ? value : v)),
    }));
  }

  const pillarScores = useMemo(() => {
    const scores: Record<PillarKey, number> = {} as Record<PillarKey, number>;
    pillars.forEach((p) => {
      const arr = answers[p.key] || [];
      const avg = arr.reduce((s, v) => s + v, 0) / p.questions.length;
      scores[p.key] = Math.round(avg * 2.5 * 100) / 100;
    });
    return scores;
  }, [answers, pillars]);

  const totalScore = useMemo(() => Math.round(Object.values(pillarScores).reduce((s, v) => s + v, 0) * 100) / 100, [pillarScores]);

  function computeLowestPillars() {
    const list = Object.keys(pillarScores).map((k) => {
      const pillarDef = pillars.find((p) => p.key === k as PillarKey);
      return {
        key: k as PillarKey,
        score: pillarScores[k as PillarKey],
        label: pillarDef?.label || k
      };
    });
    list.sort((a, b) => a.score - b.score);
    return list;
  }

  function handleFinishAssessment() {
    const sorted = computeLowestPillars();
    const lowest = sorted[0];
    const close = sorted.filter((s) => s.score - lowest.score <= 3);

    if (close.length === 1) {
      const pillarDef = pillars.find((p) => p.key === lowest.key);
      if (!pillarDef) throw new Error(`Pillar not found for key: ${lowest.key}`);
      setClarifierOptions(pillarDef.clarifiers);
      setOutcome({ step: "clarifier", type: "single", pillar: pillarDef.key, label: pillarDef.label });
    } else if (close.length > 1 && close.length <= 3) {
      const labels = close.map((c) => pillars.find((p) => p.key === c.key)?.label || c.key);
      setClarifierOptions(labels);
      setOutcome({ step: "clarifier", type: "tie", keys: close.map(c => c.key as PillarKey), labels });
    } else {
      const pillarDef = pillars.find((p) => p.key === "health");
      if (!pillarDef) throw new Error("Health pillar not found");
      setClarifierOptions(pillarDef.clarifiers);
      setOutcome({ step: "clarifier", type: "single", pillar: "health", label: pillarDef.label });
    }
  }

  function handleClarifierPick(choiceIndex: number) {
    if (!outcome) return;

    if (outcome.type === "tie") {
      const chosenKey = outcome.keys[choiceIndex];
      const pillarDef = pillars.find((p) => p.key === chosenKey);
      if (!pillarDef) return;
      setClarifierOptions(pillarDef.clarifiers);
      setOutcome({ step: "clarifier", type: "single", pillar: chosenKey, label: pillarDef.label });
      return;
    }

    const chosenLabel = clarifierOptions[choiceIndex];
    setOutcome({
      step: "outcome",
      type: "final",
      pillar: outcome.pillar,
      label: outcome.label,
      chosen: chosenLabel,
      text: `Your PE Score is ${Math.round(totalScore)}. Your lowest area is ${outcome.label}, specifically ${chosenLabel}. We’re going to send you some resources that will help.`,
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* ... your render code stays same ... */}
    </div>
  );
}

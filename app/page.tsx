"use client";

import React, { useState, useMemo } from "react";

// ScorecardDemo.jsx — fixed scoring (scale 0-10 -> 0-25) + clarifier step + refined outcome screen
export default function ScorecardDemo() {
  const pillars = useMemo(
    () => [
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
    ],
    []
  );

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [currentPillarIndex, setCurrentPillarIndex] = useState(null);
  const [answers, setAnswers] = useState(() => {
    const obj = {};
    pillars.forEach((p) => {
      obj[p.key] = new Array(p.questions.length).fill(5);
    });
    return obj;
  });

  const [clarifierOptions, setClarifierOptions] = useState([]);
  const [outcome, setOutcome] = useState(null);

  function setAnswer(pillarKey, idx, value) {
    setAnswers((prev) => ({ ...prev, [pillarKey]: prev[pillarKey].map((v, i) => (i === idx ? value : v)) }));
  }

  // === FIXED SCALING ===
  // average (0-10) -> scale to 0-25 by multiplying by 2.5
  const pillarScores = useMemo(() => {
    const scores = {};
    pillars.forEach((p) => {
      const arr = answers[p.key] || [];
      const avg = arr.reduce((s, v) => s + Number(v || 0), 0) / p.questions.length;
      // correct scaling: avg (0-10) * 2.5 => 0-25
      scores[p.key] = Math.round(avg * 2.5 * 100) / 100;
    });
    return scores;
  }, [answers, pillars]);

  // total is sum of four pillars (0-100)
  const totalScore = useMemo(() => Math.round(Object.values(pillarScores).reduce((s, v) => s + v, 0) * 100) / 100, [pillarScores]);

  function computeLowestPillars() {
    const list = Object.keys(pillarScores).map((k) => ({ key: k, score: pillarScores[k], label: pillars.find((p) => p.key === k).label }));
    list.sort((a, b) => a.score - b.score);
    return list;
  }

  function handleFinishAssessment() {
    const sorted = computeLowestPillars();
    const lowest = sorted[0];
    const close = sorted.filter((s) => s.score - lowest.score <= 3);

    if (close.length === 1) {
      const pillarDef = pillars.find((p) => p.key === lowest.key);
      setClarifierOptions(pillarDef.clarifiers);
      setOutcome({ step: "clarifier", type: "single", pillar: pillarDef.key, label: pillarDef.label });
    } else if (close.length > 1 && close.length <= 3) {
      setClarifierOptions(close.map((c) => pillars.find((p) => p.key === c.key).label));
      setOutcome({ step: "clarifier", type: "tie", keys: close.map((c) => c.key), labels: close.map((c) => pillars.find((p) => p.key === c.key).label) });
    } else {
      const p = pillars.find((p) => p.key === "health");
      setClarifierOptions(p.clarifiers);
      setOutcome({ step: "clarifier", type: "single", pillar: "health", label: p.label });
    }
  }

  function handleClarifierPick(choiceIndex) {
    if (!outcome) return;

    if (outcome.type === "tie") {
      const chosenKey = outcome.keys[choiceIndex];
      const pillarDef = pillars.find((p) => p.key === chosenKey);
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
      <h1 className="text-2xl font-bold mb-4">Performance & Energy Scorecard — Demo</h1>

      {/* Intro */}
      {currentPillarIndex === null && !outcome && (
        <div className="space-y-4 bg-white p-6 rounded-2xl shadow">
          <label className="block">Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" placeholder="Name" />
          <label className="block">Company</label>
          <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full p-2 border rounded" placeholder="Company" />
          <div className="mt-4 flex justify-end">
            <button onClick={() => setCurrentPillarIndex(0)} className="px-4 py-2 rounded bg-sky-600 text-white">Start Assessment</button>
          </div>
        </div>
      )}

      {/* Pillar pages */}
      {currentPillarIndex !== null && currentPillarIndex < pillars.length && !outcome && (
        <div className="mt-6 bg-white p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-bold mb-4">✨ {pillars[currentPillarIndex].label}</h2>

          {pillars[currentPillarIndex].questions.map((q, i) => (
            <div key={i} className="mb-6">
              <div className="font-medium mb-1">{q}</div>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-xs">0</div>
                <input type="range" min={0} max={10} value={answers[pillars[currentPillarIndex].key][i]} onChange={(e) => setAnswer(pillars[currentPillarIndex].key, i, Number(e.target.value))} className="flex-1" />
                <div className="text-xs">10</div>
                <div className="w-12 text-right font-bold">{answers[pillars[currentPillarIndex].key][i]}</div>
              </div>
            </div>
          ))}

          <div className="flex justify-between mt-4">
            <button disabled={currentPillarIndex === 0} onClick={() => setCurrentPillarIndex(currentPillarIndex - 1)} className="px-4 py-2 border rounded">Back</button>
            {currentPillarIndex < pillars.length - 1 ? (
              <button onClick={() => setCurrentPillarIndex(currentPillarIndex + 1)} className="px-4 py-2 bg-sky-600 text-white rounded">Next Pillar</button>
            ) : (
              <button onClick={handleFinishAssessment} className="px-4 py-2 bg-emerald-600 text-white rounded">See Clarifier</button>
            )}
          </div>
        </div>
      )}

      {/* Clarifier step */}
      {outcome?.step === "clarifier" && (
        <div className="mt-6 bg-white p-6 rounded-2xl shadow">
          {outcome.type === "single" ? (
            <>
              <h2 className="text-lg font-semibold">When it comes to your {outcome.label}, what support would help you most right now?</h2>
              <div className="mt-4 grid gap-3">
                {clarifierOptions.map((opt, i) => (
                  <button key={i} onClick={() => handleClarifierPick(i)} className="text-left p-3 border rounded hover:bg-gray-50">{opt}</button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">Your scores are balanced across multiple areas. Which would help you most right now?</h2>
              <div className="mt-4 grid gap-3">
                {clarifierOptions.map((opt, i) => (
                  <button key={i} onClick={() => handleClarifierPick(i)} className="text-left p-3 border rounded hover:bg-gray-50">{opt}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Outcome */}
      {outcome?.step === "outcome" && (
        <div className="mt-6 bg-white p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-bold">Results for {name || "You"}</h2>
          <p className="mt-2 text-gray-700">{outcome.text}</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded text-center">
              <h3 className="font-semibold">Total Score</h3>
              <div className="text-5xl font-extrabold text-sky-600">{totalScore}</div>
              <div className="text-sm text-gray-500">out of 100</div>
            </div>

            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-2">Pillar Breakdown (0–25)</h3>
              <div className="space-y-2">
                {pillars.map((p) => (
                  <div key={p.key} className="flex items-center gap-3">
                    <div className="w-24 text-sm">{p.label}</div>
                    <div className="flex-1 bg-gray-100 h-3 rounded overflow-hidden">
                      <div style={{ width: `${(pillarScores[p.key] / 25) * 100}%` }} className={`h-full ${pillarScores[p.key] === Math.min(...Object.values(pillarScores)) ? 'bg-amber-400' : 'bg-sky-500'}`}></div>
                    </div>
                    <div className="w-12 text-right">{pillarScores[p.key]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={() => { setOutcome(null); setCurrentPillarIndex(null); }} className="px-4 py-2 border rounded">Retake</button>
          </div>

          {/* Debug (visible to help testing) */}
          <div className="mt-4 text-xs text-gray-500">
            Debug — pillarScores: {JSON.stringify(pillarScores)} — totalScore: {totalScore}
          </div>
        </div>
      )}
    </div>
  );
}

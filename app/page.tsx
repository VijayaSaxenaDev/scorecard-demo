import React, { useState, useMemo } from "react";

// ScorecardDemo.jsx — Section-based per pillar navigation with logic + refined outcome screen
export default function ScorecardDemo() {
  const pillars = useMemo(
    () => [
      {
        key: "energy",
        label: "Energy",
        clarifierQuestion: "When it comes to your energy, what support would help you most right now?",
        clarifiers: [
          "Better sleep & recovery",
          "Managing stress & pressure",
          "Boosting daily energy levels",
        ],
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
        clarifiers: [
          "Building strength & capacity",
          "Losing weight / improving body composition",
          "Creating consistency with healthy habits",
        ],
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
        clarifiers: [
          "Reducing distractions",
          "Getting clearer on priorities",
          "Finding motivation / flow",
        ],
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
        clarifiers: [
          "Stronger sense of belonging with colleagues",
          "Greater sense of purpose in my work",
          "More support from leadership / organization",
        ],
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

  const [showClarifier, setShowClarifier] = useState(false);
  const [clarifierOptions, setClarifierOptions] = useState([]);
  const [clarifierQuestion, setClarifierQuestion] = useState("");
  const [outcome, setOutcome] = useState(null);

  function setAnswer(pillarKey, idx, value) {
    setAnswers((prev) => ({
      ...prev,
      [pillarKey]: prev[pillarKey].map((v, i) => (i === idx ? value : v)),
    }));
  }

  const pillarScores = useMemo(() => {
    const scores = {};
    pillars.forEach((p) => {
      const arr = answers[p.key] || [];
      const avg = arr.reduce((s, v) => s + Number(v || 0), 0) / p.questions.length;
      scores[p.key] = Math.round(avg * 2.5 * 100) / 100; // scale to 0–25
    });
    return scores;
  }, [answers, pillars]);

  const totalScore = useMemo(
    () => Math.round((Object.values(pillarScores).reduce((s, v) => s + v, 0) / 100) * 100),
    [pillarScores]
  );

  function computeLowestPillars() {
    const list = Object.keys(pillarScores).map((k) => ({
      key: k,
      score: pillarScores[k],
      label: pillars.find((p) => p.key === k).label,
    }));
    list.sort((a, b) => a.score - b.score);
    return list;
  }

  function handleSubmit() {
    const sorted = computeLowestPillars();
    const lowest = sorted[0];
    const close = sorted.filter((s) => s.score - lowest.score <= 3);

    if (close.length === 1) {
      const pillarDef = pillars.find((p) => p.key === lowest.key);
      setClarifierOptions(pillarDef.clarifiers);
      setClarifierQuestion(pillarDef.clarifierQuestion);
      setOutcome({ type: "single", pillar: pillarDef.key, label: pillarDef.label });
    } else if (close.length === 2 || close.length === 3) {
      setClarifierOptions(close.map((c) => pillars.find((p) => p.key === c.key).label));
      setClarifierQuestion(
        `Your scores are balanced across ${close.length} areas. Which would help you most right now?`
      );
      setOutcome({ type: "tie", keys: close.map((c) => c.key), labels: close.map((c) => c.label) });
    } else {
      const p = pillars.find((p) => p.key === "health");
      setClarifierOptions(p.clarifiers);
      setClarifierQuestion(p.clarifierQuestion);
      setOutcome({ type: "single", pillar: "health", label: p.label });
    }

    setShowClarifier(true);
  }

  function handleClarifierPick(choiceIndex) {
    const chosenLabel = clarifierOptions[choiceIndex];
    setOutcome((o) => ({
      ...o,
      chosen: chosenLabel,
      text: `Your PE Score is ${totalScore}/100. Your lowest area is ${o?.label || ""}, specifically ${chosenLabel}. We’re going to send you some resources that will help.`,
    }));
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Performance & Energy Scorecard — Demo</h1>

      {/* Intro screen */}
      {currentPillarIndex === null && !showClarifier && !outcome && (
        <div className="space-y-4 bg-white p-6 rounded-2xl shadow">
          <label className="block">Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Name"
          />
          <label className="block">Company</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Company"
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setCurrentPillarIndex(0)}
              className="px-4 py-2 rounded bg-sky-600 text-white"
            >
              Start Assessment
            </button>
          </div>
        </div>
      )}

      {/* Pillar question screen */}
      {currentPillarIndex !== null && currentPillarIndex < pillars.length && (
        <div className="mt-6 bg-white p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-extrabold mb-4 bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
            {pillars[currentPillarIndex].label}
          </h2>
          {pillars[currentPillarIndex].questions.map((q, i) => (
            <div key={i} className="mb-6">
              <div className="font-medium mb-1">{q}</div>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-xs">0</div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={answers[pillars[currentPillarIndex].key][i]}
                  onChange={(e) =>
                    setAnswer(pillars[currentPillarIndex].key, i, Number(e.target.value))
                  }
                  className="flex-1"
                />
                <div className="text-xs">10</div>
                <div className="w-12 text-right font-bold">
                  {answers[pillars[currentPillarIndex].key][i]}
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-between mt-4">
            <button
              disabled={currentPillarIndex === 0}
              onClick={() => setCurrentPillarIndex(currentPillarIndex - 1)}
              className="px-4 py-2 border rounded"
            >
              Back
            </button>
            {currentPillarIndex < pillars.length - 1 ? (
              <button
                onClick={() => setCurrentPillarIndex(currentPillarIndex + 1)}
                className="px-4 py-2 bg-sky-600 text-white rounded"
              >
                Next Pillar
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-emerald-600 text-white rounded"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      )}

      {/* Clarifier */}
      {showClarifier && outcome && !outcome.chosen && (
        <div className="mt-6 bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold">{clarifierQuestion}</h2>
          <div className="mt-4 grid gap-3">
            {clarifierOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  if (outcome.type === "tie") {
                    const chosenKey = outcome.keys[i];
                    const pillarDef = pillars.find((p) => p.key === chosenKey);
                    setClarifierOptions(pillarDef.clarifiers);
                    setClarifierQuestion(pillarDef.clarifierQuestion);
                    setOutcome({
                      ...outcome,
                      type: "single",
                      pillar: chosenKey,
                      label: pillarDef.label,
                    });
                  } else {
                    handleClarifierPick(i);
                  }
                }}
                className="text-left p-3 border rounded hover:bg-gray-50"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Outcome */}
      {outcome && outcome.chosen && (
        <div className="mt-6 bg-white p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-bold mb-2">Results for {name || "You"}</h2>
          <p className="mt-1 text-gray-700">{outcome.text}</p>

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
                      <div
                        style={{ width: `${(pillarScores[p.key] / 25) * 100}%` }}
                        className={`h-full ${
                          pillarScores[p.key] === Math.min(...Object.values(pillarScores))
                            ? "bg-amber-400"
                            : "bg-sky-500"
                        }`}
                      ></div>
                    </div>
                    <div className="w-12 text-right">{pillarScores[p.key]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => {
                setOutcome(null);
                setShowClarifier(false);
                setCurrentPillarIndex(null);
              }}
              className="px-4 py-2 border rounded"
            >
              Retake
            </button>
            <button
              onClick={() => {
                const data = {
                  name,
                  company,
                  totalScore,
                  pillarScores,
                  outcome,
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "scorecard-results.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-sky-600 text-white rounded"
            >
              Download JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Predefined odds ranges — shared constant
const ODDS_RANGES = [
    { label: "1.40 - 1.49", min: 1.4, max: 1.49 },
    { label: "1.50 - 1.59", min: 1.5, max: 1.59 },
    { label: "1.60 - 1.69", min: 1.6, max: 1.69 },
    { label: "1.70 - 1.79", min: 1.7, max: 1.79 },
    { label: "1.80 - 1.89", min: 1.8, max: 1.89 },
    { label: "1.90 - 1.99", min: 1.9, max: 1.99 },
    { label: "2.00 - 2.09", min: 2.0, max: 2.09 },
];

export function OddsFilterControls({
    minOdds,
    maxOdds,
    oddsType,
    onRangeChange,
    onTypeChange,
}: {
    minOdds: number;
    maxOdds: number;
    oddsType: "over" | "under";
    onRangeChange: (min: number, max: number) => void;
    onTypeChange: (type: "over" | "under") => void;
    }) {
    return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
            Odds Range
        </label>
        <select
            value={`${minOdds}-${maxOdds}`}
            onChange={(e) => {
            const [min, max] = e.target.value.split("-").map(parseFloat);
            onRangeChange(min, max);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm cursor-pointer"
        >
            {ODDS_RANGES.map((range) => (
            <option key={range.label} value={`${range.min}-${range.max}`}>
                {range.label}
            </option>
            ))}
        </select>
        </div>
        <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
            Bet Type
        </label>
        <div className="flex rounded-md border border-gray-300 overflow-hidden text-sm">
            <button
            onClick={() => onTypeChange("over")}
            className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
                oddsType === "over"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            >
            Over
            </button>
            <button
            onClick={() => onTypeChange("under")}
            className={`px-4 py-2 font-medium transition-colors border-l border-gray-300 cursor-pointer ${
                oddsType === "under"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            >
            Under
            </button>
        </div>
        </div>
    </div>
    );
}

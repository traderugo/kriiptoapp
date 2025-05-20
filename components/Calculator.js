import { useState } from "react";

export default function TradeCalculator() {
  const [capital, setCapital] = useState("");
  const [risk, setRisk] = useState("");
  const [entry, setEntry] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [leverage, setLeverage] = useState("");

  const numCapital = parseFloat(capital);
  const numRisk = parseFloat(risk);
  const numEntry = parseFloat(entry);
  const numTp = parseFloat(tp);
  const numSl = parseFloat(sl);
  const numLeverage = parseFloat(leverage);

  const canCalculate =
    numCapital > 0 &&
    numRisk > 0 &&
    numEntry > 0 &&
    numTp > 0 &&
    numSl > 0 &&
    numLeverage > 0 &&
    numEntry !== numSl;

  let margin = 0,
    RR = 0,
    ROI = 0,
    pctChange = 0,
    positionSize = 0,
    notionalSize = 0,
    absROI = 0;

  if (canCalculate) {
    const riskAmount = (numCapital * numRisk) / 100;
    const priceDiffSL = Math.abs(numEntry - numSl);
    const priceDiffTP = Math.abs(numTp - numEntry);

    positionSize = riskAmount / priceDiffSL;
    notionalSize = positionSize * numEntry;
    margin = notionalSize / numLeverage;
    RR = priceDiffTP / priceDiffSL;
    ROI = RR * numRisk;
    pctChange = ((numTp - numEntry) / numEntry) * 100;
    absROI = ((priceDiffTP * positionSize) / margin) * 100;
  }

  const resetFields = () => {
    setCapital("");
    setRisk("");
    setEntry("");
    setTp("");
    setSl("");
    setLeverage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r  to-blue-500 flex items-center justify-center ">
      <div className="bg-white rounded-lg  max-w-md w-full p-4">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Trade Calculator
        </h1>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* ... all input fields ... */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Capital
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 10000"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Risk (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 1"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Entry Price
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 1500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Take Profit Price (TP)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 1550"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Stop Loss Price (SL)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 1470"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Leverage (e.g. 10)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 10"
            />
          </div>
        </form>

        {/* Reset button below form */}
        <div className="mt-6 text-center">
          <button
            onClick={resetFields}
            type="button"
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
          >
            Reset
          </button>
        </div>
        
        {canCalculate ? (
          <div className="mt-8 bg-purple-50 rounded p-4 text-gray-800 space-y-3">
            <div>
              <strong>Direction:</strong> {pctChange.toFixed(2) ? "Long" : "Short"}
            </div>
            <div>
              <strong>Margin:</strong> {margin.toFixed(2)}
            </div>
            <div>
              <strong>Risk-Reward Ratio (RR):</strong> {RR.toFixed(2)}
            </div>
            <div>
              <strong>ROI (based on risk % and RR):</strong> {ROI.toFixed(2)}%
            </div>
            <div>
              <strong>Absolute ROI (relative to margin):</strong> {absROI.toFixed(2)}%
            </div>
            <div>
              <strong>Percentage Change in Price:</strong> {pctChange.toFixed(2)}%
            </div>
            <div>
              <strong>Position Size:</strong> {positionSize.toFixed(4)}
            </div>
            <div>
              <strong>Notional Size:</strong> {notionalSize.toFixed(2)}
            </div>
          </div>
        ) : (
          <p className="mt-6 text-center text-red-600">
            Please enter all parameters correctly (entry and SL cannot be equal).
          </p>
        )}
        <br />
        <div className="bg-purple-50 p-2 rounded-md text-gray-800 text-sm leading-relaxed">
  <h2 className="font-semibold mb-2 text-lg text-purple-700">How to use this Trade Calculator:</h2>
  <ol className="list-decimal list-inside space-y-1">
    <li>Enter your total capital — the amount of money you want to trade with.</li>
    <li>Set your risk percentage — the portion of your capital you’re willing to risk per trade (e.g., 1%).</li>
    <li>Input the entry price — the price at which you plan to enter the trade.</li>
    <li>Input the take profit (TP) price — the target price where you want to exit with a profit.</li>
    <li>Input the stop loss (SL) price — the price where you’ll exit to limit your loss.</li>
    <li>Enter your leverage — the leverage multiplier for your trade (e.g., 10x).</li>
    <li>View the results below the form after entering all parameters.</li>
    <li>Use the <strong>Reset</strong> button to clear all inputs and start fresh...</li>
  </ol>
</div>
      </div>
    </div>
  );
}

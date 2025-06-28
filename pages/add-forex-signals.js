import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LotSizeCalculator() {
  const [balance, setBalance] = useState(2000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [stopLoss, setStopLoss] = useState(20);
  const [pipValue, setPipValue] = useState(10);
  const [lotSize, setLotSize] = useState(null);

  const calculateLotSize = () => {
    const riskAmount = (balance * riskPercent) / 100;
    const lot = riskAmount / (stopLoss * pipValue);
    setLotSize(lot.toFixed(2));
  };

  return (
    <Card className="max-w-md mx-auto mt-10 p-4">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-bold text-center">Lot Size Calculator</h2>

        <div>
          <Label>Account Balance ($)</Label>
          <Input
            type="number"
            value={balance}
            onChange={(e) => setBalance(parseFloat(e.target.value))}
          />
        </div>

        <div>
          <Label>Risk %</Label>
          <Input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
          />
        </div>

        <div>
          <Label>Stop Loss (Pips)</Label>
          <Input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(parseFloat(e.target.value))}
          />
        </div>

        <div>
          <Label>Pip Value per Lot ($)</Label>
          <Input
            type="number"
            value={pipValue}
            onChange={(e) => setPipValue(parseFloat(e.target.value))}
          />
        </div>

        <Button onClick={calculateLotSize} className="w-full">Calculate</Button>

        {lotSize !== null && (
          <div className="text-center font-semibold text-lg">
            Lot Size: <span className="text-green-600">{lotSize}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

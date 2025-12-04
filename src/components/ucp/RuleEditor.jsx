import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function RuleEditor({ rules, models, onChange, onAdd, onRemove }) {
  const handleRuleChange = (index, field, value) => {
    const newRules = [...rules];
    if (field === 'choose_model') {
      newRules[index] = { ...newRules[index], choose_model: value };
    } else {
      newRules[index] = {
        ...newRules[index],
        condition: {
          ...newRules[index].condition,
          [field]: value === '' ? undefined : Number(value)
        }
      };
    }
    onChange(newRules);
  };

  return (
    <div className="space-y-4">
      {rules.map((rule, index) => (
        <Card key={index} className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Prompt Length Less Than</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={rule.condition?.prompt_length_lt ?? ''}
                    onChange={(e) => handleRuleChange(index, 'prompt_length_lt', e.target.value)}
                    className="h-9"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Prompt Length ≥</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={rule.condition?.prompt_length_gte ?? ''}
                    onChange={(e) => handleRuleChange(index, 'prompt_length_gte', e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Route To</Label>
                  <Select
                    value={rule.choose_model}
                    onValueChange={(value) => handleRuleChange(index, 'choose_model', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(index)}
                className="text-slate-400 hover:text-red-500 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        onClick={onAdd}
        className="w-full border-dashed"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Rule
      </Button>
    </div>
  );
}
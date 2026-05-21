import { ChangeEvent } from "react";
import { Button, Input } from "@heroui/react";
import { Switch } from "@/components/ui/switch";

type Rule = {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
};

type RuleItemProps = {
  rule: Rule;
  isSaved: boolean;
  onToggle: (id: string, enabled: boolean) => void | Promise<void>;
  onChangeUrl: (id: string, url: string) => void;
  onSave: (id: string) => void | Promise<void>;
};

export default function RuleItem({
  rule,
  isSaved,
  onToggle,
  onChangeUrl,
  onSave,
}: RuleItemProps) {
  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeUrl(rule.id, event.target.value);
  };

  return (
    <div className="rule-item">
      <div className="rule-top">
        <div className="rule-index">{rule.name}</div>
        <Switch
          checked={rule.enabled}
          onCheckedChange={(checked) => onToggle(rule.id, checked)}
          size="sm"
        />
      </div>
      <div className="rule-bottom">
        <Input
          value={rule.url}
          onChange={onInputChange}
          placeholder="(默认值: empty)"
          variant="secondary"
          className="flex-1 text-sm"
        />
        <Button
          isIconOnly
          size="sm"
          variant={isSaved ? "primary" : "ghost"}
          onPress={() => onSave(rule.id)}
          aria-label="save"
        >
          {isSaved ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}

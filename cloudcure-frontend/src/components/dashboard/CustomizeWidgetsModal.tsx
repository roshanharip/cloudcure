import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface CustomizeWidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleWidgets: string[];
  onSave: (widgets: string[]) => void;
}

export function CustomizeWidgetsModal({
  isOpen,
  onClose,
  visibleWidgets,
  onSave,
}: CustomizeWidgetsModalProps): React.ReactElement {
  const [localWidgets, setLocalWidgets] = useState<string[]>(visibleWidgets);

  const toggleWidget = (id: string, checked: boolean): void => {
    if (checked) {
      setLocalWidgets([...localWidgets, id]);
    } else {
      setLocalWidgets(localWidgets.filter((w) => w !== id));
    }
  };

  const handleSave = (): void => {
    onSave(localWidgets);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>Toggle visibility of dashboard widgets.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="revenue">Revenue Chart</Label>
            <Switch
              id="revenue"
              checked={localWidgets.includes('revenue')}
              onCheckedChange={(c) => {
                toggleWidget('revenue', c);
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="activity">Recent Activity</Label>
            <Switch
              id="activity"
              checked={localWidgets.includes('activity')}
              onCheckedChange={(c) => {
                toggleWidget('activity', c);
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="stats">Overview Stats</Label>
            <Switch
              id="stats"
              checked={localWidgets.includes('stats')}
              onCheckedChange={(c) => {
                toggleWidget('stats', c);
              }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

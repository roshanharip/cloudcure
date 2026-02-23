import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import {
  useGetDoctorAvailabilityQuery,
  useCreateAvailabilityMutation,
  useDeleteAvailabilityMutation,
  type Availability,
} from '@/services/availabilityApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Clock, Plus, X } from 'lucide-react';
import { logger } from '@/utils/logger';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorAvailability(): React.ReactElement {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);

  useSocket();

  const {
    data: availability = [],
    isLoading,
    refetch,
  } = useGetDoctorAvailabilityQuery(user?.id ?? '');
  const [createAvailability, { isLoading: isCreating }] = useCreateAvailabilityMutation();
  const [deleteAvailability] = useDeleteAvailabilityMutation();

  const handleAddAvailability = async (): Promise<void> => {
    if (selectedDay === null) return;

    try {
      await createAvailability({
        doctor: user?.id ?? '',
        dayOfWeek: selectedDay,
        startTime,
        endTime,
        slotDuration,
        isActive: true,
      }).unwrap();
      logger.info('Availability added');
      setSelectedDay(null);
      void refetch();
    } catch (error) {
      logger.error('Failed to add availability', error);
      alert('Failed to add availability. Please try again.');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Remove this availability slot?')) return;

    try {
      await deleteAvailability(id).unwrap();
      logger.info('Availability removed');
      void refetch();
    } catch (error) {
      logger.error('Failed to remove availability', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Availability</h1>
          <p className="text-muted-foreground mt-1">
            Set your working hours for patients to book appointments
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Availability</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Day of Week</label>
                <select
                  value={selectedDay ?? ''}
                  onChange={(e) => {
                    setSelectedDay(parseInt(e.target.value));
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select a day</option>
                  {DAYS.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Time</label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Time</label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Slot Duration (minutes)</label>
                <Input
                  type="number"
                  value={slotDuration}
                  onChange={(e) => {
                    setSlotDuration(parseInt(e.target.value));
                  }}
                  min={15}
                  max={120}
                  step={15}
                />
              </div>
              <Button
                onClick={() => void handleAddAvailability()}
                disabled={isCreating || selectedDay === null}
                className="w-full"
              >
                {isCreating ? 'Adding...' : 'Add Availability'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {availability.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No availability set</h2>
            <p className="text-muted-foreground">
              Add your working hours to allow patients to book appointments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {DAYS.map((day, dayIndex) => {
            const daySlots = availability.filter(
              (slot: Availability) => slot.dayOfWeek === dayIndex
            );

            if (daySlots.length === 0) return null;

            return (
              <Card key={dayIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {day}
                    </span>
                    <Badge variant="secondary">{daySlots.length} slot(s)</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {daySlots.map((slot: Availability) => (
                      <div
                        key={slot._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <Badge variant="outline">{slot.slotDuration} min slots</Badge>
                          {slot.isActive ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleDelete(slot._id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

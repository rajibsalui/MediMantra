"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_SLOTS = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
];

export default function ScheduleManager({ availability = [], loading = false, onSave }) {
  const [schedule, setSchedule] = useState(
    availability.length > 0
      ? availability
      : DAYS_OF_WEEK.map((day) => ({
          day,
          isAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day),
          slots: [
            {
              startTime: "09:00 AM",
              endTime: "05:00 PM",
              isBooked: false,
            },
          ],
        }))
  );

  const [activeDay, setActiveDay] = useState("Monday");

  // Handle day availability toggle
  const handleDayToggle = (day) => {
    setSchedule(
      schedule.map((item) =>
        item.day === day ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  // Add a new time slot to a day
  const addTimeSlot = (day) => {
    setSchedule(
      schedule.map((item) => {
        if (item.day === day) {
          const lastSlot = item.slots[item.slots.length - 1];
          const newStartTime = lastSlot ? lastSlot.endTime : "09:00 AM";
          
          // Calculate end time (30 minutes after start time)
          const startTimeIndex = TIME_SLOTS.indexOf(newStartTime);
          const endTimeIndex = startTimeIndex + 1 < TIME_SLOTS.length ? startTimeIndex + 1 : startTimeIndex;
          const newEndTime = TIME_SLOTS[endTimeIndex];
          
          return {
            ...item,
            slots: [
              ...item.slots,
              {
                startTime: newStartTime,
                endTime: newEndTime,
                isBooked: false,
              },
            ],
          };
        }
        return item;
      })
    );
  };

  // Remove a time slot from a day
  const removeTimeSlot = (day, index) => {
    setSchedule(
      schedule.map((item) => {
        if (item.day === day) {
          const newSlots = [...item.slots];
          newSlots.splice(index, 1);
          return {
            ...item,
            slots: newSlots,
          };
        }
        return item;
      })
    );
  };

  // Update a time slot
  const updateTimeSlot = (day, index, field, value) => {
    setSchedule(
      schedule.map((item) => {
        if (item.day === day) {
          const newSlots = [...item.slots];
          newSlots[index] = {
            ...newSlots[index],
            [field]: value,
          };
          return {
            ...item,
            slots: newSlots,
          };
        }
        return item;
      })
    );
  };

  // Save schedule changes
  const saveSchedule = () => {
    if (onSave) {
      onSave(schedule);
    }
  };

  // Render day tabs
  const renderDayTabs = () => {
    if (loading) {
      return (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {DAYS_OF_WEEK.map((_, index) => (
            <Skeleton key={index} className="h-10 w-24" />
          ))}
        </div>
      );
    }

    return (
      <Tabs
        defaultValue={activeDay}
        value={activeDay}
        onValueChange={setActiveDay}
        className="w-full"
      >
        <TabsList key="tabs-list" className="flex space-x-2 overflow-x-auto pb-2">
          {DAYS_OF_WEEK.map((day) => {
            const daySchedule = schedule.find((item) => item.day === day);
            const isAvailable = daySchedule?.isAvailable;

            return (
              <TabsTrigger
                key={day}
                value={day}
                className={`flex items-center ${
                  !isAvailable ? "opacity-50" : ""
                }`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {day}
                {isAvailable ? (
                  <CheckCircle2 className="w-3 h-3 ml-2 text-green-500" />
                ) : (
                  <XCircle className="w-3 h-3 ml-2 text-red-500" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {DAYS_OF_WEEK.map((day) => (
          <TabsContent key={day} value={day} className="mt-4">
            {renderDaySchedule(day)}
          </TabsContent>
        ))}
      </Tabs>
    );
  };

  // Render schedule for a specific day
  const renderDaySchedule = (day) => {
    const daySchedule = schedule.find((item) => item.day === day);

    if (!daySchedule) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Schedule not found for this day
          </p>
        </div>
      );
    }

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h3 className="text-lg font-medium">{day}</h3>
            <Badge
              className={`ml-3 ${
                daySchedule.isAvailable
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {daySchedule.isAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {daySchedule.isAvailable ? "Available" : "Unavailable"}
            </span>
            <Switch
              checked={daySchedule.isAvailable}
              onCheckedChange={() => handleDayToggle(day)}
            />
          </div>
        </div>

        {daySchedule.isAvailable ? (
          <>
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Time Slots
              </h4>

              {daySchedule.slots.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <select
                        className="border border-gray-200 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-800"
                        value={slot.startTime}
                        onChange={(e) =>
                          updateTimeSlot(
                            day,
                            index,
                            "startTime",
                            e.target.value
                          )
                        }
                      >
                        {TIME_SLOTS.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      <span>to</span>
                      <select
                        className="border border-gray-200 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-800"
                        value={slot.endTime}
                        onChange={(e) =>
                          updateTimeSlot(day, index, "endTime", e.target.value)
                        }
                      >
                        {TIME_SLOTS.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTimeSlot(day, index)}
                    disabled={daySchedule.slots.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addTimeSlot(day)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Time Slot
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              This day is marked as unavailable. Toggle the switch above to set
              your availability.
            </p>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-500" />
          Schedule Management
        </h2>
        <Button onClick={saveSchedule}>
          <Save className="w-4 h-4 mr-2" />
          Save Schedule
        </Button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
        <h3 className="font-medium mb-2">Schedule Overview</h3>
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const daySchedule = schedule.find((item) => item.day === day);
            return (
              <div
                key={day}
                className={`p-3 rounded-md text-center ${
                  daySchedule?.isAvailable
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                <div className="text-xs font-medium">{day.substring(0, 3)}</div>
                <div className="text-xs mt-1">
                  {daySchedule?.isAvailable
                    ? `${daySchedule.slots.length} slot${
                        daySchedule.slots.length !== 1 ? "s" : ""
                      }`
                    : "Off"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {renderDayTabs()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-3">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Availability Summary</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Available Days</span>
              <span className="font-medium">
                {schedule.filter((day) => day.isAvailable).length} / 7
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total Time Slots</span>
              <span className="font-medium">
                {schedule.reduce(
                  (total, day) => (day.isAvailable ? total + day.slots.length : total),
                  0
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Booked Slots</span>
              <span className="font-medium">
                {schedule.reduce(
                  (total, day) =>
                    day.isAvailable
                      ? total +
                        day.slots.filter((slot) => slot.isBooked).length
                      : total,
                  0
                )}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-3">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Working Hours</h3>
          </div>
          <div className="space-y-2">
            {schedule
              .filter((day) => day.isAvailable)
              .map((day) => (
                <div key={day.day} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {day.day.substring(0, 3)}
                  </span>
                  <span className="font-medium">
                    {day.slots.length > 0
                      ? `${day.slots[0].startTime} - ${
                          day.slots[day.slots.length - 1].endTime
                        }`
                      : "No slots"}
                  </span>
                </div>
              ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mr-3">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-medium">Tips</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>• Set your availability for each day of the week</p>
            <p>• Add multiple time slots for more flexibility</p>
            <p>• Remember to save your changes</p>
            <p>• Patients can only book during your available slots</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

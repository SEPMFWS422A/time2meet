"use client"
import {Calendar} from "@nextui-org/react";
import {parseDate} from "@internationalized/date";

export default function Home() {
  return (
    <div className="flex gap-x-4">
      <Calendar id="e2eCalendar" aria-label="Date (Uncontrolled)" defaultValue={parseDate(new Date().toISOString().split('T')[0])} />
    </div>
  );
}

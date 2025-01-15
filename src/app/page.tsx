"use client"
import {Calendar} from "@nextui-org/react";
import {parseDate} from "@internationalized/date";

export default function Home() {
  return (
    <div className="flex gap-x-4">
      <Calendar aria-label="Date (Uncontrolled)" defaultValue={parseDate("2025-01-15")} />
    </div>
  );
}

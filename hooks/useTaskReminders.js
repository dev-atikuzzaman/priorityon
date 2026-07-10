import { useEffect, useRef } from "react";

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowHM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/**
 * Requests notification permission once, then checks every 30s whether any
 * priority's scheduled time (or 5 minutes before it) matches the current time.
 * Only fires while this tab/app is open — no service worker or server involved.
 */
export function useTaskReminders(priorities) {
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const check = () => {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const today = todayISO();
      const current = nowHM();

      priorities.forEach((p) => {
        if (!p.time) return;
        if ((p.completed_dates || {})[today]) return;

        const [h, m] = p.time.split(":").map(Number);
        const reminderDate = new Date();
        reminderDate.setHours(h, m, 0, 0);
        reminderDate.setMinutes(reminderDate.getMinutes() - 5);
        const reminderHM = `${String(reminderDate.getHours()).padStart(2, "0")}:${String(reminderDate.getMinutes()).padStart(2, "0")}`;

        const fireKeyReminder = `${p.id}-${today}-reminder`;
        const fireKeyDue = `${p.id}-${today}-due`;

        if (reminderHM === current && !notifiedRef.current.has(fireKeyReminder)) {
          notifiedRef.current.add(fireKeyReminder);
          new Notification("৫ মিনিট পর", { body: `${p.name} — প্রস্তুত হও`, tag: fireKeyReminder });
        }
        if (p.time === current && !notifiedRef.current.has(fireKeyDue)) {
          notifiedRef.current.add(fireKeyDue);
          new Notification("এখন সময়", { body: p.name, tag: fireKeyDue });
        }
      });
    };

    const interval = setInterval(check, 30000);
    check();
    return () => clearInterval(interval);
  }, [priorities]);
}

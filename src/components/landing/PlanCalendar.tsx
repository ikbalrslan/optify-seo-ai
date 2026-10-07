import { OptifyMark } from "@/components/brand/OptifyMark";
import { cn } from "@/lib/utils";

// A static, illustrative 30-day content plan for a fictional store. It shows the product's
// core idea in one frame: one keyword-targeted article per day, published or queued.
// Labelled as an example on the page; none of this is customer data.
const KEYWORDS = [
    "desk height chart",
    "sit-stand routine",
    "cable management",
    "anti-fatigue mats",
    "monitor arm guide",
    "small-space desks",
    "standing desk height",
    "L-shaped desks",
    "desk converters",
    "ergonomic chairs",
    "walking pad desks",
    "desks for gaming",
    "dual vs single motor",
    "bamboo desktops",
    "home office lighting",
    "keyboard trays",
    "desk weight limits",
    "standing desk benefits",
    "corner desk ideas",
    "desk wobble fixes",
    "kids standing desks",
    "desk assembly tips",
    "posture when standing",
    "under-desk storage",
    "desk mats compared",
    "electric vs manual",
    "desks for two",
    "treadmill desk setup",
    "monitor risers",
    "standing desk FAQ",
];

const TODAY = 7;
const FIRST_WEEKDAY = 3; // the month starts on a Thursday (Mon = 0)
const DAYS_IN_MONTH = 31;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TOC = ["The quick answer", "Height chart by body size", "Setting your monitor height", "Common mistakes"];

type Status = "published" | "today" | "scheduled" | "empty";

function statusFor(day: number): Status {
    if (day > KEYWORDS.length) return "empty";
    if (day < TODAY) return "published";
    if (day === TODAY) return "today";
    return "scheduled";
}

export function PlanCalendar() {
    const cells: (number | null)[] = [
        ...Array.from({ length: FIRST_WEEKDAY }, () => null),
        ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <figure className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_0_var(--color-line),0_30px_60px_-30px_rgba(28,24,21,0.22)]">
                {/* App bar */}
                <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3 sm:px-5">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <OptifyMark size={18} />
                        <span className="font-lp-display text-sm font-semibold text-ink">Content plan</span>
                        <span className="hidden truncate font-lp-mono text-xs text-ink-faint sm:inline">deskcraft.example</span>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand-deep">
                        <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
                        Autopilot on
                    </span>
                </div>

                <div className="flex flex-col gap-4 p-3 sm:p-5">
                    {/* Month + legend */}
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-1">
                        <p className="font-lp-display text-lg font-bold text-ink [font-variation-settings:'wdth'_112]">
                            October <span className="font-lp-mono text-xs font-normal text-ink-faint">30 articles</span>
                        </p>
                        <ul className="flex items-center gap-4 text-xs text-ink-muted">
                            <li className="flex items-center gap-1.5">
                                <span className="h-2 w-3 rounded-[2px] bg-brand" aria-hidden="true" /> Published
                            </li>
                            <li className="flex items-center gap-1.5">
                                <span className="h-2 w-3 rounded-[2px] bg-ochre/70" aria-hidden="true" /> Scheduled
                            </li>
                        </ul>
                    </div>

                    {/* Month grid */}
                    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-line-soft bg-line-soft" role="presentation">
                        {WEEKDAYS.map((d) => (
                            <div key={d} className="bg-paper px-1.5 py-1.5 font-lp-mono text-[10px] uppercase tracking-wider text-ink-faint sm:px-2">
                                <span className="sm:hidden">{d.charAt(0)}</span>
                                <span className="hidden sm:inline">{d}</span>
                            </div>
                        ))}
                        {cells.map((day, i) => {
                            const status = day ? statusFor(day) : "empty";
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex min-h-12 flex-col gap-1 p-1.5 sm:min-h-[4.25rem] sm:p-2",
                                        day ? "bg-white" : "bg-paper/60",
                                        status === "today" && "bg-brand/[0.06] ring-1 ring-inset ring-brand"
                                    )}
                                >
                                    {day && (
                                        <span
                                            className={cn(
                                                "font-lp-mono text-[10px] tabular-nums",
                                                status === "today" ? "font-medium text-brand-deep" : "text-ink-faint"
                                            )}
                                        >
                                            {day}
                                        </span>
                                    )}
                                    {day && status !== "empty" && (
                                        <>
                                            <span
                                                className={cn(
                                                    "h-1 w-full rounded-full sm:hidden",
                                                    status === "scheduled" ? "bg-ochre/60" : "bg-brand"
                                                )}
                                                aria-hidden="true"
                                            />
                                            <span
                                                className={cn(
                                                    "hidden border-l-2 pl-1.5 text-[11px] leading-[1.25] sm:line-clamp-2",
                                                    status === "scheduled"
                                                        ? "border-ochre/60 text-ink-muted"
                                                        : "border-brand text-ink"
                                                )}
                                            >
                                                {KEYWORDS[day - 1]}
                                            </span>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Today's article */}
                    <div className="grid gap-4 rounded-md bg-paper px-4 py-4 sm:grid-cols-[1fr_auto] sm:gap-8 sm:px-5">
                        <div className="flex min-w-0 flex-col gap-2">
                            <p className="font-lp-mono text-[11px] uppercase tracking-wider text-brand-deep">
                                Oct 7 · Publishing to WordPress at 09:00
                            </p>
                            <p className="font-lp-display text-base font-semibold leading-snug text-ink [font-variation-settings:'wdth'_106] sm:text-lg">
                                How tall should a standing desk be? A height chart by body size
                            </p>
                            <p className="break-words font-lp-mono text-[11px] text-ink-faint">
                                /blog/standing-desk-height · 1,900 words
                            </p>
                        </div>
                        <div className="flex flex-col gap-1.5 border-line sm:min-w-44 sm:border-l sm:pl-6">
                            <p className="font-lp-mono text-[10px] uppercase tracking-wider text-ink-faint">Contents</p>
                            <ol className="flex flex-col gap-1 text-xs text-ink-body">
                                {TOC.map((h, i) => (
                                    <li key={h} className="flex gap-2">
                                        <span className="font-lp-mono tabular-nums text-ink-faint">{i + 1}.</span>
                                        {h}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
            <figcaption className="text-xs text-ink-faint">
                Example plan for a fictional standing-desk store. One keyword, one article, every day.
            </figcaption>
        </figure>
    );
}

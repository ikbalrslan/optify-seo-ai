export type EffectiveStatusStyle = { label: string; bg: string; text: string };

// ScheduledPost.status tracks execution state of the scheduling run (has this row been
// generated/processed yet), while ScheduledPost.publishStatus tracks whether the generated
// content should actually go live ("draft" vs "publish"). A row can finish execution
// (status: "PUBLISHED") while its content is still just a draft (publishStatus: "draft") -
// callers must combine both instead of showing raw `status` alone, or a draft that's simply
// ready for review reads as if it's already live on a real URL.
export function getEffectiveScheduledPostStatus(status: string, publishStatus: string): EffectiveStatusStyle {
    if (status === "PUBLISHED" && publishStatus === "draft") {
        return { label: "Draft Ready", bg: "bg-amber-100", text: "text-amber-700" };
    }
    switch (status) {
        case "SCHEDULED":
            return { label: "Scheduled", bg: "bg-blue-100", text: "text-blue-700" };
        case "GENERATING":
            return { label: "Generating", bg: "bg-yellow-100", text: "text-yellow-700" };
        case "PUBLISHED":
            return { label: "Published", bg: "bg-green-100", text: "text-green-700" };
        case "FAILED":
            return { label: "Failed", bg: "bg-red-100", text: "text-red-700" };
        default:
            return { label: status, bg: "bg-gray-100", text: "text-gray-700" };
    }
}

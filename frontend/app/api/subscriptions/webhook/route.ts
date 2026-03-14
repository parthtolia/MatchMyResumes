// This route delegates to the main paddle webhook handler.
// It exists because the Python backend exposed both /api/subscriptions/webhook
// and /api/paddle/webhook endpoints.
export { POST } from "@/app/api/paddle/webhook/route";

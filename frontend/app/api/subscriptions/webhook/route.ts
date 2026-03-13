// This route delegates to the main stripe webhook handler.
// It exists because the Python backend exposed both /api/subscriptions/webhook
// and /api/stripe/webhook endpoints.
export { POST } from "@/app/api/stripe/webhook/route";

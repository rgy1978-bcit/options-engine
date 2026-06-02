import { ENV } from "../_core/env";

export async function sendSlackMessage(text: string): Promise<void> {
  const webhookUrl = ENV.slackWebhookUrl;
  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    // Fail silently — never crash the app if Slack is down
  }
}

export function notifyNewUser(email: string): void {
  void sendSlackMessage(`👤 New user registered: ${email}`);
}

export function notifyTrade(
  user: string,
  side: string,
  ticker: string,
  qty: number,
  price: number
): void {
  void sendSlackMessage(
    `📈 Paper Trade: ${side} ${qty} ${ticker} @ $${price} by ${user}`
  );
}

export function notifyAIAnalysis(user: string): void {
  void sendSlackMessage(`🤖 AI portfolio analysis run for ${user}`);
}

export function notifyError(error: string, location: string): void {
  void sendSlackMessage(`🚨 Error in ${location}: ${error}`);
}

export function notifyLogin(email: string): void {
  void sendSlackMessage(`🔑 User signed in: ${email}`);
}

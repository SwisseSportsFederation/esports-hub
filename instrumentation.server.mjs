import * as Sentry from "@sentry/remix";

Sentry.init({
    dsn: "https://092a8fd8ea231b008f5dbee4db8826a7@sentry2.polylan.ch/5",
    tracesSampleRate: 1,
    autoInstrumentRemix: true
})
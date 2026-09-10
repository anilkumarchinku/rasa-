// ruleid: rasa-no-public-service-role-key
const exposedName = "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY";

// ruleid: rasa-no-service-key-in-client
const exposedSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ok: rasa-no-public-service-role-key
const publicUrlName = "NEXT_PUBLIC_SUPABASE_URL";

// ok: rasa-no-service-key-in-client
const safePublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

void exposedName;
void exposedSecret;
void publicUrlName;
void safePublicUrl;

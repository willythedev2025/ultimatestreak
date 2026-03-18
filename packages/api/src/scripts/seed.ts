import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  console.log(`Seeding contest for ${month}/${year}...`);

  // Check if contest already exists
  const { data: existing } = await supabase
    .from("contests")
    .select("id, status")
    .eq("month", month)
    .eq("year", year)
    .single();

  if (existing) {
    console.log(`Contest for ${month}/${year} already exists (id: ${existing.id}, status: ${existing.status})`);
    return;
  }

  const { data, error } = await supabase
    .from("contests")
    .insert({
      month,
      year,
      entry_fee_cents: 1000,
      prize_pool_cents: 0,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to seed contest:", error.message);
    process.exit(1);
  }

  console.log(`Contest created successfully!`);
  console.log(`  ID: ${data.id}`);
  console.log(`  Month: ${data.month}/${data.year}`);
  console.log(`  Entry fee: $${data.entry_fee_cents / 100}`);
  console.log(`  Status: ${data.status}`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

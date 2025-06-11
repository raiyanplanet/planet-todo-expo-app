// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bujmyqqtuyrvifoqbmhx.supabase.co"; // Replace with your actual URL
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1am15cXF0dXlydmlmb3FibWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTUwNTYsImV4cCI6MjA2NTIzMTA1Nn0.CETFEy4iJJc5i67ui8HviPlcGGLQMj-YrR5k0k8RLb0"; // Replace with your actual anon key

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("todos")
      .select("count", { count: "exact" });
    if (error) {
      console.error("Supabase connection error:", error);
      return false;
    }
    console.log("Supabase connected successfully");
    return true;
  } catch (err) {
    console.error("Supabase connection failed:", err);
    return false;
  }
};

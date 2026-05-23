// Supabase client — shared across all pages
const SUPABASE_URL = 'https://uicjqycjhxcpjbcjoedx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpY2pxeWNqaHhjcGpiY2pvZWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0OTIzMzMsImV4cCI6MjA5NTA2ODMzM30.iDF6VZDeWVLTeOL6WngQZ601sZQUM11e4PbrEmEBfAM';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

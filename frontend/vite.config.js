import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: [
      "2293-2409-40d1-1029-dc5c-792c-219f-bff9-f2ed.ngrok-free.app",
    ],
  },
});

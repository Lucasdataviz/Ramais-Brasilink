import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
}));
```

---

## 📋 **Configuração no Coolify:**

### **Opção 1: Com Dockerfile (Recomendado)**
1. No Coolify, adicione seu repositório GitHub
2. Escolha **"Docker"** como tipo de build
3. **Build Command:** (deixe vazio, o Dockerfile cuida)
4. **Port:** `80`
5. Variáveis de ambiente (se tiver Supabase):
```
   VITE_SUPABASE_URL=sua_url
   VITE_SUPABASE_ANON_KEY=sua_key
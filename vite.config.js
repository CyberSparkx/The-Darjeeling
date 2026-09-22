import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [
    tailwindcss(),
    glsl({
      include: [
        '**/*.glsl', '**/*.wgsl',
        '**/*.vert', '**/*.frag',
        '**/*.vs', '**/*.fs'
      ],
      defaultExtension: 'glsl',
      warnDuplicatedImports: true,
      compress: false,
      watch: true
    })
  ],
  server: {
    port: 5173,
    open: true
  }
});

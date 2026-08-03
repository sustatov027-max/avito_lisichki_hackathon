import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
	resolve: {
		alias: {
			'@pages': resolve(import.meta.dirname, 'src/pages'),
			'@widgets': resolve(import.meta.dirname, 'src/widgets'),
			'@features': resolve(import.meta.dirname, 'src/features'),
			'@entities': resolve(import.meta.dirname, 'src/entities'),
			'@shared': resolve(import.meta.dirname, 'src/shared')
		}
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use "@shared/styles/helpers" as *;\n`
			}
		}
	}
})

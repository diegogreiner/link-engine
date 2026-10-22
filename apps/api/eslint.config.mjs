import tseslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	globalIgnores([
		"dist/**",
		"coverage/**",
		"generated/**",
		".turbo/**",
		"openapi.json",
	]),
	...tseslint.configs["flat/recommended"],
	{
		files: ["src/**/*.ts", "scripts/**/*.ts", "prisma.config.ts"],
		rules: {
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
	prettier,
]);

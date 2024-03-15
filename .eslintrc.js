/**@type {import('eslint').Linter.Config} */
// eslint-disable-next-line no-undef
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		"@typescript-eslint",
	],
    
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		'@typescript-eslint/no-unused-vars': [
            'warn',
            {
              varsIgnorePattern: '.*', // TS already enforces this
              args: 'none',
              ignoreRestSiblings: true,
            },
          ],
          'no-unused-vars': 'off',
          'unused-imports/no-unused-vars': 'off',
          'no-constant-condition': ['error', { checkLoops: false }],
          'no-dupe-class-members': 'off',
          'no-redeclare': 'off',
          'prefer-rest-params': 'off',
          '@typescript-eslint/no-inferrable-types': ['warn', { ignoreParameters: true }],
          '@typescript-eslint/no-non-null-assertion': 'off',
          '@typescript-eslint/no-unsafe-assignment': 'off',
          "@typescript-eslint/no-explicit-any": "off",
	}
};